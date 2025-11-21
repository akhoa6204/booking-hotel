// controllers/roomTypes.controller.ts
import { prisma } from "../lib/prisma.js";
import { success, bad } from "../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../utils/pagination.js";

/**
 * Helper: chuẩn hoá input amenities
 * Chấp nhận:
 *  - [1, 2, 3]
 *  - ["1", "2"]
 *  - [{ amenityId: 1 }, { amenityId: 2 }]
 */
function normalizeAmenityIds(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const ids = arr
    .map((a) => {
      if (a == null) return null;
      if (typeof a === "number" || typeof a === "string") {
        const n = Number(a);
        return Number.isFinite(n) ? n : null;
      }
      if (typeof a === "object" && "amenityId" in a) {
        const n = Number(a.amenityId);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    })
    .filter((v) => Number.isInteger(v) && v > 0);

  // loại trùng
  return Array.from(new Set(ids));
}

/**
 * Helper: gom ảnh mới cho RoomType từ body + files
 * - body.images:
 *    + có thể là mảng string
 *    + hoặc JSON string
 *    + hoặc chuỗi "url1,url2,..."
 * - files: do multer upload
 * - bỏ qua url dạng blob:
 */
function collectNewRoomTypeImages(req, roomTypeId) {
  const base = `${req.protocol}://${req.get("host")}`;
  const out = [];

  // 1) body.images (URL string)
  let bodyImages = [];
  const raw = req.body.images;

  if (Array.isArray(raw)) {
    bodyImages = raw;
  } else if (typeof raw === "string" && raw.trim()) {
    try {
      bodyImages = JSON.parse(raw);
    } catch {
      bodyImages = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  const urls = Array.from(
    new Set(
      bodyImages.filter((u) => typeof u === "string" && !u.startsWith("blob:"))
    )
  );

  urls.forEach((url, i) => {
    out.push({
      roomTypeId,
      url,
      sortOrder: i,
    });
  });

  // 2) FILE UPLOAD – FOLDER room-type
  const files = Array.isArray(req.files) ? req.files : [];
  files.forEach((f, i) => {
    out.push({
      roomTypeId,
      url: `${base}/uploads/room-type/${f.filename}`,
      alt: f.originalname,
      sortOrder: urls.length + i,
    });
  });

  // 3) sort + primary
  out
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((it, idx) => {
      it.sortOrder = idx;
      it.isPrimary = idx === 0;
    });

  return out;
}

/** POST /api/room-types/admin */
export async function createRoomType(req, res) {
  try {
    const {
      hotelId = 1,
      name,
      basePrice,
      capacity = 2,
      description,
      amenities,
    } = req.body || {};
    if (!hotelId || !name || !basePrice)
      return bad(res, "hotelId, name, basePrice là bắt buộc", 400);

    const amenityIds = normalizeAmenityIds(amenities);

    const data = await prisma.$transaction(async (tx) => {
      const rt = await tx.roomType.create({
        data: {
          hotelId: Number(hotelId),
          name: String(name).trim(),
          basePrice: Number(basePrice),
          capacity: Number(capacity),
          description,
        },
      });

      // amenities
      if (amenityIds.length) {
        await tx.roomTypeAmenity.createMany({
          data: amenityIds.map((amenityId) => ({
            roomTypeId: rt.id,
            amenityId,
          })),
          skipDuplicates: true,
        });
      }

      // images
      const imagesToInsert = collectNewRoomTypeImages(req, rt.id);
      if (imagesToInsert.length) {
        await tx.roomTypeImage.createMany({
          data: imagesToInsert,
        });
      }

      return rt;
    });

    return success(res, data, "Tạo loại phòng thành công", 201);
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

/** GET /api/room-types/admin (admin/staff) */
export async function listRoomTypes(req, res) {
  try {
    const hotelId = req.query.hotelId ? Number(req.query.hotelId) : 1;
    const q = String(req.query.q || "").trim();
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 6 });

    const where = {
      hotelId,
      active: true,
      ...(q
        ? {
            OR: [{ name: { contains: q } }, { description: { contains: q } }],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.roomType.findMany({
        where,
        orderBy: { id: "desc" },
        include: {
          amenities: {
            include: { amenity: true },
          },
          rooms: { select: { id: true, name: true, status: true } },
          images: {
            orderBy: [
              { isPrimary: "desc" },
              { sortOrder: "asc" },
              { id: "asc" },
            ],
          },
        },
        skip,
        take: limit,
      }),
      prisma.roomType.count({ where }),
    ]);

    const normalizedItems = items.map((rt) => ({
      ...rt,
      amenities: rt.amenities.map((a) => a.amenity),
    }));

    return success(res, {
      items: normalizedItems,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

/** GET /api/room-types/customer (guest listing) */
export async function listRoomTypesForGuest(req, res) {
  try {
    const hotelId = Number(req.query.hotelId ?? 1);
    const q = String(req.query.q ?? "").trim();
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 10), 100);
    const skip = (page - 1) * limit;

    const capacity = req.query.capacity
      ? Number(req.query.capacity)
      : undefined;
    const sort = req.query.sort ?? "price-asc";

    const checkInRaw = req.query.checkIn;
    const checkOutRaw = req.query.checkOut;

    let dateFilter = {};
    if (checkInRaw && checkOutRaw) {
      const startDate = new Date(checkInRaw);
      const endDate = new Date(checkOutRaw);

      if (
        Number.isFinite(startDate.getTime()) &&
        Number.isFinite(endDate.getTime()) &&
        startDate < endDate
      ) {
        // Chỉ lấy roomType có ÍT NHẤT 1 phòng còn trống trong khoảng này
        dateFilter = {
          rooms: {
            some: {
              active: true,
              status: "AVAILABLE",
              bookings: {
                none: {
                  status: { in: ["CONFIRMED", "CHECKED_IN"] },
                  AND: [
                    { checkIn: { lt: endDate } },
                    { checkOut: { gt: startDate } },
                  ],
                },
              },
            },
          },
        };
      }
    }

    const orderBy =
      sort === "price-desc"
        ? [{ basePrice: "desc" }, { id: "desc" }]
        : [{ basePrice: "asc" }, { id: "desc" }];

    const where = {
      hotelId,
      active: true,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(capacity && { capacity: { gte: capacity } }),
      ...dateFilter,
    };

    const [rows, total] = await Promise.all([
      prisma.roomType.findMany({
        where,
        orderBy,
        include: {
          amenities: {
            include: { amenity: true },
          },
          images: {
            select: {
              id: true,
              url: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: [
              { isPrimary: "desc" },
              { sortOrder: "asc" },
              { id: "asc" },
            ],
            take: 1,
          },
        },
        skip,
        take: limit,
      }),
      prisma.roomType.count({ where }),
    ]);

    const items = rows.map(({ images, ...rest }) => ({
      ...rest,
      image: images?.[0]?.url ?? null,
    }));

    return success(res, { items, meta: { page, limit, total } });
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

/** GET /api/room-types/customer/:id (guest detail) */
export async function getRoomTypeForGuest(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return bad(res, "Thiếu ID loại phòng", 400);

    const roomType = await prisma.roomType.findUnique({
      where: { id, active: true },
      include: {
        amenities: {
          include: { amenity: true },
        },
        images: {
          select: { id: true, url: true, isPrimary: true, sortOrder: true },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!roomType) return bad(res, "Không tìm thấy loại phòng", 404);

    const data = {
      id: roomType.id,
      name: roomType.name,
      description: roomType.description,
      capacity: roomType.capacity,
      basePrice: Number(roomType.basePrice ?? 0),
      amenities: roomType.amenities.map((amenity) => amenity.amenity),
      images: roomType.images,
    };

    return success(res, data);
  } catch (e) {
    return bad(res, e.message || "Lỗi máy chủ", 500);
  }
}

/** GET /api/room-types/admin/:id (admin/staff) */
export async function getRoomType(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);
    const isManager = req.user?.role === "MANAGER";

    const rt = await prisma.roomType.findUnique({
      where: { id },
      include: {
        amenities: {
          select: {
            amenity: {
              select: { id: true, code: true, label: true },
            },
          },
        },
        rooms: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!rt) return bad(res, "Không tìm thấy loại phòng", 404);
    if (!isManager && rt.active === false)
      return bad(res, "Không tìm thấy loại phòng", 404);

    // flat amenities: trả về [{id,code,label}]
    const data = {
      ...rt,
      amenities: rt.amenities.map((a) => a.amenity).filter(Boolean),
    };

    return success(res, data);
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

/** PUT /api/room-types/admin/:id */
export async function updateRoomType(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const { name, basePrice, capacity, description, amenities } =
      req.body || {};

    // parse imageIds giữ lại (id ảnh cũ)
    let keepIds = [];
    const rawIds = req.body.imageIds;

    if (Array.isArray(rawIds)) {
      keepIds = rawIds.map(Number).filter(Number.isFinite);
    } else if (typeof rawIds === "string" && rawIds.trim()) {
      try {
        const parsed = JSON.parse(rawIds);
        if (Array.isArray(parsed)) {
          keepIds = parsed.map(Number).filter(Number.isFinite);
        }
      } catch {
        keepIds = rawIds
          .split(",")
          .map((s) => Number(s.trim()))
          .filter(Number.isFinite);
      }
    }

    const newImages = collectNewRoomTypeImages(req, id);

    const updated = await prisma.$transaction(async (tx) => {
      const rt = await tx.roomType.update({
        where: { id },
        data: {
          ...(name != null ? { name: String(name).trim() } : {}),
          ...(basePrice != null ? { basePrice: Number(basePrice) } : {}),
          ...(capacity != null ? { capacity: Number(capacity) } : {}),
          ...(description != null ? { description } : {}),
        },
      });

      // amenities: set lại toàn bộ nếu client gửi
      if (amenities !== undefined) {
        const desiredAmenityIds = normalizeAmenityIds(amenities);

        await tx.roomTypeAmenity.deleteMany({
          where: {
            roomTypeId: id,
            ...(desiredAmenityIds.length
              ? { amenityId: { notIn: desiredAmenityIds } }
              : {}),
          },
        });

        if (desiredAmenityIds.length) {
          await tx.roomTypeAmenity.createMany({
            data: desiredAmenityIds.map((amenityId) => ({
              roomTypeId: id,
              amenityId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // images
      if (keepIds.length) {
        await tx.roomTypeImage.deleteMany({
          where: { roomTypeId: id, id: { notIn: keepIds } },
        });
      } else {
        await tx.roomTypeImage.deleteMany({ where: { roomTypeId: id } });
      }

      if (newImages.length) {
        await tx.roomTypeImage.createMany({
          data: newImages,
          skipDuplicates: true,
        });
      }

      return rt;
    });

    return success(res, updated, "Cập nhật loại phòng thành công");
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

/** DELETE /api/room-types/admin/:id (soft delete) */
export async function deleteRoomType(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const rt = await prisma.roomType.findUnique({
      where: { id },
      select: { id: true, active: true },
    });
    if (!rt) return bad(res, "Loại phòng không tồn tại", 404);

    const roomCount = await prisma.room.count({
      where: { roomTypeId: id },
    });
    if (roomCount > 0) {
      return bad(
        res,
        `Không thể xóa loại phòng: còn ${roomCount} phòng đang sử dụng`,
        409
      );
    }

    await prisma.roomType.update({
      where: { id },
      data: { active: false, updatedAt: new Date() },
    });

    return success(res, null, "Xóa loại phòng thành công");
  } catch (e) {
    return bad(res, e.message ?? "Lỗi hệ thống", 500);
  }
}

export async function getReviewsByRoomType(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    const id = Number(req.params.id ?? req.query.id ?? 0);
    if (!id) return bad(res, "roomTypeId không hợp lệ", 400);

    const hotelId = 1;

    const where = {
      status: "PUBLISHED",
      room: {
        roomTypeId: id,
        hotelId,
      },
    };

    const [total, rows] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          room: { select: { id: true, name: true } },
          user: { select: { id: true, fullName: true } },
          customer: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      overall: r.overall,
      amenities: r.amenities,
      cleanliness: r.cleanliness,
      comfort: r.comfort,
      locationScore: r.locationScore,
      valueForMoney: r.valueForMoney,
      hygiene: r.hygiene,
      comment: r.comment,
      createdAt: r.createdAt,
      room: r.room,
      displayName: r.customer?.fullName || r.user?.fullName || "Khách",
    }));

    const meta = buildOffsetMeta({ page, limit, total });

    return success(res, { items, meta });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function getReviewStatsByRoomType(req, res) {
  try {
    const id = Number(req.params.id ?? req.query.id ?? 0);
    if (!id) return bad(res, "roomTypeId không hợp lệ", 400);

    const hotelId = 1;

    const where = {
      status: "PUBLISHED",
      room: {
        roomTypeId: id,
        hotelId,
      },
    };

    const [agg, total] = await Promise.all([
      prisma.review.aggregate({
        where,
        _avg: {
          overall: true,
          amenities: true,
          cleanliness: true,
          comfort: true,
          locationScore: true,
          valueForMoney: true,
          hygiene: true,
        },
      }),
      prisma.review.count({ where }),
    ]);

    const round1 = (v) => (v == null ? null : Math.round(Number(v) * 10) / 10);

    const stats = {
      total,
      average: {
        overall: round1(agg._avg.overall),
        amenities: round1(agg._avg.amenities),
        cleanliness: round1(agg._avg.cleanliness),
        comfort: round1(agg._avg.comfort),
        locationScore: round1(agg._avg.locationScore),
        valueForMoney: round1(agg._avg.valueForMoney),
        hygiene: round1(agg._avg.hygiene),
      },
    };

    return success(res, stats);
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

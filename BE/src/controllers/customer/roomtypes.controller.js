import { prisma } from "../../lib/prisma.js";
import { success, bad } from "../../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../../utils/pagination.js";

export async function list(req, res) {
  try {
    const {
      hotelId = 1,
      q,
      capacity,
      checkIn,
      checkOut,
      sort,
    } = req.query || {};
    const capacityNum = capacity ? Number(capacity) : undefined;
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    let dateFilter = {};
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);

      if (
        Number.isFinite(startDate.getTime()) &&
        Number.isFinite(endDate.getTime()) &&
        startDate < endDate
      ) {
        dateFilter = {
          rooms: {
            some: {
              isActive: true,
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
      isActive: true,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(capacityNum ? { capacity: { gte: capacityNum } } : {}),
      ...dateFilter,
    };

    const [rows, total] = await Promise.all([
      prisma.roomType.findMany({
        where,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          capacity: true,
          basePrice: true,
          amenities: {
            select: {
              amenity: { select: { id: true, code: true, label: true } },
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              isPrimary: true,
            },
            orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
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
    const meta = buildOffsetMeta({ page, limit, total });

    return success(res, { items, meta });
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

export async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return bad(res, "Thiếu ID loại phòng", 400);

    const roomType = await prisma.roomType.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        capacity: true,
        basePrice: true,
        amenities: {
          select: {
            amenity: { select: { id: true, code: true, label: true } },
          },
        },
        images: {
          select: { id: true, url: true, isPrimary: true },
          orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
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
      images: roomType.images.map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
      })),
    };

    return success(res, data);
  } catch (e) {
    return bad(res, e.message || "Lỗi máy chủ", 500);
  }
}

export async function getReviews(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    const id = Number(req.params.id ?? req.query.id ?? 0);
    if (!id) return bad(res, "roomTypeId không hợp lệ", 400);

    const where = {
      status: "PUBLISHED",
      room: {
        roomTypeId: id,
      },
    };

    const [total, rows] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          room: { select: { id: true } },
          user: { select: { id: true, fullName: true } },
          customer: {
            select: { id: true, user: { select: { fullName: true } } },
          },
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
      displayName: r.customer?.user?.fullName || r.user?.fullName || "Khách",
    }));

    const meta = buildOffsetMeta({ page, limit, total });

    return success(res, { items, meta });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function getReviewStats(req, res) {
  try {
    const id = Number(req.params.id ?? req.query.id ?? 0);
    if (!id) return bad(res, "roomTypeId không hợp lệ", 400);

    const where = {
      status: "PUBLISHED",
      room: {
        roomTypeId: id,
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

    const round = (v) => (v == null ? null : Math.round(Number(v) * 10) / 10);

    const stats = {
      total,
      average: {
        overall: round(agg._avg.overall),
        amenities: round(agg._avg.amenities),
        cleanliness: round(agg._avg.cleanliness),
        comfort: round(agg._avg.comfort),
        locationScore: round(agg._avg.locationScore),
        valueForMoney: round(agg._avg.valueForMoney),
        hygiene: round(agg._avg.hygiene),
      },
    };

    return success(res, stats);
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

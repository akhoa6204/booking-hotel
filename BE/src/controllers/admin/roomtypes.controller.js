import { prisma } from "../../lib/prisma.js";
import { success, bad } from "../../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../../utils/pagination.js";
import { collectNewImages } from "../../utils/collectNewImages.js";
import { normalizeIdArray } from "../../utils/normalizeIdArray.js";

export async function create(req, res) {
  try {
    const {
      name,
      basePrice,
      capacity = 2,
      description,
      amenities,
    } = req.body || {};
    if (!name || !basePrice)
      return bad(res, "name, basePrice là bắt buộc", 400);

    const roomTypesCount = await prisma.roomType.count({
      where: { isActive: true },
    });
    if (roomTypesCount > 5) {
      return bad(res, "Đã đủ số lượng loại phòng", 400);
    }

    const data = await prisma.$transaction(async (tx) => {
      const rt = await tx.roomType.create({
        data: {
          name: String(name).trim(),
          basePrice: Number(basePrice),
          capacity: Number(capacity),
          description,
        },
      });
      const amenityIds = normalizeIdArray(amenities);
      if (amenityIds.length) {
        await tx.roomTypeAmenity.createMany({
          data: amenityIds.map((amenityId) => ({
            roomTypeId: rt.id,
            amenityId,
          })),
          skipDuplicates: true,
        });
      }

      const imagesToInsert = collectNewImages(req, {
        ownerId: rt.id,
        idField: "roomTypeId",
        folderName: "room-types",
      });

      const imagesData = imagesToInsert.map(({ sortOrder, url, ...rest }) => ({
        ...rest,
        url,
      }));

      if (imagesToInsert.length) {
        await tx.roomTypeImage.createMany({
          data: imagesData,
        });
      }

      return rt;
    });

    return success(res, data, "Tạo loại phòng thành công", 201);
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

export async function list(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 6 });

    const where = {
      isActive: true,
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
        select: {
          id: true,
          name: true,
          basePrice: true,
          capacity: true,
          description: true,
          isActive: true,
          amenities: {
            include: {
              amenity: { select: { id: true, code: true, label: true } },
            },
          },
          images: {
            select: { id: true, url: true, isPrimary: true },
            orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
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

export async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const rt = await prisma.roomType.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        basePrice: true,
        capacity: true,
        description: true,
        isActive: true,
        amenities: {
          select: {
            amenity: {
              select: { id: true, code: true, label: true },
            },
          },
        },
        images: {
          select: { id: true, url: true, isPrimary: true },
          orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
        },
      },
    });

    if (!rt) return bad(res, "Không tìm thấy loại phòng", 404);

    const data = {
      ...rt,
      amenities: rt.amenities.map((a) => a.amenity).filter(Boolean),
    };

    return success(res, data);
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const { name, basePrice, capacity, description, amenities, imageIds } =
      req.body || {};

    const keepIds = normalizeIdArray(imageIds);

    const newImages = collectNewImages(req, {
      ownerId: id,
      idField: "roomTypeId",
      folderName: "room-types",
    });

    const newImagesData = newImages.map(({ sortOrder, url, ...rest }) => ({
      ...rest,
      url: url,
    }));

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

      if (amenities !== undefined) {
        const desiredAmenityIds = normalizeIdArray(amenities);

        await tx.roomTypeAmenity.deleteMany({
          where: { roomTypeId: id },
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

      if (keepIds.length) {
        await tx.roomTypeImage.deleteMany({
          where: { roomTypeId: id, id: { notIn: keepIds } },
        });
      } else {
        await tx.roomTypeImage.deleteMany({ where: { roomTypeId: id } });
      }

      if (newImages.length) {
        await tx.roomTypeImage.createMany({
          data: newImagesData,
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

export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const rt = await prisma.roomType.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!rt) return bad(res, "Loại phòng không tồn tại", 404);

    const roomCount = await prisma.room.count({
      where: { roomTypeId: id },
    });
    if (roomCount > 0) {
      return bad(
        res,
        `Không thể xóa loại phòng: còn ${roomCount} phòng đang sử dụng`,
        409,
      );
    }

    await prisma.roomType.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });

    return success(res, null, "Xóa loại phòng thành công");
  } catch (e) {
    return bad(res, e.message ?? "Lỗi hệ thống", 500);
  }
}

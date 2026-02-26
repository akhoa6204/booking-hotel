import { prisma } from "../../lib/prisma.js";
import { bad, success } from "../../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../../utils/pagination.js";

function normalizeRoomType(roomType) {
  const { id, name, basePrice, capacity, images, amenities } = roomType;

  const flatImages = images.map((image) => ({
    url: image.url,
    alt: image.alt,
    isPrimary: image.isPrimary,
  }));
  const flatAmenities = amenities.map((a) => ({
    id: a.amenity.id,
    code: a.amenity.code,
    label: a.amenity.label,
  }));
  return {
    id,
    name,
    basePrice,
    capacity,
    images: flatImages,
    amenities: flatAmenities,
  };
}

export async function list(req, res) {
  try {
    const { roomTypeId, q } = req.query;

    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 6 });

    const where = {
      ...(roomTypeId ? { roomTypeId: Number(roomTypeId) } : {}),
      ...(q ? { name: { contains: q } } : {}),
      isActive: true,
      roomType: { isActive: true },
    };

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        select: {
          id: true,
          name: true,
          status: true,
          roomType: {
            include: {
              images: true,
              amenities: { include: { amenity: true } },
            },
          },
        },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.room.count({ where }),
    ]);
    const normalizeRooms = rooms.map((room) => ({
      ...room,
      roomType: normalizeRoomType(room.roomType),
    }));
    return success(res, {
      items: normalizeRooms,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    return bad(res, e.message || "Lỗi máy chủ", 500);
  }
}

export async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return bad(res, "ID không hợp lệ", 400);

    const room = await prisma.room.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        status: true,
        roomType: {
          include: {
            images: true,
            amenities: {
              include: { amenity: true },
            },
          },
        },
      },
    });

    if (!room) return bad(res, "Không tìm thấy phòng", 404);

    return success(res, {
      ...{
        ...room,
        roomType: normalizeRoomType(room.roomType),
      },
    });
  } catch (error) {
    return bad(res, error.message || "Lỗi máy chủ", 500);
  }
}

export async function create(req, res) {
  try {
    const { roomTypeId, name } = req.body;
    if (!roomTypeId || !name) return bad(res, "Thiếu thông tin bắt buộc", 400);

    const room = await prisma.room.create({
      data: {
        roomTypeId: Number(roomTypeId),
        name: String(name).trim(),
      },
    });

    return success(res, room, "Tạo phòng thành công");
  } catch (e) {
    return bad(res, e.message || "Lỗi máy chủ", 500);
  }
}

/* -------------------- Cập nhật phòng -------------------- */
export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const { name, status, roomTypeId } = req.body;

    const roomUpdate = {
      ...(name != null ? { name: String(name).trim() } : {}),
      ...(status != null ? { status } : {}),
      ...(roomTypeId != null ? { roomTypeId: Number(roomTypeId) } : {}),
    };

    if (!Object.keys(roomUpdate).length) {
      return success(res, null, "Cập nhật phòng thành công");
    }

    await prisma.room.update({
      where: { id },
      data: roomUpdate,
    });

    return success(res, null, "Cập nhật phòng thành công");
  } catch (e) {
    return bad(res, e.message || "Lỗi máy chủ", 500);
  }
}

/* -------------------- Vô hiệu / Khôi phục phòng -------------------- */
export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return bad(res, "Phòng không tồn tại", 404);

    await prisma.room.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });

    return success(res, null, "Xóa phòng thành công");
  } catch (e) {
    return bad(res, e.message ?? "Lỗi không xác định", 500);
  }
}

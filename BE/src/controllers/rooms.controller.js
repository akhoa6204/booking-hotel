// controllers/rooms.controller.ts
import { prisma } from "../lib/prisma.js";
import { bad, success } from "../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../utils/pagination.js";

/* -------------------- Lấy danh sách phòng -------------------- */
export async function listRooms(req, res) {
  try {
    let hotelId = Number(req.query.hotelId);
    const roomTypeId = req.query.roomTypeId
      ? Number(req.query.roomTypeId)
      : undefined;
    const q = String(req.query.q || "").trim();
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 6 });
    const isManager = req.user?.role === "MANAGER";

    if (!hotelId || Number.isNaN(hotelId)) hotelId = 1;

    const existedHotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { id: true },
    });

    const where = {
      ...(existedHotel ? { hotelId } : {}),
      ...(roomTypeId ? { roomTypeId } : {}),
      ...(q ? { name: { contains: q } } : {}),
      ...(!isManager ? { active: true, roomType: { active: true } } : {}),
    };

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: {
          roomType: {
            include: {
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
              amenities: {
                include: { amenity: true }, // Lấy info amenity
              },
            },
          },
        },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.room.count({ where }),
    ]);

    // Map lại dữ liệu (flatten amenities + thêm image)
    const items = rooms.map((r) => {
      const cover = r.roomType?.images?.[0];

      // flatten amenities
      const flatAmenities =
        r.roomType?.amenities?.map((a) => ({
          id: a.amenity.id,
          code: a.amenity.code,
          label: a.amenity.label,
        })) ?? [];

      return {
        ...r,
        image: cover?.url ?? null,
        amenities: flatAmenities,
      };
    });

    return success(res, {
      items,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    return bad(res, e.message || "Lỗi máy chủ", 500);
  }
}

/* -------------------- Lấy chi tiết phòng -------------------- */
export async function getRoom(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return bad(res, "ID không hợp lệ", 400);

    const isManager = req.user?.role === "MANAGER";

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        roomType: {
          include: {
            amenities: {
              include: { amenity: true },
            },
          },
        },
      },
    });

    if (!room) return bad(res, "Không tìm thấy phòng", 404);
    if (!isManager && (!room.active || !room.roomType?.active))
      return bad(res, "Không tìm thấy phòng", 404);

    // ===== Flatten amenities =====
    const flatAmenities =
      room.roomType?.amenities?.map((a) => ({
        id: a.amenity.id,
        code: a.amenity.code,
        label: a.amenity.label,
      })) ?? [];

    return success(res, {
      ...room,
      amenities: flatAmenities,
    });
  } catch (error) {
    return bad(res, error.message || "Lỗi máy chủ", 500);
  }
}

/* -------------------- Tạo phòng -------------------- */
export async function createRoom(req, res) {
  try {
    const { hotelId, roomTypeId, name, description, status } = req.body;
    if (!hotelId || !roomTypeId || !name)
      return bad(res, "Thiếu thông tin bắt buộc", 400);

    const room = await prisma.room.create({
      data: {
        hotelId: Number(hotelId),
        roomTypeId: Number(roomTypeId),
        name: String(name).trim(),
        description,
        status: status || "AVAILABLE",
      },
    });

    return success(res, room, "Tạo phòng thành công");
  } catch (e) {
    return bad(res, e.message || "Lỗi máy chủ", 500);
  }
}

/* -------------------- Cập nhật phòng -------------------- */
export async function updateRoom(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const { name, description, status, roomTypeId } = req.body;

    const roomUpdate = {
      ...(name != null ? { name: String(name).trim() } : {}),
      ...(description != null ? { description } : {}),
      ...(status != null ? { status } : {}),
      ...(roomTypeId != null ? { roomTypeId: Number(roomTypeId) } : {}),
    };

    if (!Object.keys(roomUpdate).length) {
      return success(res, null, "Không có gì để cập nhật");
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
export async function toggleRoomActiveStatus(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return bad(res, "ID không hợp lệ", 400);

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return bad(res, "Phòng không tồn tại", 404);

    const active = !room.active;
    await prisma.room.update({
      where: { id },
      data: { active, updatedAt: new Date() },
    });

    return success(
      res,
      null,
      active ? "Khôi phục phòng thành công" : "Xóa phòng thành công"
    );
  } catch (e) {
    return bad(res, e.message ?? "Lỗi không xác định", 500);
  }
}

/* -------------------- Lấy phòng trống -------------------- */
export async function getRoomsAvailable(req, res) {
  const { checkIn, checkOut, roomTypeId, hotelId = 1 } = req.body;
  if (!checkIn || !checkOut) return bad(res, "Thiếu thông tin bắt buộc", 400);

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  try {
    const rooms = await prisma.room.findMany({
      where: {
        hotelId: Number(hotelId),
        ...(roomTypeId ? { roomTypeId: Number(roomTypeId) } : {}),
        active: true,
        roomType: { active: true },
        bookings: {
          none: {
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
            checkIn: { lt: end },
            checkOut: { gt: start },
          },
        },
      },
      include: {
        roomType: {
          include: {
            amenities: {
              include: { amenity: true },
            },
          },
        },
      },
    });

    if (!rooms.length) return bad(res, "Không có phòng trống", 404);
    return success(res, rooms, "Lấy phòng trống thành công");
  } catch (err) {
    return bad(res, err.message || "Lỗi máy chủ", 500);
  }
}

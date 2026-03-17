import { prisma } from "../../lib/prisma.js";
import { bad, success } from "../../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../../utils/pagination.js";

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

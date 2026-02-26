import { success, bad } from "../../utils/response.js";
import { prisma } from "../../lib/prisma.js";
import { resolvePromotionForBooking } from "../../utils/promo.js";
import * as DateUtils from "../../utils/date.js";

export async function getAvailable(req, res) {
  const { checkIn, checkOut, roomTypeId } = req.body;
  if (!checkIn || !checkOut) return bad(res, "Thiếu thông tin bắt buộc", 400);

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  try {
    const rooms = await prisma.room.findMany({
      where: {
        ...(roomTypeId ? { roomTypeId: Number(roomTypeId) } : {}),
        isActive: true,
        roomType: { isActive: true },
        bookings: {
          none: {
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
            checkIn: { lt: end },
            checkOut: { gt: start },
          },
        },
        status: "AVAILABLE",
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!rooms.length) return bad(res, "Không có phòng trống", 404);
    return success(res, rooms, "Lấy phòng trống thành công");
  } catch (err) {
    return bad(res, err.message || "Lỗi máy chủ", 500);
  }
}

export async function quote(req, res) {
  try {
    const user = req.user;
    const customerType =
      user?.role === "CUSTOMER" ? "REGISTERED_MEMBER" : "GUEST";

    const { checkIn, checkOut, promoCode, roomId } = req.body || {};

    if (!checkIn || !checkOut || !roomId) {
      return bad(res, "checkIn, checkOut là bắt buộc", 400);
    }

    const startDate = DateUtils.toDate(checkIn);
    const endDate = DateUtils.toDate(checkOut);

    if (startDate >= endDate) {
      return bad(res, "Ngày check-out phải sau ngày check-in", 400);
    }

    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
        isActive: true,
      },
      include: {
        roomType: true,
      },
    });

    if (!room) {
      return bad(res, "Phòng không tồn tại", 400);
    }

    const nights = DateUtils.computeNight(startDate, endDate);
    const base = Number(room.roomType.basePrice);
    const totalBefore = base * nights;

    const {
      promoApplied: appliedPromo,
      discountAmount,
      reason,
    } = await resolvePromotionForBooking({
      roomTypeId: Number(room.roomTypeId),
      totalBefore,
      promoCode,
      now: new Date(),
      customerType,
    });

    if (reason) return bad(res, reason, 400);

    return success(res, {
      nights,
      unitPrice: base,
      totalBefore,
      discount: discountAmount,
      promoApplied: appliedPromo
        ? {
            id: appliedPromo.id,
            name: appliedPromo.name,
            code: appliedPromo.code,
            type: appliedPromo.type,
            value: Number(appliedPromo.value),
            priority: appliedPromo.priority,
            autoApply: appliedPromo.autoApply,
            scope: appliedPromo.scope,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

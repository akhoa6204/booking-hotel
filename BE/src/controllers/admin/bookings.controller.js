import { prisma } from "../../lib/prisma.js";
import { buildOffsetMeta, parsePageLimit } from "../../utils/pagination.js";
import { bad, success } from "../../utils/response.js";
import * as DateUtils from "../../utils/date.js";
import { resolvePromotionForBooking } from "../../utils/promo.js";

export async function list(req, res) {
  try {
    const { q = "" } = req.query;
    const { page, limit, skip } = parsePageLimit(req);

    const keyword = String(q).trim().toLowerCase();
    const where = keyword
      ? {
          OR: [
            ...(Number.isFinite(Number(keyword))
              ? [{ id: Number(keyword) }]
              : []),
            { fullName: { contains: keyword } },
            { phone: { contains: keyword } },
          ],
        }
      : {};

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          phone: true,
          checkIn: true,
          checkOut: true,
          status: true,
          baseAmount: true,
          discountAmount: true,
          createdAt: true,
          room: {
            select: {
              name: true,
              roomType: {
                select: {
                  name: true,
                },
              },
            },
          },
          promotion: {
            select: {
              name: true,
            },
          },
          paymentStatus: true,
        },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);

    return success(
      res,
      { items: bookings, meta: buildOffsetMeta({ page, limit, total }) },
      200,
    );
  } catch (e) {
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function create(req, res) {
  try {
    const userId = req.user.id;
    const { fullName, phone, checkIn, checkOut, roomId, promoCode } =
      req.body || {};

    if (!fullName || !phone || !checkIn || !checkOut || !roomId) {
      return bad(res, "fullName, phone, checkIn, checkOut là bắt buộc", 400);
    }

    const staff = await prisma.staff.findUnique({
      where: { userId: userId },
      select: {
        id: true,
      },
    });

    if (!staff) {
      return bad(res, "Không tồn tại nhân viên", 400);
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
    const existedBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { not: "PENDING" },
        AND: [{ checkIn: { lt: endDate } }, { checkOut: { gt: startDate } }],
      },
    });

    if (existedBooking) {
      return bad(res, "Phòng không còn trống", 400);
    }

    const nights = DateUtils.computeNight(startDate, endDate);
    const base = Number(room.roomType.basePrice);
    const totalBefore = base * nights;

    const {
      promoApplied,
      discountAmount: rawDiscountAmount,
      appliedPromoIds,
      reason,
    } = await resolvePromotionForBooking({
      roomTypeId: Number(room.roomTypeId),
      totalBefore,
      promoCode,
      now: new Date(),
    });

    if (reason) return bad(res, reason, 400);

    const promoId = promoApplied?.id ?? null;

    const discountAmount = Math.min(
      Number(rawDiscountAmount || 0),
      Number(totalBefore || 0),
    );

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          staffId: staff.id,
          roomId: roomId,
          checkIn: startDate,
          checkOut: endDate,

          fullName,
          phone,
          status: "CONFIRMED",
          promotionId: promoId,
          baseAmount: totalBefore,
          discountAmount,
        },
      });

      if (appliedPromoIds.length > 0) {
        await tx.promotion.updateMany({
          where: { id: { in: appliedPromoIds } },
          data: { quotaUsed: { increment: 1 } },
        });
      }
      return booking;
    });
    return success(res, { bookingId: result.id }, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return bad(res, "Trạng thái là bắt buộc", 400);
    }

    if (
      !["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].includes(status)
    ) {
      return bad(res, "Trạng thái không hợp lệ", 400);
    }

    let updatedRoomStatus = null;

    if (status === "CHECKED_IN") {
      updatedRoomStatus = "BOOKED";
    } else if (status === "CHECKED_OUT") {
      updatedRoomStatus = "CLEANING";
    }

    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        status,
        ...(updatedRoomStatus && {
          room: {
            update: {
              status: updatedRoomStatus,
            },
          },
        }),
      },
      include: {
        room: true,
      },
    });

    return success(res, booking, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return bad(res, "Thiếu thông tin ID", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        checkIn: true,
        checkOut: true,
        status: true,
        baseAmount: true,
        discountAmount: true,
        createdAt: true,
        room: {
          select: {
            name: true,
            roomType: {
              select: {
                name: true,
              },
            },
          },
        },
        promotion: {
          select: {
            name: true,
          },
        },
        paymentStatus: true,
      },
    });

    if (!booking) return bad(res, "Không tồn tại đặt phòng", 400);
    return success(res, booking, 200);
  } catch (error) {
    console.error(error);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

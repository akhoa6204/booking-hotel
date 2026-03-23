import { prisma } from "../../lib/prisma.js";
import { resolvePromotionForBooking } from "../../utils/promo.js";
import { bad, success } from "../../utils/response.js";
import * as DateUtils from "../../utils/date.js";
import { buildOffsetMeta, parsePageLimit } from "../../utils/pagination.js";

export async function create(req, res) {
  try {
    const userId = req.user?.id;
    console.log("userId:", userId);

    const {
      roomId,
      email,
      phone,
      fullName,
      arrivalTime,
      guestType = "SELF",
      checkIn,
      checkOut,
      promoCode,
    } = req.body || {};

    if (!roomId || !email || !phone || !fullName || !checkIn || !checkOut) {
      return bad(res, "Thiếu thông tin đặt phòng", 400);
    }

    const roomIdNum = Number(roomId);
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (
      !Number.isFinite(startDate.getTime()) ||
      !Number.isFinite(endDate.getTime()) ||
      startDate >= endDate
    ) {
      return bad(res, "Ngày nhận/trả phòng không hợp lệ", 400);
    }
    let customerId;
    if (userId) {
      const customer = await prisma.customer.findFirst({
        where: { userId: Number(userId) },
        select: { id: true },
      });

      if (!customer) {
        return bad(res, "Không tìm thấy thông tin khách hàng", 400);
      }
      customerId = customer.id;
    }

    const existedRoom = await prisma.room.findUnique({
      where: { id: roomIdNum },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        },
      },
    });

    if (!existedRoom || !existedRoom.isActive) {
      return bad(res, "Không tồn tại phòng", 400);
    }

    if (!["VACANT_CLEAN", "VACANT_DIRTY"].includes(existedRoom.status)) {
      return bad(res, "Phòng hiện không khả dụng để đặt", 400);
    }

    const existedBooking = await prisma.booking.findFirst({
      where: {
        roomId: roomIdNum,
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { lt: endDate },
        checkOut: { gt: startDate },
      },
      select: { id: true },
    });

    if (existedBooking) {
      return bad(res, "Phòng đã được đặt trong khoảng thời gian này", 400);
    }

    const nights = DateUtils.computeNight(startDate, endDate);
    if (!nights || nights <= 0) {
      return bad(res, "Số đêm lưu trú không hợp lệ", 400);
    }

    const roomPrice = Number(existedRoom.roomType?.basePrice ?? 0);
    const totalBefore = roomPrice * nights;

    const {
      promoApplied,
      discountAmount: rawDiscountAmount,
      reason,
    } = await resolvePromotionForBooking({
      roomTypeId: Number(existedRoom.roomTypeId),
      totalBefore,
      promoCode,
      now: new Date(),
    });

    if (reason) {
      return bad(res, reason, 400);
    }

    const discountAmount = Math.min(
      Number(rawDiscountAmount || 0),
      Number(totalBefore || 0),
    );

    const totalAmount = Math.max(0, totalBefore - discountAmount);

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          roomId: roomIdNum,
          ...(customerId ? { customerId } : {}),
          email: String(email).trim(),
          phone: String(phone).trim(),
          fullName: String(fullName).trim(),
          arrivalTime: arrivalTime || null,
          guestType,
          checkIn: startDate,
          checkOut: endDate,
          status: "PENDING",
        },
        select: { id: true },
      });

      const invoice = await tx.invoice.create({
        data: {
          bookingId: booking.id,
          status: "DRAFT",
          subtotal: totalBefore,
          discount: discountAmount,
          tax: 0,
          paidAmount: 0,
          note: promoApplied
            ? `Áp dụng khuyến mãi: ${promoApplied.code || promoApplied.name}`
            : null,
        },
        select: { id: true },
      });

      await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          type: "ROOM",
          description: `Tiền phòng ${existedRoom.roomType?.name || existedRoom.name || ""} (${nights} đêm)`,
          quantity: nights,
          unitPrice: roomPrice,
          totalPrice: totalBefore,
          ...(promoApplied ? { promotionId: promoApplied.id } : {}),
        },
      });

      return {
        bookingId: booking.id,
        invoiceId: invoice.id,
      };
    });

    return success(
      res,
      {
        bookingId: result.bookingId,
        invoiceId: result.invoiceId,
      },
      201,
    );
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Thiếu thông tin ID", 400);

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        status: true,
        checkIn: true,
        checkOut: true,
        fullName: true,
        phone: true,
        email: true,
        room: {
          select: {
            roomType: {
              select: {
                basePrice: true,
                capacity: true,
                name: true,
                images: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            subtotal: true,
            discount: true,
            tax: true,
            paidAmount: true,
            status: true,
          },
        },
        review: {
          select: {
            id: true,
            cleanliness: true,
            comfort: true,
            comment: true,
            hygiene: true,
            valueForMoney: true,
            amenities: true,
            locationScore: true,
            overall: true,
          },
        },
      },
    });

    if (!booking) return bad(res, "Không tồn tại đặt phòng", 400);

    const { review, ...b } = booking;
    const canReview = b.status === "CHECKED_OUT" && !review;
    return success(res, { ...b, canReview }, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function list(req, res) {
  try {
    const userId = req.user.id;

    const { page, limit, skip } = parsePageLimit(req, {
      maxLimit: 50,
      defaultLimit: 10,
    });

    const status = req.query.status || "CONFIRMED";

    const where = {
      customer: {
        userId: Number(userId),
      },
      ...(status && status !== "ALL" ? { status } : {}),
    };

    const total = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        status: true,
        checkIn: true,
        checkOut: true,
        fullName: true,
        phone: true,
        email: true,
        room: {
          select: {
            name: true,
            roomType: {
              select: {
                basePrice: true,
                capacity: true,
                name: true,
                images: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            subtotal: true,
            discount: true,
            tax: true,
            paidAmount: true,
            status: true,
          },
        },
        review: {
          select: {
            id: true,
            cleanliness: true,
            comfort: true,
            comment: true,
            hygiene: true,
            valueForMoney: true,
            amenities: true,
            locationScore: true,
            overall: true,
          },
        },
      },

      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
    const bookingsResponse = bookings.map((booking) => {
      const { review, ...b } = booking;
      const canReview = b.status === "CHECKED_OUT" && !review;
      return {
        ...b,
        canReview,
      };
    });
    return success(
      res,
      {
        items: bookingsResponse,
        meta: buildOffsetMeta({ page, limit, total }),
      },
      "Danh sách đặt phòng của bạn",
    );
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

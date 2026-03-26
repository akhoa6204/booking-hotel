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
    console.error(e);
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
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        AND: [{ checkIn: { lt: endDate } }, { checkOut: { gt: startDate } }],
      },
    });

    if (existedBooking) {
      console.log(existedBooking);
      return bad(res, "Phòng không còn trống", 400);
    }

    const nights = DateUtils.computeNight(startDate, endDate);
    const basePrice = Number(room.roomType.basePrice);
    const totalBefore = basePrice * nights;

    const {
      promoApplied,
      discountAmount: rawDiscountAmount,
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
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          bookingId: booking.id,
          subtotal: totalBefore,
          discount: discountAmount,
          tax: 0,
          paidAmount: 0,
          status: "DRAFT",
        },
        select: {
          id: true,
          subtotal: true,
          discount: true,
          tax: true,
          paidAmount: true,
        },
      });

      await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          type: "ROOM",
          quantity: nights,
          unitPrice: basePrice,
          totalPrice: totalBefore,
          promotionId: promoId,
        },
      });
      const subtotal = Number(invoice.subtotal || 0);
      const discount = Number(invoice.discount || 0);
      const tax = Number(invoice.tax || 0);
      const total = subtotal - discount + tax;
      const paidAmount = Number(invoice.paidAmount || 0);

      const remainingAmount = total - paidAmount;

      return {
        bookingId: booking.id,
        invoiceId: invoice.id,
        remainingAmount,
      };
    });

    return success(res, result, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { status, reason, roomId } = req.body || {};
    const userId = req.user.id;
    if (!id) return bad(res, "Thiếu bookingId", 400);

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: { room: true },
    });

    if (!booking) return bad(res, "Không tồn tại booking", 404);

    if (roomId && !status) {
      if (Number(roomId) === booking.roomId) {
        return bad(res, "Phòng mới trùng với phòng hiện tại", 400);
      }

      const now = new Date();
      const startDate = booking.status === "CHECKED_IN" ? now : booking.checkIn;

      const endDate = booking.checkOut;

      const existedRoom = await prisma.room.findFirst({
        where: {
          id: Number(roomId),
          isActive: true,
          status: "VACANT_CLEAN",
          bookings: {
            none: {
              status: { notIn: ["CANCELLED", "PENDING"] },
              AND: [
                { checkIn: { lt: endDate } },
                { checkOut: { gt: startDate } },
              ],
            },
          },
        },
      });
      if (!existedRoom) {
        return bad(res, "Phòng mới không sạch hoặc đã được đặt", 400);
      }
    }

    if (
      status &&
      !["CHECKED_IN", "CHECKED_OUT", "CANCELLED"].includes(status)
    ) {
      return bad(res, "Status không hợp lệ", 400);
    }

    const now = new Date();
    const today = new Date(now.toISOString().slice(0, 10));

    const result = await prisma.$transaction(async (tx) => {
      if (roomId && !status) {
        const oldRoomId = booking.roomId;

        const updatedBooking = await tx.booking.update({
          where: { id: Number(id) },
          data: {
            roomId: Number(roomId),
          },
          select: {
            status: true,
            roomId: true,
            room: {
              select: {
                id: true,
                name: true,
                roomType: {
                  select: {
                    id: true,
                    name: true,
                    basePrice: true,
                    capacity: true,
                  },
                },
              },
            },
          },
        });

        if (booking.status === "CHECKED_IN") {
          await tx.room.update({
            where: { id: Number(oldRoomId) },
            data: { status: "VACANT_DIRTY" },
          });

          const currentShift = await tx.shift.findFirst({
            where: {
              startTime: { lte: now },
              endTime: { gt: now },
            },
          });

          let assignedStaffId = null;

          if (currentShift) {
            const staffOnShift = await tx.staffShiftAssignment.findMany({
              where: {
                workDate: today,
                shiftId: currentShift.id,
                position: "HOUSEKEEPING",
              },
            });

            if (staffOnShift.length > 0) {
              const taskCounts = await Promise.all(
                staffOnShift.map(async (s) => {
                  const count = await tx.housekeepingTask.count({
                    where: {
                      staffId: s.staffId,
                      status: { in: ["PENDING", "IN_PROGRESS"] },
                    },
                  });
                  return { staffId: s.staffId, count };
                }),
              );

              taskCounts.sort((a, b) => a.count - b.count);
              assignedStaffId = taskCounts[0].staffId;
            }
          }

          const taskData = {
            roomId: Number(oldRoomId),
            workDate: now,
            type: "CLEANING",
          };

          if (assignedStaffId) taskData.staffId = assignedStaffId;

          await tx.housekeepingTask.create({ data: taskData });
        }

        return updatedBooking;
      }

      if (status === "CANCELLED") {
        if (booking.status === "CHECKED_IN") {
          throw new Error("Không thể huỷ booking đã check-in");
        }
        if (!reason) return bad(res, "Thiếu nguyên nhân hủy phòng.", 400);

        await tx.cancelReason.create({
          data: {
            bookingId: Number(id),
            content: reason,
            staffId: Number(userId),
          },
        });
        return await tx.booking.update({
          where: { id: Number(id) },
          data: {
            status: "CANCELLED",
            room: {
              update: { status: "VACANT_CLEAN" },
            },
          },
        });
      }

      if (status === "CHECKED_IN") {
        if (booking.status !== "CONFIRMED") {
          throw new Error("Booking không ở trạng thái có thể check-in");
        }

        return tx.booking.update({
          where: { id: Number(id) },
          data: {
            status: "CHECKED_IN",
            room: {
              update: { status: "OCCUPIED_CLEAN" },
            },
          },
          include: { room: true },
        });
      }

      if (status === "CHECKED_OUT") {
        if (booking.status !== "CHECKED_IN") {
          throw new Error("Booking chưa check-in");
        }

        const updatedBooking = await tx.booking.update({
          where: { id: Number(id) },
          data: {
            status: "CHECKED_OUT",
            room: {
              update: { status: "VACANT_DIRTY" },
            },
          },
          include: { room: true },
        });

        const currentShift = await tx.shift.findFirst({
          where: {
            startTime: { lte: now },
            endTime: { gt: now },
          },
        });

        let assignedStaffId = null;

        if (currentShift) {
          const staffOnShift = await tx.staffShiftAssignment.findMany({
            where: {
              workDate: today,
              shiftId: currentShift.id,
              position: "HOUSEKEEPING",
            },
          });

          if (staffOnShift.length > 0) {
            const taskCounts = await Promise.all(
              staffOnShift.map(async (s) => {
                const count = await tx.housekeepingTask.count({
                  where: {
                    staffId: s.staffId,
                    status: { in: ["PENDING", "IN_PROGRESS"] },
                  },
                });
                return { staffId: s.staffId, count };
              }),
            );

            taskCounts.sort((a, b) => a.count - b.count);
            assignedStaffId = taskCounts[0].staffId;
          }
        }

        const taskData = {
          roomId: updatedBooking.roomId,
          workDate: now,
          type: "CLEANING",
        };

        if (assignedStaffId) taskData.staffId = assignedStaffId;

        await tx.housekeepingTask.create({
          data: taskData,
        });

        return updatedBooking;
      }
    });

    return success(res, { booking: result }, 200);
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
        email: true,
        checkIn: true,
        checkOut: true,
        status: true,
        room: {
          select: {
            id: true,
            name: true,
            roomType: {
              select: {
                name: true,
                capacity: true,
              },
            },
          },
        },
        invoice: {
          select: { id: true },
        },
      },
    });

    let inspected = false;
    let inspectionTaskId = null;

    if (booking) {
      const inspectionTask = await prisma.housekeepingTask.findFirst({
        where: {
          bookingId: Number(id),
          type: "INSPECTION",
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (inspectionTask) {
        inspectionTaskId = inspectionTask.id;
        inspected = inspectionTask.status === "DONE";
      }
    }

    if (!booking) return bad(res, "Không tồn tại đặt phòng", 400);
    return success(
      res,
      {
        ...booking,
        inspectionTaskId,
        inspected,
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

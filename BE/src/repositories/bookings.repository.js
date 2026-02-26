import { prisma } from "../lib/prisma.js";

export async function createBooking({
  tx = prisma,
  customerId = null,
  staffId = null,
  roomId,
  checkIn,
  checkOut,
  fullName,
  email = null,
  phone,
  guestType = "OTHER",
  arrivalTime = null,
  promotionId = null,
  baseAmount,
  discountAmount = 0,
  paymentStatus = "UNPAID",
  status = "PENDING",
}) {
  return tx.booking.create({
    data: {
      customerId: customerId ? Number(customerId) : null,
      staffId: staffId ? Number(staffId) : null,
      roomId: Number(roomId),
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      fullName,
      email,
      phone,
      guestType,
      arrivalTime,
      promotionId: promotionId ? Number(promotionId) : null,
      baseAmount,
      discountAmount,
      paymentStatus,
      status,
    },
    include: {
      room: { select: { id: true, roomTypeId: true } },
      customer: {
        select: { id: true, fullName: true, phone: true, email: true },
      },
      staff: { select: { id: true, fullName: true, email: true } },
      promotion: { select: { id: true, code: true, type: true, value: true } },
    },
  });
}

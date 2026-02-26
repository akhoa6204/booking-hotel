import { prisma } from "../lib/prisma.js";
import * as BookingRepo from "../repositories/bookings.repository.js";
import {
  findPromotionByCode,
  incrementPromotionQuotaUsed,
} from "../repositories/promotions.repository.js";

const DAY = 1000 * 60 * 60 * 24;
const toDate = (x) => new Date(x);
const computeNights = (startDate, endDate) =>
  Math.max(1, Math.ceil((endDate - startDate) / DAY));

async function resolvePromotion({ hotelId, roomTypeId, baseAmount, code }) {
  if (!code) return { promo: null, discountAmount: 0, reason: "NO_CODE" };

  const now = new Date();
  const promo = await findPromotionByCode({ hotelId, code, now });
  if (!promo) return { promo: null, discountAmount: 0, reason: "INVALID_CODE" };

  // Quota
  if (promo.quotaTotal > 0 && promo.quotaUsed >= promo.quotaTotal) {
    return { promo: null, discountAmount: 0, reason: "PROMO_EXHAUSTED" };
  }

  const conditions = promo.conditions ?? {};

  // Scope: ROOM_TYPE
  if (promo.scope === "ROOM_TYPE") {
    const allowedRoomTypeId = Number(conditions.roomTypeId ?? 0);
    if (!allowedRoomTypeId || allowedRoomTypeId !== Number(roomTypeId)) {
      return {
        promo: null,
        discountAmount: 0,
        reason: "CODE_NOT_FOR_ROOMTYPE",
      };
    }
  }

  // Scope: MIN_TOTAL
  if (promo.scope === "MIN_TOTAL") {
    const minTotal = Number(conditions.minTotal ?? 0);
    if (minTotal > 0 && Number(baseAmount) < minTotal) {
      return { promo: null, discountAmount: 0, reason: "NOT_ENOUGH_MIN_TOTAL" };
    }
  }

  // Compute discount
  const value = Number(promo.value);
  let discountAmount = 0;

  if (promo.type === "PERCENT") {
    discountAmount = Math.floor((Number(baseAmount) * value) / 100);
  } else {
    discountAmount = value;
  }

  // Optional cap
  const maxDiscount = Number(conditions.maxDiscountAmount ?? 0);
  if (maxDiscount > 0) discountAmount = Math.min(discountAmount, maxDiscount);

  // Never exceed baseAmount
  discountAmount = Math.max(0, Math.min(discountAmount, Number(baseAmount)));

  return { promo, discountAmount, reason: null };
}

export async function customerCreateBooking({ user = null, body = {} }) {
  const {
    roomTypeId,
    checkIn,
    checkOut,
    promoCode,
    fullName,
    guestType = "OTHER",
    email = null,
    phone,
    arrivalTime = null,
  } = body;

  if (!roomTypeId || !checkIn || !checkOut) {
    throw new Error("Thiếu dữ liệu: roomTypeId, checkIn, checkOut là bắt buộc");
  }

  const startDate = toDate(checkIn);
  const endDate = toDate(checkOut);

  if (!(startDate < endDate)) {
    throw new Error("Ngày check-in/check-out không hợp lệ");
  }

  if (!fullName || !phone) {
    throw new Error(
      "Thiếu thông tin khách hàng: fullName và phone là bắt buộc",
    );
  }

  // 1) Find 1 available room
  const room = await BookingRepo.findAvailableRoomByRoomType({
    roomTypeId,
    checkIn: startDate,
    checkOut: endDate,
  });

  if (!room) {
    throw new Error("Không còn phòng trống cho loại phòng này");
  }

  // 2) Compute base amount (roomType.basePrice * nights)
  const nights = computeNights(startDate, endDate);
  const baseAmount = Number(room.roomType.basePrice) * nights;
  const hotelId = Number(room.roomType.hotelId);

  // 3) Resolve promotion + discount
  const { promo, discountAmount } = await resolvePromotion({
    hotelId,
    roomTypeId,
    baseAmount,
    code: promoCode,
  });

  // 4) Transaction: create booking + increment promo quotaUsed
  return prisma.$transaction(async (tx) => {
    const booking = await BookingRepo.createBooking({
      tx,
      customerId: user?.id ? Number(user.id) : null,
      staffId: null,
      roomId: room.id,
      checkIn: startDate,
      checkOut: endDate,
      fullName,
      email,
      phone,
      guestType,
      arrivalTime,
      promotionId: promo?.id ?? null,
      baseAmount,
      discountAmount,
      paymentStatus: "UNPAID",
      status: "PENDING",
    });

    if (promo) {
      await incrementPromotionQuotaUsed({ tx, promotionId: promo.id });
    }

    return booking;
  });
}

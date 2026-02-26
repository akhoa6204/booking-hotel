import { prisma } from "../lib/prisma.js";
export async function findPromotionByCode(
  roomTypeId,
  promoCode,
  total,
  customerType,
) {
  if (!promoCode)
    return { promo: null, discount: 0, reason: "Không có mã khuyến mãi" };

  const now = new Date();
  const where = {
    code: promoCode,
    isActive: true,
    startAt: { lte: now },
    endAt: { gte: now },
    ...(total != null
      ? { AND: [{ OR: [{ minTotal: null }, { minTotal: { lte: total } }] }] }
      : {}),
    OR: [
      {
        scope: "ROOM_TYPE",
        PromotionRoomType: {
          some: { roomTypeId: Number(roomTypeId) },
        },
      },
      { scope: { not: "ROOM_TYPE" } },
    ],
  };
  const promo = await prisma.promotion.findFirst({
    where,
  });

  if (!promo)
    return { promo: null, discount: 0, reason: "Mã khuyến mãi không khả dụng" };

  if (promo.quotaTotal > 0 && promo.quotaUsed >= promo.quotaTotal) {
    return {
      promo: null,
      discount: 0,
      reason: "Mã khuyến mãi đã hết lượt sử dụng",
    };
  }

  if (
    promo.eligibleFor !== "ALL" &&
    customerType !== "ALL" &&
    promo.eligibleFor !== customerType
  ) {
    return {
      promo: null,
      discount: 0,
      reason: "Khuyến mãi không được áp dụng cho khách hàng này",
    };
  }

  const discount = calcPromoDiscount({ promo, total: Number(total ?? 0) });

  return {
    promo,
    discount,
    reason: null,
  };
}

export async function findAutoApplyPromotion({
  roomTypeId,
  totalBefore,
  now = new Date(),
  customerType,
}) {
  const promo = await prisma.promotion.findFirst({
    where: {
      autoApply: true,
      isActive: true,
      startAt: { lte: now },
      endAt: { gte: now },
      AND: [{ OR: [{ minTotal: null }, { minTotal: { lte: totalBefore } }] }],
      OR: [
        {
          scope: "ROOM_TYPE",
          PromotionRoomType: { some: { roomTypeId } },
        },
        { scope: { in: ["GLOBAL", "MIN_TOTAL"] } },
      ],
    },
    orderBy: [{ priority: "asc" }, { id: "desc" }],
  });

  if (!promo) {
    return { promo: null, discount: 0, reason: "Không có khuyến mãi tự động" };
  }

  if (promo.quotaTotal > 0 && promo.quotaUsed >= promo.quotaTotal) {
    return {
      promo: null,
      discount: 0,
      reason: "Khuyến mãi tự động đã hết lượt sử dụng",
    };
  }

  if (
    promo.eligibleFor !== "ALL" &&
    customerType !== "ALL" &&
    promo.eligibleFor !== customerType
  ) {
    return {
      promo: null,
      discount: 0,
      reason: "Khuyến mãi không được áp dụng cho khách hàng này",
    };
  }

  const discount = calcPromoDiscount({
    promo,
    total: Number(totalBefore ?? 0),
  });

  return { promo, discount, reason: null };
}

export function calcPromoDiscount({ promo, total }) {
  if (!promo || total <= 0) return 0;

  const value = Number(promo.value);
  let discount = 0;

  if (promo.type === "PERCENT") {
    discount = Math.floor((total * value) / 100);
    if (promo.maxDiscountAmount != null) {
      discount = Math.min(discount, Number(promo.maxDiscountAmount));
    }
  } else {
    discount = value;
  }

  return Math.max(0, Math.min(discount, total));
}

export async function resolvePromotionForBooking({
  roomTypeId,
  totalBefore,
  promoCode,
  now = new Date(),
  customerType = "GUEST",
}) {
  let discountAmount = 0;
  let promoApplied = null;
  const appliedPromoIds = [];

  const promoCodeTrim = String(promoCode || "").trim();

  if (promoCodeTrim) {
    const { promo, discount, reason } = await findPromotionByCode(
      Number(roomTypeId),
      promoCodeTrim,
      totalBefore,
      customerType,
    );
    if (reason)
      return {
        promoApplied: null,
        discountAmount: 0,
        appliedPromoIds: [],
        reason,
      };

    promoApplied = promo;
    discountAmount = discount;
    if (promo?.id) appliedPromoIds.push(promo.id);

    if (promo?.isStackable) {
      const totalLeft = Math.max(0, totalBefore - discountAmount);

      const {
        promo: autoPromo,
        discount: autoDiscount,
        reason: autoReason,
      } = await findAutoApplyPromotion({
        roomTypeId: Number(roomTypeId),
        totalBefore: totalLeft,
        now,
        customerType,
      });

      if (!autoReason && autoPromo) {
        discountAmount += autoDiscount;
        if (autoPromo.id) appliedPromoIds.push(autoPromo.id);
      }
    }

    discountAmount = Math.min(discountAmount, totalBefore);
    return { promoApplied, discountAmount, appliedPromoIds, reason: null };
  }

  const {
    promo: autoPromo,
    discount,
    reason,
  } = await findAutoApplyPromotion({
    roomTypeId: Number(roomTypeId),
    totalBefore,
    now,
    customerType,
  });

  if (!reason && autoPromo) {
    promoApplied = autoPromo;
    discountAmount = Math.min(discount, totalBefore);
    appliedPromoIds.push(autoPromo.id);
    return { promoApplied, discountAmount, appliedPromoIds, reason: null };
  }

  return {
    promoApplied: null,
    discountAmount: 0,
    appliedPromoIds: [],
    reason: null,
  };
}

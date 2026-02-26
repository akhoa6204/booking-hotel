import { prisma } from "../lib/prisma.js";

export async function findPromotionByCode(hotelId, code, date = new Date()) {
  return await prisma.promotion.findFirst({
    where: {
      code: code,
      is_active: true,
      hotelId: Number(hotelId),
      startDate: { lte: date },
      endDate: { gte: date },
    },
  });
}
export async function incrementPromotionQuotaUsed({
  tx = prisma,
  promotionId,
}) {
  if (!promotionId) throw new Error("promotionId is required");

  return tx.promotion.update({
    where: { id: Number(promotionId) },
    data: { quotaUsed: { increment: 1 } },
  });
}

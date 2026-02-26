import { prisma } from "../lib/prisma.js";
import { success, bad } from "../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../utils/pagination.js";

function logControllerError(action, err, extra = {}) {
  const message = err?.message || String(err);
  const stack = err?.stack;
  console.error(`[promotions.controller] ${action} failed: ${message}`, {
    ...extra,
    stack,
  });
}

function shapePromotion(promo) {
  if (!promo) return promo;
  const customerTypes = Array.isArray(promo.customerTypeRules)
    ? promo.customerTypeRules.map((r) => r.customerType)
    : [];
  const loyaltyTiers = Array.isArray(promo.loyaltyTierRules)
    ? promo.loyaltyTierRules.map((r) => r.tier)
    : [];
  return {
    ...promo,
    customerTypes,
    loyaltyTiers,
  };
}

/*
  GET /api/promotions
  Query params:
    hotelId=1
    scope=GLOBAL|ROOM_TYPE|MIN_TOTAL
    kind=CODE|FLASH_SALE
    active=true|false
    q=<search by code or name>
    activeNow=true  (filter promotions valid at current time)
    roomTypeId=2
    customerType=GUEST|REGISTERED
    loyaltyTier=BRONZE|SILVER|GOLD|DIAMOND
    page=1&limit=10
*/
export async function listPromotions(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    const hotelId = req.query.hotelId ? Number(req.query.hotelId) : 1;
    const scope = req.query.scope || undefined; // GLOBAL | ROOM_TYPE | MIN_TOTAL
    const kind = req.query.kind || undefined; // CODE | FLASH_SALE

    const active =
      typeof req.query.active === "string"
        ? req.query.active === "true"
        : undefined;

    const activeNow =
      typeof req.query.activeNow === "string" ? req.query.activeNow === "true" : false;

    const roomTypeId = req.query.roomTypeId ? Number(req.query.roomTypeId) : undefined;

    const customerType = (req.query.customerType || "").toString().trim();
    const loyaltyTier = (req.query.loyaltyTier || "").toString().trim();

    const q = (req.query.q || "").toString().trim();

    const now = new Date();

    const and = [];

    if (customerType) {
      and.push({
        OR: [
          { customerTypeRules: { some: { customerType } } },
          { customerTypeRules: { none: {} } },
        ],
      });
    }

    if (loyaltyTier) {
      and.push({
        OR: [
          { loyaltyTierRules: { some: { tier: loyaltyTier } } },
          { loyaltyTierRules: { none: {} } },
        ],
      });
    }

    const where = {
      ...(hotelId ? { hotelId } : {}),
      ...(scope ? { scope } : {}),
      ...(kind ? { kind } : {}),
      ...(roomTypeId ? { roomTypeId } : {}),
      ...(active !== undefined ? { active } : {}),
      ...(activeNow
        ? {
            active: true,
            startDate: { lte: now },
            endDate: { gte: now },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q } },
              { name: { contains: q } },
            ],
          }
        : {}),
      ...(and.length ? { AND: and } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: [{ priority: "asc" }, { id: "desc" }],
        include: {
          roomType: { select: { id: true, name: true } },
          customerTypeRules: { select: { customerType: true } },
          loyaltyTierRules: { select: { tier: true } },
        },
        skip,
        take: limit,
      }),
      prisma.promotion.count({ where }),
    ]);

    return success(res, {
      items: items.map(shapePromotion),
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    logControllerError("listPromotions", e, { query: req.query });
    return bad(res, e.message || "Internal error", 500);
  }
}


export async function createPromotion(req, res) {
  try {
    console.log("[promotions.controller] createPromotion:start", {
      bodyKeys: Object.keys(req.body || {}),
    });

    const {
      hotelId,
      kind, // CODE | FLASH_SALE
      name,
      priority = 0,
      scope, // GLOBAL | ROOM_TYPE | MIN_TOTAL
      roomTypeId,
      description,
      minTotal,
      code,
      discountType, // PERCENT | FIXED
      value,
      maxDiscountAmount,
      customerTypes = [],
      loyaltyTiers = [],
      minNights,
      minGuests,
      startDate,
      endDate,
      active = true,
      usageLimitTotal,
      usageLimitPerCustomer,
    } = req.body || {};

    console.log("[promotions.controller] createPromotion:payload", {
      hotelId,
      kind,
      scope,
      discountType,
      value,
      startDate,
      endDate,
      code,
      roomTypeId,
      minTotal,
      priority,
      active,
      customerTypes,
      loyaltyTiers,
      usageLimitTotal,
      usageLimitPerCustomer,
    });

    if (!hotelId || !kind || !scope || !discountType || value == null || !startDate || !endDate) {
      return bad(
        res,
        "hotelId, kind, scope, discountType, value, startDate, endDate là bắt buộc",
        400
      );
    }

    if (kind === "CODE" && !code?.toString().trim()) {
      return bad(res, "Khuyến mãi dạng CODE yêu cầu code", 400);
    }

    if (scope === "ROOM_TYPE" && !roomTypeId) {
      return bad(res, "ROOM_TYPE yêu cầu roomTypeId", 400);
    }

    if (scope === "MIN_TOTAL" && minTotal == null) {
      return bad(res, "MIN_TOTAL yêu cầu minTotal", 400);
    }

    const ct = Array.isArray(customerTypes) ? customerTypes : [];
    const lt = Array.isArray(loyaltyTiers) ? loyaltyTiers : [];

    let finalCustomerTypes = ct;
    let finalLoyaltyTiers = lt;

    if (finalLoyaltyTiers.length > 0 && !finalCustomerTypes.includes("REGISTERED")) {
      finalCustomerTypes = [...finalCustomerTypes, "REGISTERED"];
    }

    console.log("[promotions.controller] createPromotion:beforeCreate", {
      finalCustomerTypes,
      finalLoyaltyTiers,
    });

    const promo = await prisma.promotion.create({
      data: {
        hotelId: Number(hotelId),
        kind,
        name: name?.toString().trim() || null,
        priority: Number(priority) || 0,
        scope,
        roomTypeId: roomTypeId ? Number(roomTypeId) : null,
        minTotal: minTotal != null ? Number(minTotal) : null,
        minNights: minNights != null ? Number(minNights) : null,
        minGuests: minGuests != null ? Number(minGuests) : null,

        code: kind === "CODE" ? code?.toString().trim() : null,

        discountType,
        value: Number(value),
        maxDiscountAmount:
          discountType === "PERCENT" && maxDiscountAmount != null
            ? Number(maxDiscountAmount)
            : null,

        ...(finalCustomerTypes.length
          ? {
              customerTypeRules: {
                create: finalCustomerTypes.map((customerType) => ({ customerType })),
              },
            }
          : {}),
        ...(finalLoyaltyTiers.length
          ? {
              loyaltyTierRules: {
                create: finalLoyaltyTiers.map((tier) => ({ tier })),
              },
            }
          : {}),

        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active: Boolean(active),
        description: description?.toString().trim() || null,

        usageLimitTotal: usageLimitTotal != null ? Number(usageLimitTotal) : null,
        usageLimitPerCustomer:
          usageLimitPerCustomer != null ? Number(usageLimitPerCustomer) : null,

        totalUsed: 0,
      },
      include: {
        roomType: { select: { id: true, name: true } },
        customerTypeRules: { select: { customerType: true } },
        loyaltyTierRules: { select: { tier: true } },
      },
    });

    console.log("[promotions.controller] createPromotion:created", {
      id: promo?.id,
      kind: promo?.kind,
      code: promo?.code,
    });

    return success(res, shapePromotion(promo), "Tạo khuyến mãi thành công", 201);
  } catch (e) {
    logControllerError("createPromotion", e, {
      hotelId: req?.body?.hotelId,
      kind: req?.body?.kind,
      scope: req?.body?.scope,
      code: req?.body?.code,
    });
    return bad(res, e.message || "Internal error", 500);
  }
}

export async function updatePromotion(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return bad(res, "ID không hợp lệ", 400);
    }

    const existing = await prisma.promotion.findUnique({
      where: { id },
      include: {
        customerTypeRules: { select: { customerType: true } },
        loyaltyTierRules: { select: { tier: true } },
      },
    });
    if (!existing) return bad(res, "Không tìm thấy khuyến mãi", 404);

    const {
      kind,
      name,
      priority,
      scope,
      roomTypeId,
      minTotal,
      code,
      discountType,
      value,
      maxDiscountAmount,
      customerTypes,
      loyaltyTiers,
      minNights,
      minGuests,
      startDate,
      endDate,
      active,
      description,
      usageLimitTotal,
      usageLimitPerCustomer,
    } = req.body || {};

    const nextKind = kind || existing.kind;

    if (scope === "ROOM_TYPE" && !roomTypeId) {
      return bad(res, "ROOM_TYPE yêu cầu roomTypeId", 400);
    }

    if (scope === "MIN_TOTAL" && minTotal == null) {
      return bad(res, "MIN_TOTAL yêu cầu minTotal", 400);
    }

    if (nextKind === "CODE" && code !== undefined && !code?.toString().trim()) {
      return bad(res, "Khuyến mãi dạng CODE yêu cầu code", 400);
    }

    const data = {
      ...(kind ? { kind } : {}),
      ...(name !== undefined ? { name: name?.toString().trim() || null } : {}),
      ...(priority !== undefined ? { priority: Number(priority) || 0 } : {}),
      ...(scope ? { scope } : {}),
      ...(roomTypeId !== undefined
        ? { roomTypeId: roomTypeId ? Number(roomTypeId) : null }
        : {}),
      ...(minTotal !== undefined
        ? { minTotal: minTotal != null ? Number(minTotal) : null }
        : {}),
      ...(minNights !== undefined
        ? { minNights: minNights != null ? Number(minNights) : null }
        : {}),
      ...(minGuests !== undefined
        ? { minGuests: minGuests != null ? Number(minGuests) : null }
        : {}),

      ...(code !== undefined
        ? {
            code:
              nextKind === "CODE" ? (code?.toString().trim() || null) : null,
          }
        : {}),

      ...(discountType ? { discountType } : {}),
      ...(value != null ? { value: Number(value) } : {}),
      ...(maxDiscountAmount !== undefined
        ? {
            maxDiscountAmount:
              (discountType || existing.discountType) === "PERCENT" &&
              maxDiscountAmount != null
                ? Number(maxDiscountAmount)
                : null,
          }
        : {}),

      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
      ...(description !== undefined
        ? { description: description?.toString().trim() || null }
        : {}),

      ...(usageLimitTotal !== undefined
        ? { usageLimitTotal: usageLimitTotal != null ? Number(usageLimitTotal) : null }
        : {}),
      ...(usageLimitPerCustomer !== undefined
        ? {
            usageLimitPerCustomer:
              usageLimitPerCustomer != null ? Number(usageLimitPerCustomer) : null,
          }
        : {}),
    };

    if (customerTypes !== undefined) {
      const ct = Array.isArray(customerTypes) ? customerTypes : [];
      data.customerTypeRules = {
        deleteMany: {},
        ...(ct.length ? { create: ct.map((customerType) => ({ customerType })) } : {}),
      };
    }

    if (loyaltyTiers !== undefined) {
      const lt = Array.isArray(loyaltyTiers) ? loyaltyTiers : [];
      data.loyaltyTierRules = {
        deleteMany: {},
        ...(lt.length ? { create: lt.map((tier) => ({ tier })) } : {}),
      };
    }

    const nextLoyaltyTiers = Array.isArray(loyaltyTiers) ? loyaltyTiers : undefined;
    if (nextLoyaltyTiers && nextLoyaltyTiers.length > 0) {
      const nextCustomerTypes = Array.isArray(customerTypes)
        ? customerTypes
        : undefined;

      const shouldEnsureRegistered =
        nextCustomerTypes && !nextCustomerTypes.includes("REGISTERED");

      if (shouldEnsureRegistered) {
        const ensured = [...nextCustomerTypes, "REGISTERED"];
        data.customerTypeRules = {
          deleteMany: {},
          create: ensured.map((customerType) => ({ customerType })),
        };
      } else if (!nextCustomerTypes) {
        const existingTypes = Array.isArray(existing.customerTypeRules)
          ? existing.customerTypeRules.map((r) => r.customerType)
          : [];

        if (existingTypes.length > 0 && !existingTypes.includes("REGISTERED")) {
          data.customerTypeRules = {
            deleteMany: {},
            create: [...existingTypes, "REGISTERED"].map((customerType) => ({ customerType })),
          };
        }
      }
    }

    const promo = await prisma.promotion.update({
      where: { id },
      data,
      include: {
        roomType: { select: { id: true, name: true } },
        customerTypeRules: { select: { customerType: true } },
        loyaltyTierRules: { select: { tier: true } },
      },
    });

    return success(res, shapePromotion(promo), "Cập nhật khuyến mãi thành công");
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

/* -------- SOFT DELETE /api/promotions/:id -------- */
export async function deletePromotion(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return bad(res, "ID không hợp lệ", 400);
    }

    const promo = await prisma.promotion.findUnique({ where: { id } });
    if (!promo) return bad(res, "Không tìm thấy khuyến mãi", 404);

    await prisma.promotion.update({
      where: { id },
      data: { active: false },
    });

    return success(res, null, "Đã vô hiệu khuyến mãi");
  } catch (e) {
    logControllerError("deletePromotion", e, { id: req?.params?.id });
    return bad(res, e.message || "Internal error", 500);
  }
}

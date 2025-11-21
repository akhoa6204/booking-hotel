import { prisma } from "../lib/prisma.js";
import { success, bad } from "../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../utils/pagination.js";

/* -------- GET /api/promotions?hotelId=1&scope=ROOM_TYPE&active=true&code=SUM&page=1&limit=10 -------- */
export async function listPromotions(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    const hotelId = req.query.hotelId ? Number(req.query.hotelId) : 1;
    const scope = req.query.scope || undefined;

    const active =
      typeof req.query.active === "string"
        ? req.query.active === "true"
        : undefined;

    const code = (req.query.code || "").toString().trim();

    const where = {
      ...(hotelId ? { hotelId } : {}),
      ...(scope ? { scope } : {}),
      ...(active !== undefined ? { active } : {}),
      ...(code
        ? {
            code: {
              contains: code,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: { id: "desc" },
        include: { roomType: { select: { id: true, name: true } } },
        skip,
        take: limit,
      }),
      prisma.promotion.count({ where }),
    ]);

    return success(res, {
      items,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

/*
  POST /api/promotions
  body: {
    hotelId, scope, roomTypeId?, minTotal?, code?,
    discountType, value, conditions?, startDate, endDate, active?, description?, totalCodes?
  }
*/
export async function createPromotion(req, res) {
  try {
    const {
      hotelId,
      scope, // GLOBAL | ROOM_TYPE | MIN_TOTAL
      roomTypeId,
      description,
      minTotal,
      code,
      discountType, // PERCENT | FIXED
      value,
      conditions,
      startDate,
      endDate,
      active = true,
      totalCodes = 100,
    } = req.body || {};

    if (
      !hotelId ||
      !scope ||
      !discountType ||
      value == null ||
      !startDate ||
      !endDate
    ) {
      return bad(
        res,
        "hotelId, scope, discountType, value, startDate, endDate là bắt buộc",
        400
      );
    }

    if (scope === "ROOM_TYPE" && !roomTypeId) {
      return bad(res, "ROOM_TYPE yêu cầu roomTypeId", 400);
    }

    if (scope === "MIN_TOTAL" && minTotal == null) {
      return bad(res, "MIN_TOTAL yêu cầu minTotal", 400);
    }

    const promo = await prisma.promotion.create({
      data: {
        hotelId: Number(hotelId),
        scope,
        roomTypeId: roomTypeId ? Number(roomTypeId) : null,
        minTotal: minTotal != null ? Number(minTotal) : null,
        code: code?.trim() || null,
        discountType,
        value: Number(value),
        conditions: conditions ?? null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active: Boolean(active),
        description: description?.trim() || null,
        totalCodes: Number(totalCodes) || 100,
        totalUsed: 0,
      },
    });

    return success(res, promo, "Tạo khuyến mãi thành công", 201);
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

/* -------- PUT /api/promotions/:id -------- */
export async function updatePromotion(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return bad(res, "ID không hợp lệ", 400);
    }

    const {
      scope,
      roomTypeId,
      minTotal,
      code,
      discountType,
      value,
      conditions,
      startDate,
      endDate,
      active,
      description,
      totalCodes,
    } = req.body || {};

    if (scope === "ROOM_TYPE" && !roomTypeId) {
      return bad(res, "ROOM_TYPE yêu cầu roomTypeId", 400);
    }

    if (scope === "MIN_TOTAL" && minTotal == null) {
      return bad(res, "MIN_TOTAL yêu cầu minTotal", 400);
    }

    const data = {
      ...(scope ? { scope } : {}),
      ...(roomTypeId !== undefined
        ? { roomTypeId: roomTypeId ? Number(roomTypeId) : null }
        : {}),
      ...(minTotal !== undefined
        ? { minTotal: minTotal != null ? Number(minTotal) : null }
        : {}),
      ...(code !== undefined ? { code: code?.trim() || null } : {}),
      ...(discountType ? { discountType } : {}),
      ...(value != null ? { value: Number(value) } : {}),
      ...(conditions !== undefined ? { conditions } : {}),
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
      ...(description !== undefined
        ? { description: description?.trim() || null }
        : {}),
      ...(totalCodes !== undefined ? { totalCodes: Number(totalCodes) } : {}),
    };

    const promo = await prisma.promotion.update({ where: { id }, data });

    return success(res, promo, "Cập nhật khuyến mãi thành công");
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
    return bad(res, e.message || "Internal error", 500);
  }
}

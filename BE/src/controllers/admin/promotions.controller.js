import { prisma } from "../../lib/prisma.js";
import { success, bad } from "../../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../../utils/pagination.js";

function normalizedResponse(promo) {
  const { PromotionRoomType, createdAt, updatedAt, ...rest } = promo;
  return {
    ...rest,
    roomTypes: PromotionRoomType?.map((item) => item.roomTypeId),
  };
}

export async function list(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    const q = (req.query.q || "").toString().trim();

    const where = {
      isActive: true,
      OR: [{ code: { contains: q } }, { name: { contains: q } }],
    };

    const [items, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: [{ priority: "asc" }, { id: "desc" }],
        include: {
          PromotionRoomType: {
            select: {
              roomTypeId: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.promotion.count({ where }),
    ]);
    const responseItems = items.map((promo) => normalizedResponse(promo));

    return success(res, {
      items: responseItems,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

export async function create(req, res) {
  try {
    const {
      name,
      priority = 0,
      scope, // GLOBAL | ROOM_TYPE | MIN_TOTAL
      roomTypes,
      description,
      minTotal,
      code,
      type, // PERCENT | FIXED
      value,
      maxDiscountAmount,
      startAt,
      endAt,
      autoApply = false,
      eligibleFor = "ALL",
      quotaTotal = 100,
      isStackable = false,
    } = req.body || {};

    if (
      !name ||
      !scope ||
      !type ||
      !value ||
      !startAt ||
      !endAt ||
      !eligibleFor
    ) {
      return bad(
        res,
        "name, scope, type, value, startAt, endAt, eligibleFor là bắt buộc",
        400,
      );
    }

    const roomTypeIds = Array.isArray(roomTypes) ? roomTypes.map(Number) : [];
    if (!autoApply && !code) {
      return bad(res, "Khuyến mãi không tự áp dụng yêu cầu Mã khuyến mãi", 400);
    }

    if (autoApply && Boolean(isStackable)) {
      return bad(
        res,
        "Khuyến mãi tự áp dụng (autoApply=true) không được phép cộng dồn (isStackable=true)",
        400,
      );
    }

    if (scope === "ROOM_TYPE" && roomTypeIds.length === 0) {
      return bad(res, "ROOM_TYPE yêu cầu roomTypeId", 400);
    }
    const existingRoomTypes = await prisma.roomType.findMany({
      where: {
        id: { in: roomTypeIds },
      },
    });

    if (existingRoomTypes.length !== roomTypeIds.length) {
      return bad(
        res,
        "Một số roomTypeId không tồn tại trong cơ sở dữ liệu",
        400,
      );
    }

    if (scope === "MIN_TOTAL" && minTotal == null) {
      return bad(res, "MIN_TOTAL yêu cầu minTotal", 400);
    }

    if (
      type === "PERCENT" &&
      (maxDiscountAmount == null || maxDiscountAmount <= 0)
    ) {
      return bad(
        res,
        "maxDiscountAmount là bắt buộc và phải lớn hơn 0 khi discountType là PERCENT",
        400,
      );
    }

    if (new Date(startAt) > new Date(endAt)) {
      return bad(res, "Ngày bắt đầu yêu cầu nhỏ hơn ngày kết thúc", 400);
    }

    if (!["ALL", "REGISTERED_MEMBER", "GUEST"].includes(eligibleFor)) {
      return bad(res, "Không tồn tại loại khách hàng được áp dụng", 400);
    }

    const promo = await prisma.promotion.create({
      data: {
        name: name.toString().trim(),
        priority: Number(priority) || 0,
        scope,
        minTotal: minTotal != null ? Number(minTotal) : null,
        code: code?.toString().trim() || null,
        type,
        value: Number(value),
        maxDiscountAmount:
          type === "PERCENT" && maxDiscountAmount != null
            ? Number(maxDiscountAmount)
            : null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        description: description?.toString().trim() || null,
        autoApply,
        eligibleFor,
        quotaTotal,
        isStackable: !autoApply ? Boolean(isStackable) : false,
        PromotionRoomType: {
          create: roomTypeIds.map((id) => ({ roomTypeId: id })),
        },
      },
      include: {
        PromotionRoomType: {
          select: {
            roomTypeId: true,
          },
        },
      },
    });

    const response = normalizedResponse(promo);

    return success(res, response, "Tạo khuyến mãi thành công", 201);
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

export async function getById(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return bad(res, "ID là bắt buộc");
    }

    const promo = await prisma.promotion.findUnique({
      where: { id: Number(id), isActive: true },
      include: {
        PromotionRoomType: {
          select: {
            roomTypeId: true,
          },
        },
      },
    });

    if (!promo) {
      return bad(res, "Không tìm thấy khuyến mãi", 400);
    }

    const response = normalizedResponse(promo);

    return success(res, response, 200);
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return bad(res, "ID không hợp lệ", 400);
    }

    // Tìm khuyến mãi hiện tại
    const existing = await prisma.promotion.findUnique({
      where: { id },
      include: {
        PromotionRoomType: { select: { roomTypeId: true } },
      },
    });

    if (!existing) return bad(res, "Không tìm thấy khuyến mãi", 404);

    const {
      name,
      priority,
      scope,
      roomTypes,
      minTotal,
      code,
      type,
      value,
      maxDiscountAmount,
      startAt,
      endAt,
      description,
      autoApply,
      eligibleFor,
      quotaTotal,
      isStackable,
    } = req.body || {};
    console.log("type:", type);

    if (
      !name ||
      !scope ||
      !type ||
      !value ||
      !startAt ||
      !endAt ||
      !eligibleFor
    ) {
      return bad(
        res,
        "name, scope, type, value, startAt, endAt, eligibleFor là bắt buộc",
        400,
      );
    }

    // Kiểm tra số lượng khuyến mãi có hợp lệ không
    if (quotaTotal < existing.quotaUsed) {
      return bad(res, "Số lượng sử dụng > Số lượng tổng cộng", 400);
    }

    // Kiểm tra mã khi không tự động áp dụng
    if (autoApply && !code) {
      return bad(res, "Khuyến mãi không tự áp dụng yêu cầu Mã khuyến mãi", 400);
    }

    const roomTypeIds = Array.isArray(roomTypes) ? roomTypes.map(Number) : [];
    if (scope === "ROOM_TYPE" && roomTypeIds.length === 0) {
      return bad(res, "ROOM_TYPE yêu cầu roomTypeId", 400);
    }

    if (scope === "MIN_TOTAL" && minTotal == null) {
      return bad(res, "MIN_TOTAL yêu cầu minTotal", 400);
    }

    // Kiểm tra maxDiscountAmount khi type là PERCENT
    if (
      type === "PERCENT" &&
      (maxDiscountAmount == null || maxDiscountAmount <= 0)
    ) {
      return bad(
        res,
        "maxDiscountAmount là bắt buộc và phải lớn hơn 0 khi type là PERCENT",
        400,
      );
    }

    // Kiểm tra ngày bắt đầu và kết thúc
    if (new Date(startAt) > new Date(endAt)) {
      return bad(res, "Ngày bắt đầu yêu cầu nhỏ hơn ngày kết thúc", 400);
    }

    const existingRoomTypes = await prisma.roomType.findMany({
      where: {
        id: { in: roomTypeIds },
      },
    });

    if (existingRoomTypes.length !== roomTypeIds.length) {
      return bad(
        res,
        "Một số roomTypeId không tồn tại trong cơ sở dữ liệu",
        400,
      );
    }

    if (!["ALL", "REGISTERED_MEMBER", "GUEST"].includes(eligibleFor)) {
      return bad(res, "Không tồn tại loại khách hàng được áp dụng", 400);
    }
    // Dữ liệu cần cập nhật
    const data = {
      name: name.toString().trim(),
      ...(priority !== undefined ? { priority: Number(priority) || 0 } : {}),
      scope,
      ...(minTotal !== undefined
        ? { minTotal: minTotal != null ? Number(minTotal) : null }
        : {}),
      ...(code ? { code: code.toString().trim() || null } : {}),
      type,
      ...(value != null ? { value: Number(value) } : {}),
      ...(maxDiscountAmount != null && type === "PERCENT"
        ? { maxDiscountAmount: Number(maxDiscountAmount) }
        : {}),
      ...(startAt ? { startAt: new Date(startAt) } : {}),
      ...(endAt ? { endAt: new Date(endAt) } : {}),
      ...(description
        ? { description: description.toString().trim() || null }
        : {}),
      eligibleFor,
      isStackable,
    };

    const currentRoomTypes = existing.PromotionRoomType.map(
      (item) => item.roomTypeId,
    );
    const roomTypesToCreate = roomTypeIds.filter(
      (id) => !currentRoomTypes.includes(id),
    );
    const roomTypesToDelete = currentRoomTypes.filter(
      (id) => !roomTypeIds.includes(id),
    );

    await prisma.promotion.update({
      where: { id },
      data,
      include: {
        PromotionRoomType: { select: { roomTypeId: true } },
      },
    });

    if (roomTypesToDelete.length > 0) {
      await prisma.promotionRoomType.deleteMany({
        where: {
          promotionId: id,
          roomTypeId: { in: roomTypesToDelete },
        },
      });
    }

    if (roomTypesToCreate.length > 0) {
      await prisma.promotionRoomType.createMany({
        data: roomTypesToCreate.map((roomTypeId) => ({
          promotionId: id,
          roomTypeId,
        })),
      });
    }

    const updatedPromoWithRoomTypes = await prisma.promotion.findUnique({
      where: { id },
      include: {
        PromotionRoomType: {
          select: {
            roomTypeId: true,
          },
        },
      },
    });

    const response = normalizedResponse(updatedPromoWithRoomTypes);

    return success(res, response, "Cập nhật khuyến mãi thành công", 200);
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return bad(res, "ID không hợp lệ", 400);
    }

    const promo = await prisma.promotion.findUnique({ where: { id } });
    if (!promo) return bad(res, "Không tìm thấy khuyến mãi", 404);

    await prisma.promotion.update({
      where: { id },
      data: { isActive: false },
    });

    return success(res, null, "Đã vô hiệu khuyến mãi");
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

import { success, bad } from "../../utils/response.js";
import { prisma } from "../../lib/prisma.js";
import { resolvePromotionForBooking } from "../../utils/promo.js";
import * as DateUtils from "../../utils/date.js";
import { buildOffsetMeta, parsePageLimit } from "../../utils/pagination.js";

function normalizeRoomType(roomType) {
  const { id, name, basePrice, capacity, images, amenities } = roomType;

  const flatImages = images.map((image) => ({
    url: image.url,
    alt: image.alt,
    isPrimary: image.isPrimary,
  }));
  const flatAmenities = amenities.map((a) => ({
    id: a.amenity.id,
    code: a.amenity.code,
    label: a.amenity.label,
  }));
  return {
    id,
    name,
    basePrice,
    capacity,
    images: flatImages,
    amenities: flatAmenities,
  };
}

export async function quote(req, res) {
  try {
    const user = req.user;
    const customerType =
      user?.role === "CUSTOMER" ? "REGISTERED_MEMBER" : "GUEST";

    const { checkIn, checkOut, promoCode, roomId } = req.body || {};

    if (!checkIn || !checkOut || !roomId) {
      return bad(res, "checkIn, checkOut là bắt buộc", 400);
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

    const nights = DateUtils.computeNight(startDate, endDate);
    const base = Number(room.roomType.basePrice);
    const totalBefore = base * nights;

    const {
      promoApplied: appliedPromo,
      discountAmount,
      reason,
    } = await resolvePromotionForBooking({
      roomTypeId: Number(room.roomTypeId),
      totalBefore,
      promoCode,
      now: new Date(),
      customerType,
    });

    if (reason) return bad(res, reason, 400);

    return success(res, {
      nights,
      unitPrice: base,
      totalBefore,
      discount: discountAmount,
      promoApplied: appliedPromo
        ? {
            id: appliedPromo.id,
            name: appliedPromo.name,
            code: appliedPromo.code,
            type: appliedPromo.type,
            value: Number(appliedPromo.value),
            priority: appliedPromo.priority,
            autoApply: appliedPromo.autoApply,
            scope: appliedPromo.scope,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function list(req, res) {
  try {
    const { checkIn, checkOut, roomTypeId, q } = req.query;

    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 6 });

    const start = checkIn ? new Date(checkIn) : null;
    const end = checkOut ? new Date(checkOut) : null;

    const where = {
      ...(roomTypeId ? { roomTypeId: Number(roomTypeId) } : {}),
      ...(q
        ? {
            name: {
              contains: q,
            },
          }
        : {}),

      isActive: true,
      roomType: { isActive: true },

      ...(start && end
        ? {
            status: {
              in: ["VACANT_CLEAN", "VACANT_DIRTY"],
            },
            bookings: {
              none: {
                status: { in: ["CONFIRMED", "CHECKED_IN"] },
                checkIn: { lt: end },
                checkOut: { gt: start },
              },
            },
          }
        : {}),
    };

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        select: {
          id: true,
          name: true,
          status: true,
          roomType: {
            include: {
              images: true,
              amenities: {
                include: { amenity: true },
              },
            },
          },
        },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.room.count({ where }),
    ]);

    const normalizeRooms = rooms.map((room) => ({
      ...room,
      roomType: normalizeRoomType(room.roomType),
    }));

    return success(res, {
      items: normalizeRooms,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    console.error(e);

    return bad(res, e.message || "Lỗi máy chủ", 500);
  }
}

export async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return bad(res, "ID không hợp lệ", 400);

    const room = await prisma.room.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        status: true,
        roomType: {
          include: {
            images: true,
            amenities: {
              include: { amenity: true },
            },
          },
        },
      },
    });

    if (!room) return bad(res, "Không tìm thấy phòng", 404);

    return success(res, {
      ...{
        ...room,
        roomType: normalizeRoomType(room.roomType),
      },
    });
  } catch (error) {
    console.error(error);
    return bad(res, error.message || "Lỗi máy chủ", 500);
  }
}

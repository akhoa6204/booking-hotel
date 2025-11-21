import { prisma } from "../lib/prisma.js";
import { bad, success } from "../utils/response.js";
import { buildOffsetMeta, parsePageLimit } from "../utils/pagination.js";

const clamp15 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : null;
};

export async function createReview(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return bad(res, "Bạn cần đăng nhập", 401);

    const id = Number(req.body?.bookingId || 0);
    if (!id) return bad(res, "bookingId không hợp lệ", 400);

    const overall = clamp15(req.body.overall);
    if (!overall) return bad(res, "overall phải trong [1..5]", 400);

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        roomId: true,
        customerId: true,
        userId: true,
        customer: {
          select: {
            id: true,
            linkedUserId: true,
          },
        },
      },
    });

    if (!booking) return bad(res, "Booking không tồn tại", 404);

    // 1) Kiểm tra trạng thái booking
    if (
      !(booking.status === "CHECKED_OUT" && booking.paymentStatus === "PAID")
    ) {
      return bad(
        res,
        "Chỉ được đánh giá sau khi trả phòng và đã thanh toán",
        400
      );
    }

    // 2) Kiểm tra quyền: user hiện tại có phải người đặt phòng không?
    const isOwner =
      booking.userId === userId || booking.customer?.linkedUserId === userId;

    if (!isOwner) {
      return bad(res, "Bạn không có quyền đánh giá đặt phòng này", 403);
    }

    // 3) Kiểm tra đã có review chưa
    const existed = await prisma.review.findUnique({
      where: { bookingId: booking.id },
      select: { id: true },
    });
    if (existed) return bad(res, "Booking này đã được đánh giá", 400);

    // 4) Tạo review
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        roomId: booking.roomId,
        customerId: booking.customerId ?? null,
        userId: booking.userId ?? null,
        overall,
        amenities: clamp15(req.body.amenities),
        cleanliness: clamp15(req.body.cleanliness),
        comfort: clamp15(req.body.comfort),
        locationScore: clamp15(req.body.locationScore),
        valueForMoney: clamp15(req.body.valueForMoney),
        hygiene: clamp15(req.body.hygiene),
        comment: req.body.comment?.toString()?.trim() || null,
      },
    });

    return success(res, { id: review.id });
  } catch (e) {
    console.error("createReview error:", e);
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function getList(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });
    const roomId = req.query.roomId ? Number(req.query.roomId) : undefined;
    const q = req.query.q?.trim() || "";
    const hotelId = 1;
    const role = req.user?.role || "CUSTOMER";

    const where = {
      ...(role !== "MANAGER" ? { status: "PUBLISHED" } : {}),
      ...(roomId ? { roomId } : {}),
      ...(hotelId ? { room: { hotelId } } : {}),
      ...(q
        ? {
            OR: [
              { comment: { contains: q } },
              { customer: { fullName: { contains: q } } },
              { user: { fullName: { contains: q } } },
              { room: { name: { contains: q } } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          room: { select: { id: true, name: true } },
          user: { select: { id: true, fullName: true } },
          customer: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const items = rows.map((r) => ({
      ...r,
      displayName: r.customer?.fullName || r.user?.fullName || "Khách",
    }));

    const meta = buildOffsetMeta({ page, limit, total });
    return success(res, { items, meta });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function updateStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status, reason } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!id) return bad(res, "Thiếu ID review", 400);
    if (!status) return bad(res, "Thiếu trạng thái mới", 400);
    if (role !== "MANAGER") return bad(res, "Không có quyền cập nhật", 403);

    const validStatuses = ["PUBLISHED", "HIDDEN"];
    if (!validStatuses.includes(status))
      return bad(res, "Trạng thái không hợp lệ", 400);

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return bad(res, "Review không tồn tại", 404);

    const data =
      status === "HIDDEN"
        ? {
            status,
            hiddenReason: reason || null,
            hiddenByUserId: userId,
            hiddenAt: new Date(),
          }
        : {
            status,
            hiddenReason: null,
            hiddenByUserId: null,
            hiddenAt: null,
          };

    const updated = await prisma.review.update({
      where: { id },
      data,
    });

    return success(res, updated);
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function getStats(req, res) {
  try {
    const hotelId = 1;

    const baseWhere = {
      ...(hotelId ? { room: { hotelId } } : {}),
    };

    const wherePublished = { ...baseWhere, status: "PUBLISHED" };

    const [agg, total] = await Promise.all([
      prisma.review.aggregate({
        where: wherePublished,
        _avg: { overall: true },
      }),
      prisma.review.count({ where: wherePublished }),
    ]);

    const hidden = await prisma.review.count({
      where: { ...baseWhere, status: "HIDDEN" },
    });

    const avg = Number(agg._avg.overall || 0);
    return success(res, {
      average: Math.round(avg * 10) / 10,
      total,
      hidden,
    });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function getListForGuest(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    const userId = req.user?.id;
    if (!userId) return bad(res, "Bạn cần đăng nhập", 401);

    const customer = await prisma.customer.findUnique({
      where: { linkedUserId: userId },
      select: { id: true },
    });

    const where = {
      status: "PUBLISHED",
      OR: [{ userId }, ...(customer ? [{ customerId: customer.id }] : [])],
    };

    const [total, rows] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
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
                  images: {
                    where: { isPrimary: true },
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
          customer: {
            select: {
              id: true,
              fullName: true,
            },
          },
          booking: {
            select: {
              checkIn: true,
              checkOut: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const items = rows.map((r) => ({
      ...r,
      displayName: r.customer?.fullName || r.user?.fullName || "Bạn",
    }));

    const meta = buildOffsetMeta({ page, limit, total });

    return success(res, { items, meta }, "Danh sách đánh giá của bạn");
  } catch (e) {
    console.error("getListForGuest error:", e);
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function getById(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return bad(res, "Bạn cần đăng nhập", 401);

    const id = Number(req.params.id);

    const customer = await prisma.customer.findUnique({
      where: { linkedUserId: userId },
      select: { id: true },
    });

    const review = await prisma.review.findFirst({
      where: {
        id,
        OR: [{ userId }, ...(customer ? [{ customerId: customer.id }] : [])],
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!review) return bad(res, "Không tìm thấy đánh giá", 404);
    return success(res, review);
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

import { prisma } from "../../lib/prisma.js";
import { parsePageLimit, buildOffsetMeta } from "../../utils/pagination.js";
import { bad, success } from "../../utils/response.js";

const clamp15 = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num < 1 || num > 5) return null;
  return num;
};

export async function create(req, res) {
  try {
    const userId = Number(req.user?.id || 0);
    if (!userId) return bad(res, "Bạn cần đăng nhập", 401);

    const bookingId = Number(req.body?.bookingId || 0);
    if (!bookingId) return bad(res, "bookingId không hợp lệ", 400);

    const overall = clamp15(req.body?.overall);
    if (!overall) return bad(res, "overall phải trong [1..5]", 400);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        fullName: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!booking) return bad(res, "Booking không tồn tại", 404);

    if (booking.status !== "CHECKED_OUT") {
      return bad(res, "Chỉ được đánh giá sau khi trả phòng", 400);
    }

    const isOwner = Number(booking.customer?.userId || 0) === userId;
    if (!isOwner) {
      return bad(res, "Bạn không có quyền đánh giá đặt phòng này", 403);
    }

    const existed = await prisma.review.findUnique({
      where: { bookingId: booking.id },
      select: { id: true },
    });
    if (existed) return bad(res, "Booking này đã được đánh giá", 400);

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        overall,
        amenities: clamp15(req.body?.amenities),
        cleanliness: clamp15(req.body?.cleanliness),
        comfort: clamp15(req.body?.comfort),
        locationScore: clamp15(req.body?.locationScore),
        valueForMoney: clamp15(req.body?.valueForMoney),
        hygiene: clamp15(req.body?.hygiene),
        comment: req.body?.comment?.toString()?.trim() || null,
      },
      select: {
        id: true,
        bookingId: true,
        overall: true,
        amenities: true,
        cleanliness: true,
        comfort: true,
        locationScore: true,
        valueForMoney: true,
        hygiene: true,
        comment: true,
        status: true,
        createdAt: true,
      },
    });

    return success(res, review, 201);
  } catch (e) {
    console.error("createReview error:", e);
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function list(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });
    const q = req.query?.q?.toString()?.trim() || "";
    const status = req.query?.status?.toString()?.trim() || "PUBLISHED";
    const bookingId = Number(req.query?.bookingId || 0);

    const where = {
      isActive: true,
      ...(status && status !== "ALL" ? { status } : {}),
      ...(bookingId ? { bookingId } : {}),
      ...(q
        ? {
            OR: [
              { comment: { contains: q } },
              {
                booking: {
                  fullName: { contains: q },
                },
              },
              {
                booking: {
                  room: {
                    name: { contains: q },
                  },
                },
              },
              {
                booking: {
                  room: {
                    roomType: {
                      name: { contains: q },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        select: {
          id: true,
          bookingId: true,
          overall: true,
          amenities: true,
          cleanliness: true,
          comfort: true,
          locationScore: true,
          valueForMoney: true,
          hygiene: true,
          comment: true,
          status: true,
          staffReply: true,
          staffReplyAt: true,
          createdAt: true,
          booking: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              status: true,
              checkIn: true,
              checkOut: true,
              room: {
                select: {
                  id: true,
                  name: true,
                  roomType: {
                    select: {
                      id: true,
                      name: true,
                      images: {
                        select: {
                          url: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          staff: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
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
      displayName: r.booking?.fullName || "Khách",
      staffDisplayName: r.staff?.user?.fullName || null,
    }));

    const meta = buildOffsetMeta({ page, limit, total });
    return success(res, { items, meta });
  } catch (e) {
    console.error("listReviews error:", e);
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function getById(req, res) {
  try {
    const id = Number(req.params?.id || 0);
    if (!id) return bad(res, "Thiếu thông tin ID", 400);

    const role = req.user?.role;

    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        bookingId: true,
        overall: true,
        amenities: true,
        cleanliness: true,
        comfort: true,
        locationScore: true,
        valueForMoney: true,
        hygiene: true,
        comment: true,
        isActive: true,
        status: true,
        staffReply: true,
        staffReplyAt: true,
        booking: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            status: true,
            checkIn: true,
            checkOut: true,
            room: {
              select: {
                id: true,
                name: true,
                roomType: {
                  select: {
                    id: true,
                    name: true,
                    images: {
                      select: {
                        url: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        staff: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!review) return bad(res, "Review không tồn tại", 404);

    if (role !== "MANAGER" && role !== "ADMIN") {
      if (!review.isActive || review.status !== "PUBLISHED") {
        return bad(res, "Review không tồn tại", 404);
      }
    }

    return success(res, {
      ...review,
      displayName: review.booking?.fullName || "Khách",
      staffDisplayName: review.staff?.user?.fullName || null,
    });
  } catch (e) {
    console.error("getReviewById error:", e);
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function updateStatus(req, res) {
  try {
    const id = Number(req.params?.id || 0);
    const { status } = req.body || {};
    const role = req.user?.role;

    if (!id) return bad(res, "Thiếu ID review", 400);
    if (!status) return bad(res, "Thiếu trạng thái mới", 400);
    if (!role || role === "CUSTOMER") {
      return bad(res, "Không có quyền cập nhật", 403);
    }

    const validStatuses = ["PUBLISHED", "HIDDEN"];
    if (!validStatuses.includes(status)) {
      return bad(res, "Trạng thái không hợp lệ", 400);
    }

    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!review) return bad(res, "Review không tồn tại", 404);

    const updated = await prisma.review.update({
      where: { id },
      data: { status },
    });

    return success(res, updated);
  } catch (e) {
    console.error("updateReviewStatus error:", e);
    return bad(res, e.message || "Internal server error", 500);
  }
}

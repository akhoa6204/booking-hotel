import { prisma } from "../lib/prisma.js";
import { pushNotification } from "./notifications.controller.js";
import { success, bad } from "../utils/response.js";
import { createRequire } from "module";
import crypto from "node:crypto";
import { parsePageLimit, buildOffsetMeta } from "../utils/pagination.js";
import { sendBookingConfirmationEmail } from "../utils/mailer.js";

const FE_ORIGIN = process.env.FE_ORIGIN || "http://localhost:5173";
const DAY = 24 * 60 * 60 * 1000;
const toDate = (x) => new Date(x);
const computeNight = (startDate, endDate) =>
  Math.max(1, Math.ceil((endDate - startDate) / DAY));

const require = createRequire(import.meta.url);
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || "";
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");
const vnpay = new VNPay({
  tmnCode: "X3A9VFVR",
  secureSecret: VNP_HASH_SECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

async function assertClash(roomId, startDate, endDate) {
  const clash = await prisma.booking.findFirst({
    where: {
      roomId: Number(roomId),
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      AND: [{ checkIn: { lt: endDate } }, { checkOut: { gt: startDate } }],
    },
    select: { id: true },
  });
  if (clash) throw new Error("Không còn phòng trống");
}

async function findPromotionByCode({ hotelId, roomTypeId, total, code }) {
  if (!code) return { promo: null, discount: 0, reason: "NO_CODE" };

  const now = new Date();

  const promo = await prisma.promotion.findFirst({
    where: {
      hotelId: Number(hotelId),
      code: code.trim(),
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (!promo) return { promo: null, discount: 0, reason: "INVALID_CODE" };
  console.log("promo:", promo);
  console.log("totalUsed:", promo.totalUsed);
  console.log("totalCodes:", promo.totalCodes);

  // Hết lượt sử dụng
  if (promo.totalUsed > promo.totalCodes) {
    return { promo: null, discount: 0, reason: "PROMO_EXHAUSTED" };
  }

  if (promo.scope === "ROOM_TYPE" && promo.roomTypeId !== Number(roomTypeId)) {
    return { promo: null, discount: 0, reason: "CODE_NOT_FOR_ROOMTYPE" };
  }

  if (promo.scope === "MIN_TOTAL" && total < Number(promo.minTotal || 0)) {
    return { promo: null, discount: 0, reason: "NOT_ENOUGH_MIN_TOTAL" };
  }

  const v = Number(promo.value);
  const discount =
    promo.discountType === "PERCENT" ? Math.floor((total * v) / 100) : v;

  console.log("discount:", discount);
  return { promo, discount: Math.min(discount, total), reason: null };
}

function verifyVnpReturn(req) {
  // raw query: giữ nguyên dấu '+', %2F, v.v.
  const raw = req.originalUrl.split("?")[1] || "";

  // tách cặp key=value, bỏ 2 tham số hash
  const pairs = raw
    .split("&")
    .filter(
      (kv) =>
        !kv.startsWith("vnp_SecureHash=") &&
        !kv.startsWith("vnp_SecureHashType=")
    );

  // lấy secureHash gốc
  const secureHash = new URLSearchParams(raw).get("vnp_SecureHash") || "";

  // sort theo key tăng dần
  pairs.sort((a, b) => a.split("=")[0].localeCompare(b.split("=")[0]));

  // ghép lại NGUYÊN TRẠNG, không encode lại
  const signData = pairs.join("&");

  // HMAC SHA512
  const signed = crypto
    .createHmac("sha512", VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return { isValid: signed === secureHash, signData, signed, secureHash };
}

function nextPaymentStatus(totalPrice, newAmountPaid) {
  if (newAmountPaid <= 0) return "UNPAID";
  if (newAmountPaid + 1e-6 < Number(totalPrice)) return "PARTIAL";
  return "PAID";
}

/* ==================== HELPER CHUNG ==================== */

/** Map guestType từ FE ("self" | "other") sang enum Prisma ("SELF" | "OTHER") */
function mapGuestType(guestType) {
  if (guestType?.toLowerCase() === "self") return "SELF";
  return "OTHER";
}

/**
 * Lấy hoặc tạo Customer cho user online (đã đăng nhập)
 * - Ưu tiên dùng linkedUserId
 * - Nếu chưa có, có thể link với customer sẵn có theo phone (nếu không bị conflict)
 */
async function getOrCreateCustomerForOnlineUser(params) {
  const { user } = params;
  let { fullName, email, phone } = params;

  // fallback sang thông tin trong user
  const finalPhone = (phone || user.phone || "").trim();
  const finalFullName = (fullName || user.fullName || "").trim();
  const finalEmail = email || user.email || null;

  if (!finalPhone) {
    throw new Error("MISSING_PHONE_FOR_CUSTOMER");
  }
  // 1. đã có customer link với user
  let customer = await prisma.customer.findFirst({
    where: { linkedUserId: user.id },
  });

  if (!user) {
    // 2. nếu chưa có: tìm theo phone
    const existedByPhone = await prisma.customer.findUnique({
      where: { phone: finalPhone },
    });

    if (existedByPhone) {
      // nếu đã link với user khác -> conflict
      if (
        existedByPhone.linkedUserId &&
        existedByPhone.linkedUserId !== user.id
      ) {
        throw new Error("PHONE_OWNED_BY_ANOTHER_USER");
      }

      // nếu chưa link -> link với user hiện tại
      customer = await prisma.customer.update({
        where: { id: existedByPhone.id },
        data: {
          linkedUserId: user.id,
          customerType: "REGISTERED",
          fullName: finalFullName || existedByPhone.fullName,
          email: finalEmail ?? existedByPhone.email,
        },
      });
    } else {
      // 3. tạo customer mới
      customer = await prisma.customer.create({
        data: {
          fullName: finalFullName || "Khách hàng",
          phone: finalPhone,
          email: finalEmail,
          linkedUserId: user.id,
          customerType: "REGISTERED",
        },
      });
    }
  }

  return {
    customer,
    fullName: customer.fullName || finalFullName,
    email: customer.email ?? finalEmail,
    phone: customer.phone || finalPhone,
  };
}

/**
 * Xử lý khách vãng lai theo phone:
 * - Nếu phone thuộc customer đã linkedUserId != null -> báo lỗi (bắt login)
 * - Nếu phone thuộc customer chưa link -> dùng lại customer đó
 * - Nếu chưa tồn tại -> tạo customer GUEST
 */
async function resolveGuestCustomerByPhone(params) {
  const phone = params.phone.trim();
  const fullName = params.fullName?.trim();
  const email = params.email;

  const existed = await prisma.customer.findUnique({
    where: { phone },
  });

  if (existed) {
    if (existed.linkedUserId) {
      // đã thuộc về 1 account -> bắt khách login
      throw new Error("PHONE_OWNED_BY_REGISTERED_USER");
    }

    return {
      customer: existed,
      fullName: fullName || existed.fullName,
      email: email ?? existed.email ?? null,
      phone: existed.phone,
    };
  }

  // tạo mới customer GUEST
  const created = await prisma.customer.create({
    data: {
      fullName: fullName || "Khách lẻ",
      phone,
      email: email ?? null,
      customerType: "GUEST",
    },
  });

  return {
    customer: created,
    fullName: created.fullName,
    email: created.email,
    phone: created.phone,
  };
}

/* ==================== API: CLIENT TẠO BOOKING ==================== */

export async function createBooking(req, res) {
  try {
    const user = req.user || null;
    const userId = user?.id ?? null;
    console.log("Create booking by", userId);
    let {
      roomTypeId,
      checkIn,
      checkOut,
      promoCode,
      fullName,
      guestType = "OTHER",
      email,
      phone,
      arrivalTime,
    } = req.body || {};

    // ====== VALIDATE CƠ BẢN ======
    if (!roomTypeId || !checkIn || !checkOut) {
      return bad(
        res,
        "Thiếu dữ liệu: roomTypeId, checkIn, checkOut là bắt buộc",
        400
      );
    }

    const startDate = toDate(checkIn);
    const endDate = toDate(checkOut);
    if (!(startDate < endDate)) {
      return bad(res, "Ngày check-in/check-out không hợp lệ", 400);
    }

    // ====== TÌM 1 PHÒNG TRỐNG THEO ROOM TYPE ID ======
    const room = await prisma.room.findFirst({
      where: {
        roomTypeId: Number(roomTypeId),
        active: true,
        roomType: { active: true },
        bookings: {
          none: {
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
            AND: [
              { checkIn: { lt: endDate } },
              { checkOut: { gt: startDate } },
            ],
          },
        },
      },
      orderBy: { id: "asc" },
      include: { roomType: true },
    });

    if (!room) {
      return bad(res, "Không còn phòng trống cho loại phòng này", 409);
    }

    // ====== XỬ LÝ CUSTOMER & SNAPSHOT THÔNG TIN BOOKING ======
    let customerId = null;
    let snapshotFullName = fullName?.trim() || "";
    let snapshotEmail = email || null;
    let snapshotPhone = (phone || "").trim();

    console.log("user:", req.user);

    if (userId) {
      // Khách đã đăng nhập
      try {
        const {
          customer,
          fullName: f,
          email: e,
          phone: p,
        } = await getOrCreateCustomerForOnlineUser({
          user,
          fullName,
          email,
          phone,
        });

        customerId = customer.id;
        snapshotFullName = f;
        snapshotEmail = e;
        snapshotPhone = p;
      } catch (err) {
        if (err.message === "MISSING_PHONE_FOR_CUSTOMER") {
          return bad(
            res,
            "Tài khoản của bạn chưa có số điện thoại, vui lòng cập nhật trước khi đặt phòng",
            400
          );
        }
        if (err.message === "PHONE_OWNED_BY_ANOTHER_USER") {
          return bad(
            res,
            409,
            "Số điện thoại này đang thuộc về tài khoản khác, vui lòng dùng số khác"
          );
        }
        throw err;
      }
    } else {
      // Khách vãng lai
      if (!fullName || !email || !phone) {
        return bad(
          res,
          "Khách không đăng nhập phải nhập đầy đủ họ tên, email và số điện thoại",
          409
        );
      }

      try {
        const {
          customer,
          fullName: f,
          email: e,
          phone: p,
        } = await resolveGuestCustomerByPhone({
          phone,
          fullName,
          email,
        });

        customerId = customer.id;
        snapshotFullName = f;
        snapshotEmail = e;
        snapshotPhone = p;
      } catch (err) {
        if (err.message === "PHONE_OWNED_BY_REGISTERED_USER") {
          return bad(
            res,
            "Số điện thoại này đã được dùng cho tài khoản đã đăng ký, vui lòng đăng nhập để đặt phòng",
            409
          );
        }
        throw err;
      }
    }

    if (!snapshotFullName || !snapshotPhone) {
      return bad(res, "Thiếu họ tên hoặc số điện thoại người đặt phòng", 400);
    }

    const prismaGuestType = mapGuestType(guestType);

    // ====== TÍNH GIÁ / PROMO ======
    const nights = computeNight(startDate, endDate);
    const totalBefore = Number(room.roomType.basePrice) * nights;

    const { promo, discount } = await findPromotionByCode({
      hotelId: room.hotelId,
      roomTypeId: room.roomTypeId,
      total: totalBefore,
      code: promoCode,
    });

    const discountAmount = Number(discount || 0);
    const finalPrice = Math.max(0, totalBefore - discountAmount);

    // ====== TẠO BOOKING ======
    const booking = await prisma.booking.create({
      data: {
        userId,
        customerId,

        roomId: room.id,
        checkIn: startDate,
        checkOut: endDate,

        fullName: snapshotFullName,
        email: snapshotEmail,
        phone: snapshotPhone,
        guestType: prismaGuestType,
        arrivalTime: arrivalTime || null,

        status: "CONFIRMED",
        totalPrice: totalBefore,
        discountAmount,
        finalPrice,
        amountPaid: 0,
        paymentStatus: "UNPAID",
        source: "ONLINE",
        paymentMethod: "CARD",
        promotionId: promo?.id ?? null,
      },
      include: {
        room: { include: { roomType: true } },
        promotion: true,
      },
    });

    if (userId) {
      await pushNotification(userId, "booking", "Đặt phòng thành công");
    }
    return success(
      res,
      {
        bookingId: booking.id,
      },
      "Tạo đặt phòng thành công",
      201
    );
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

/* ==================== API: STAFF TẠO HỘ KHÁCH ==================== */
export async function adminCreateBooking(req, res) {
  try {
    const {
      customer = {},
      roomId,
      checkIn,
      checkOut,
      status = "PENDING",
      paymentMethod = "CASH",
      promoCode,
      arrivalTime,
      guestType = "OTHER",
    } = req.body || {};

    if (!roomId || !checkIn || !checkOut || !customer?.phone) {
      return bad(res, "Thiếu dữ liệu bắt buộc", 400);
    }

    const startDate = toDate(checkIn);
    const endDate = toDate(checkOut);
    if (!(startDate < endDate)) {
      return bad(res, "Ngày đặt không hợp lệ", 400);
    }

    const prismaGuestType = mapGuestType(guestType);

    // 1) Upsert customer theo phone
    const cust = await prisma.customer.upsert({
      where: { phone: String(customer.phone).trim() },
      update: {
        customerType: "REGISTERED",
        fullName:
          (customer.fullName && String(customer.fullName).trim()) || undefined,
        email: customer.email ?? undefined,
      },
      create: {
        fullName:
          (customer.fullName && String(customer.fullName).trim()) || "Khách lẻ",
        phone: String(customer.phone).trim(),
        email: customer.email ?? null,
        customerType: "GUEST",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        linkedUserId: true,
      },
    });

    // 2) Đồng bộ với bảng User (nếu có user cùng phone)
    let bookingUserId = cust.linkedUserId ?? null;

    if (!bookingUserId) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: cust.phone },
        select: { id: true },
      });

      if (existingUser) {
        bookingUserId = existingUser.id;
        await prisma.customer.update({
          where: { id: cust.id },
          data: { linkedUserId: existingUser.id },
        });
      }
    }

    // 3) Kiểm tra phòng
    const room = await prisma.room.findUnique({
      where: { id: Number(roomId) },
      include: { roomType: true },
    });

    if (!room || !room.active || !room.roomType?.active) {
      return bad(res, "Phòng không hợp lệ", 404);
    }

    await assertClash(room.id, startDate, endDate);

    // 4) Tính giá + promo
    const nights = computeNight(startDate, endDate);
    const base = Number(room.roomType.basePrice);
    const totalBefore = base * nights;

    const { promo, discount, reason } = await findPromotionByCode({
      hotelId: room.hotelId,
      roomTypeId: room.roomTypeId,
      total: totalBefore,
      code: promoCode,
    });

    const discountAmount = Number(discount || 0);
    const finalPrice = Math.max(0, totalBefore - discountAmount);

    // 5) Tạo booking + tăng totalUsed (trong transaction)
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: bookingUserId,
          customerId: cust.id,
          roomId: room.id,
          checkIn: startDate,
          checkOut: endDate,

          fullName: cust.fullName,
          email: cust.email,
          phone: cust.phone,
          guestType: prismaGuestType,
          arrivalTime: arrivalTime || null,

          status,
          totalPrice: totalBefore,
          discountAmount,
          finalPrice,
          amountPaid: 0,
          paymentStatus: "UNPAID",
          paymentMethod: paymentMethod === "CASH" ? "CASH" : paymentMethod,
          source: "STAFF",
          createdByUserId: req.user.id,
          promotionId: promo?.id ?? null,
        },
        include: {
          room: { include: { roomType: true } },
          promotion: true,
        },
      });

      // Nếu có promo hợp lệ -> tăng totalUsed
      if (promo) {
        await tx.promotion.update({
          where: { id: promo.id },
          data: {
            totalUsed: { increment: 1 },
          },
        });
      }

      return booking;
    });

    return success(
      res,
      {
        booking: result,
        pricing: {
          nights,
          unitPrice: base,
          totalBefore,
          discount: discountAmount,
          promoApplied: promo
            ? {
                id: promo.id,
                code: promo.code,
                scope: promo.scope,
                type: promo.discountType,
                value: promo.value,
                reason,
              }
            : null,
          totalAfter: finalPrice,
          paid: 0,
          remaining: finalPrice,
        },
      },
      "Tạo đặt phòng hộ khách thành công",
      201
    );
  } catch (e) {
    console.error(e);
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function createPaymentBanking(req, res) {
  const bookingId = Number(req.params.id);
  if (!bookingId) return bad(res, "Booking ID không hợp lệ", 400);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { room: true },
  });
  if (!booking) return bad(res, "Booking không tồn tại", 404);

  try {
    const remaining = Math.max(
      0,
      Number(booking.finalPrice) - Number(booking.amountPaid || 0)
    );
    if (remaining <= 0)
      return bad(res, 400, "Không còn số tiền cần thanh toán");

    const CUSTOMER_DEPOSIT = 150_000;

    const amount =
      req.user?.role === "MANAGER"
        ? remaining
        : Math.min(remaining, CUSTOMER_DEPOSIT);

    const params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_Amount: amount,
      vnp_CreateDate: dateFormat(new Date(), "yyyyMMddHHmmss"),
      vnp_ExpireDate: dateFormat(
        new Date(Date.now() + 15 * 60000),
        "yyyyMMddHHmmss"
      ),
      vnp_CurrCode: "VND",
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo:
        req.user?.role === "MANAGER"
          ? `Thanh toán toàn bộ cho đặt phòng: ${booking.room.name}`
          : `Đặt cọc cho đặt phòng: ${booking.room.name}`,
      vnp_OrderType: "other",
      vnp_ReturnUrl: "http://localhost:3001/api/bookings/check-payment-vnpay",
      vnp_TxnRef: `BOOK${bookingId}_${Date.now()}`.slice(0, 32),
      vnp_BankCode: "VNBANK",
    };

    const result = await vnpay.buildPaymentUrl(params);
    return success(
      res,
      { vnpayUrl: result, amount },
      "Tạo link thanh toán",
      201
    );
  } catch (err) {
    return bad(res, err.message, 400);
  }
}

export async function recordPaymentOffline(req, res) {
  const { bookingId, method, status, amount, note } = req.body || {};
  if (!bookingId || !method || !status)
    return bad(res, "Thiếu bookingId, method, status", 400);

  const amt = Number(amount || 0);
  if (status === "PAID" && (!Number.isFinite(amt) || amt <= 0))
    return bad(res, "amount phải > 0 khi PAID", 400);

  try {
    const now = new Date();
    const { booking: updatedBooking, payment: paymentRecord } =
      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: Number(bookingId) },
          include: {
            room: { include: { roomType: true } },
            customer: true,
          },
        });
        if (!booking) throw new Error("Booking không tồn tại");

        const payment = await tx.payment.create({
          data: {
            bookingId: Number(bookingId),
            amount: amt,
            method,
            status,
            paidAt: status === "PAID" ? now : null,
            note: note || null,
            provider: "OFFLINE",
          },
        });

        let newPaid = Number(booking.amountPaid);
        if (status === "PAID") newPaid += amt;
        if (status === "REFUNDED") newPaid = Math.max(0, newPaid - amt);

        const newStatus = nextPaymentStatus(
          Number(booking.finalPrice),
          newPaid
        );

        const updated = await tx.booking.update({
          where: { id: Number(bookingId) },
          data: { amountPaid: newPaid, paymentStatus: newStatus },
          include: {
            room: { include: { roomType: true } },
            customer: true,
          },
        });

        return { booking: updated, payment: payment };
      });

    // Gửi email xác nhận nếu là thanh toán PAID và có email
    if (status === "PAID" && amt > 0 && updatedBooking) {
      const toEmail =
        updatedBooking.email || updatedBooking.customer?.email || null;

      if (toEmail) {
        try {
          await sendBookingConfirmationEmail({
            to: toEmail,
            booking: updatedBooking,
            payment: paymentRecord,
          });
        } catch (mailErr) {
          console.error(
            "Send booking confirmation email (OFFLINE) error:",
            mailErr
          );
        }
      }
    }

    return success(
      res,
      { booking: updatedBooking },
      "Cập nhật thanh toán OFFLINE"
    );
  } catch (e) {
    return bad(res, e.message, 500);
  }
}
export async function checkPayment(req, res) {
  // ----- ONLINE: VNPay trả về -----
  if (req.query?.vnp_TxnRef) {
    const { isValid } = verifyVnpReturn(req);

    // Lấy bookingId từ mã TxnRef: BOOK123_...
    const m = String(req.query.vnp_TxnRef || "").match(/^BOOK(\d+)_/);
    const bookingId = m ? Number(m[1]) : null;

    // BASE PATH tùy theo nguồn booking
    let basePath = `${FE_ORIGIN}/manager/bookings`;

    if (bookingId) {
      try {
        const bk = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: {
            source: true,
            userId: true,
          },
        });

        if (bk?.source === "ONLINE") {
          if (bk.userId === null) {
            // khách vãng lai
            basePath = `${FE_ORIGIN}/?result=true`;
          } else {
            // khách đã đăng nhập
            basePath = `${FE_ORIGIN}/account/bookings/${bookingId}`;
          }
        } else {
          // booking tại quầy
          basePath = `${FE_ORIGIN}/manager/bookings`;
        }
      } catch (_) {}
    }

    // Sai signature
    if (!isValid) {
      const url = new URL(basePath);
      url.searchParams.set("result", "fail");
      url.searchParams.set("reason", "invalid_signature");
      return res.redirect(302, url.toString());
    }

    const q = req.query;
    const ok = q.vnp_ResponseCode === "00" && q.vnp_TransactionStatus === "00";

    // Không lấy được bookingId
    if (!bookingId) {
      const url = new URL(basePath);
      url.searchParams.set("result", "fail");
      url.searchParams.set("reason", "bad_txnref");
      return res.redirect(302, url.toString());
    }

    // Số tiền
    const amount = Number(q.vnp_Amount || 0) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      const url = new URL(basePath);
      url.searchParams.set("result", "fail");
      url.searchParams.set("reason", "bad_amount");
      return res.redirect(302, url.toString());
    }

    // VNPay báo thất bại
    if (!ok) {
      const url = new URL(basePath);
      url.searchParams.set("result", "fail");
      url.searchParams.set("code", String(q.vnp_ResponseCode || ""));
      return res.redirect(302, url.toString());
    }

    // Ghi nhận thanh toán
    const providerTxn = String(q.vnp_TransactionNo || "");
    const now = new Date();

    let trxResult = null;

    try {
      trxResult = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: {
            room: {
              include: {
                roomType: {
                  include: {
                    images: true,
                  },
                },
              },
            },
            customer: true,
          },
        });

        if (!booking) throw new Error("Booking không tồn tại");

        const existed = await tx.payment.findFirst({
          where: { provider: "VNPAY", providerTxn },
          select: { id: true },
        });

        let paymentRecord = null;

        if (!existed) {
          paymentRecord = await tx.payment.create({
            data: {
              bookingId,
              amount,
              method: "VNPAY",
              status: "PAID",
              paidAt: now,
              provider: "VNPAY",
              providerTxn,
              rawResponse: q,
              note: "VNPay return",
            },
          });
        }

        const fresh = await tx.booking.findUnique({
          where: { id: bookingId },
        });
        const newPaid = Number(fresh.amountPaid) + (existed ? 0 : amount);

        const newStatus = nextPaymentStatus(Number(fresh.finalPrice), newPaid);

        const updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: { amountPaid: newPaid, paymentStatus: newStatus },
          include: {
            room: {
              include: {
                roomType: {
                  include: {
                    images: true,
                  },
                },
              },
            },
            customer: true,
          },
        });

        return {
          booking: updatedBooking,
          payment: paymentRecord,
          isNewPayment: !existed,
        };
      });
    } catch (e) {
      const url = new URL(basePath);
      url.searchParams.set("result", "fail");
      url.searchParams.set("reason", "db_error");
      return res.redirect(302, url.toString());
    }

    // Gửi email xác nhận nếu có payment mới và có email
    if (trxResult?.isNewPayment && trxResult.payment && trxResult.booking) {
      const toEmail =
        trxResult.booking.email || trxResult.booking.customer?.email || null;

      if (toEmail) {
        try {
          await sendBookingConfirmationEmail({
            to: toEmail,
            booking: trxResult.booking,
            payment: trxResult.payment,
          });
        } catch (mailErr) {
          console.error(
            "Send booking confirmation email (VNPAY) error:",
            mailErr
          );
          // Không throw để tránh ảnh hưởng redirect
        }
      }
    }

    // THÀNH CÔNG
    {
      const url = new URL(basePath);
      url.searchParams.set("result", "success");
      return res.redirect(302, url.toString());
    }
  }

  // ----- OFFLINE: thu tại quầy -----
  const { bookingId, method, status, amount, note } = req.body || {};
  if (!bookingId || !method || !status)
    return bad(res, "Thiếu bookingId, method, status", 400);

  const amt = Number(amount || 0);
  if (status === "PAID" && (!Number.isFinite(amt) || amt <= 0))
    return bad(res, "amount phải > 0 khi PAID", 400);

  try {
    const now = new Date();
    const { booking: updatedBooking, payment: paymentRecord } =
      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: Number(bookingId) },
          include: {
            room: { include: { roomType: true } },
            customer: true,
          },
        });
        if (!booking) throw new Error("Booking không tồn tại");

        const payment = await tx.payment.create({
          data: {
            bookingId: Number(bookingId),
            amount: amt,
            method,
            status,
            paidAt: status === "PAID" ? now : null,
            note: note || null,
            provider: "OFFLINE",
          },
        });

        let newPaid = Number(booking.amountPaid);
        if (status === "PAID") newPaid += amt;
        if (status === "REFUNDED") newPaid = Math.max(0, newPaid - amt);

        const newStatus = nextPaymentStatus(
          Number(booking.finalPrice),
          newPaid
        );

        const updated = await tx.booking.update({
          where: { id: Number(bookingId) },
          data: { amountPaid: newPaid, paymentStatus: newStatus },
          include: {
            room: { include: { roomType: true } },
            customer: true,
          },
        });

        return { booking: updated, payment: payment };
      });

    // Gửi email xác nhận nếu là thanh toán PAID và có email
    if (status === "PAID" && amt > 0 && updatedBooking) {
      const toEmail =
        updatedBooking.email || updatedBooking.customer?.email || null;

      if (toEmail) {
        try {
          await sendBookingConfirmationEmail({
            to: toEmail,
            booking: updatedBooking,
            payment: paymentRecord,
          });
        } catch (mailErr) {
          console.error(
            "Send booking confirmation email (OFFLINE) error:",
            mailErr
          );
        }
      }
    }

    return success(
      res,
      { booking: updatedBooking },
      "Cập nhật thanh toán OFFLINE"
    );
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

export async function listMyBookings(req, res) {
  try {
    const userId = req.user.id;

    const { page, limit, skip } = parsePageLimit(req, {
      maxLimit: 50,
      defaultLimit: 10,
    });

    const status = req.query.status || "CONFIRMED";

    const where = {
      userId,
      ...(status ? { status } : {}),
    };

    const total = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          include: {
            roomType: {
              include: {
                images: {
                  where: { isPrimary: true },
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
        review: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const meta = buildOffsetMeta({ page, limit, total });

    // map thêm canReview + tiện lấy luôn primaryImage
    const items = bookings.map((b) => {
      const canReview =
        b.status === "CHECKED_OUT" && b.paymentStatus === "PAID" && !b.review;
      const roomType = b.room?.roomType;
      const primaryImage = roomType?.images?.[0] || null;

      return {
        ...b,
        canReview,
        room: {
          ...b.room,
          roomType: {
            ...roomType,
            images: roomType?.images || [],
            primaryImageUrl: primaryImage?.url || null,
          },
        },
      };
    });

    return success(res, { items, meta }, "Danh sách đặt phòng của bạn");
  } catch (err) {
    console.error("listMyBookings error:", err);
    return bad(res, "Không thể lấy danh sách đặt phòng.", 500);
  }
}

export async function listAllBookings(req, res) {
  const { page, limit, skip } = parsePageLimit(req, {
    maxLimit: 100,
    defaultLimit: 20,
  });
  const { q } = req.query;

  const bookingNumber = q?.match(/\d+/)?.[0];
  const qLower = q ? q.toLowerCase() : undefined;

  const where = q
    ? {
        OR: [
          bookingNumber ? { id: Number(bookingNumber) } : undefined,
          {
            customer: {
              fullName: {
                contains: qLower,
              },
            },
          },
        ].filter(Boolean),
      }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        room: {
          include: { roomType: true, hotel: true },
        },
        customer: true,
        promotion: {
          select: {
            id: true,
            code: true,
            description: true,
            scope: true,
            discountType: true,
            value: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paidAt: true,
            provider: true,
            note: true,
          },
          orderBy: { createdAt: "desc" },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);

  return success(
    res,
    {
      items,
      meta: buildOffsetMeta({ page, limit, total }),
    },
    "Danh sách tất cả đặt phòng"
  );
}

export async function updateBookingStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!id || !status) return bad(res, "Thiếu id hoặc status", 400);

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
  });
  return success(res, updated, "Cập nhật trạng thái đặt phòng");
}

export async function cancelBooking(req, res) {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.user.id;
    const { reason } = req.body || {};

    if (!bookingId || Number.isNaN(bookingId)) {
      return bad(res, "ID đặt phòng không hợp lệ", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    // Không tìm thấy / không phải booking của user
    if (!booking || booking.userId !== userId) {
      return bad(res, "Không có quyền hủy đặt phòng này", 403);
    }

    // Các trạng thái không cho hủy
    if (["CANCELLED", "CHECKED_IN", "CHECKED_OUT"].includes(booking.status)) {
      return bad(res, "Không thể hủy đặt phòng ở trạng thái hiện tại", 400);
    }

    const reasonText =
      (reason && String(reason).trim()) || "Khách tự hủy đặt phòng";

    // Transaction: update Booking + tạo CancelReason
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // 1. Update status
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });
      const existedReason = await prisma.cancelReason.findUnique({
        where: { bookingId: bookingId },
      });
      if (existedReason) {
        return bad(res, "Đặt phòng này đã được hủy trước đó", 400);
      }
      // 2. Tạo record CancelReason (mỗi booking 1 lý do -> bookingId @unique)
      await tx.cancelReason.create({
        data: {
          bookingId: bookingId,
          reasonText,
          cancelledBy: userId,
          cancelledAt: new Date(),
          isSystem: false,
        },
      });

      return b;
    });

    return success(res, updatedBooking, "Hủy đặt phòng thành công");
  } catch (err) {
    console.error("cancelBooking error:", err);
    return bad(res, "Lỗi server khi hủy đặt phòng", 500);
  }
}

export async function getBookingQuote(req, res) {
  const { roomId, checkIn, checkOut, promoCode } = req.body;

  if (!roomId || !checkIn || !checkOut) {
    return bad(res, "Thiếu dữ liệu bắt buộc", 400);
  }

  const startDate = toDate(checkIn);
  const endDate = toDate(checkOut);

  if (!(startDate < endDate)) {
    return bad(res, "Ngày đặt không hợp lệ", 400);
  }

  const room = await prisma.room.findUnique({
    where: { id: Number(roomId) },
    include: { roomType: true },
  });

  if (!room || !room.active || !room.roomType?.active) {
    return bad(res, "Phòng không hợp lệ", 404);
  }

  const nights = computeNight(startDate, endDate);
  const base = Number(room.roomType.basePrice);
  const totalBefore = base * nights;

  // LẤY reason
  const { promo, discount, reason } = await findPromotionByCode({
    hotelId: room.hotelId,
    roomTypeId: room.roomTypeId,
    total: totalBefore,
    code: promoCode,
  });

  // Nếu FE gửi promoCode và có lỗi reason → báo bad
  if (promoCode && reason) {
    let message = "Mã giảm giá không hợp lệ";

    if (reason === "INVALID_CODE") message = "Mã giảm giá không đúng";
    if (reason === "NOT_ENOUGH_MIN_TOTAL")
      message = "Chưa đạt mức tối thiểu để áp dụng mã giảm giá";
    if (reason === "CODE_NOT_FOR_ROOMTYPE")
      message = "Mã giảm giá không áp dụng cho loại phòng này";
    if (reason === "PROMO_EXHAUSTED")
      message = "Mã giảm giá đã hết lượt sử dụng";

    return bad(res, message, 400);
  }

  const totalAfter = Math.max(0, totalBefore - discount);

  return success(
    res,
    {
      nights,
      unitPrice: base,
      totalBefore,
      discount,
      promoApplied: promo
        ? {
            id: promo.id,
            code: promo.code,
            scope: promo.scope,
            type: promo.discountType,
            value: promo.value,
          }
        : null,
      totalAfter,
    },
    "Báo giá đặt phòng"
  );
}
export async function getBookingById(req, res) {
  const id = req.params.id;
  if (!id) return bad(res, "Thiếu ID đặt phòng", 400);

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        room: {
          include: {
            roomType: {
              include: {
                images: true,
              },
            },
          },
        },
        customer: true,
        promotion: {
          select: {
            id: true,
            code: true,
            scope: true,
            discountType: true,
            value: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paidAt: true,
            provider: true,
          },
        },
        review: true, // relation 1-1 từ Booking -> Review
      },
    });

    if (!booking) return bad(res, "Đặt phòng không tồn tại", 404);

    const canReview =
      booking.status === "CHECKED_OUT" &&
      booking.paymentStatus === "PAID" &&
      !booking.review; // chưa có review cho booking này

    const response = {
      id: booking.id,
      customer: booking.customer
        ? {
            id: booking.customer.id,
            fullName: booking.customer.fullName,
            email: booking.customer.email,
            phone: booking.customer.phone,
          }
        : null,
      room: {
        id: booking.room.id,
        name: booking.room.name,
        roomType: {
          id: booking.room.roomType.id,
          name: booking.room.roomType.name,
          basePrice: Number(booking.room.roomType.basePrice),
          capacity: Number(booking.room.roomType.capacity),
          images:
            booking.room.roomType.images?.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
            })) ?? [],
        },
      },
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      totalPrice: Number(booking.totalPrice),
      discountAmount: Number(booking.discountAmount || 0),
      finalPrice: Number(booking.finalPrice),
      amountPaid: Number(booking.amountPaid || 0),
      source: booking.source,
      createdByUserId: booking.createdByUserId,
      promotion: booking.promotion || null,
      payments: booking.payments || [],
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      canReview,
    };

    return success(res, response, "Lấy thông tin đặt phòng thành công");
  } catch (e) {
    console.error("getBookingById error:", e);
    return bad(res, e.message || "Lỗi server", 500);
  }
}

import { prisma } from "../../lib/prisma.js";
import { sendBookingConfirmationEmail } from "../../utils/mailer.js";
import { bad, success } from "../../utils/response.js";
import { paymentBanking } from "../../utils/paymentOnline.js";

const FE_ORIGIN = process.env.FE_ORIGIN || "http://localhost:5173";

export async function create(req, res) {
  try {
    const { bookingId, method } = req.body || {};
    if (!bookingId) return bad(res, "bookingId là trường bắt buộc", 400);

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId },
      include: {
        room: true,
        customer: {
          include: { user: true },
        },
      },
    });

    if (!["CASH", "TRANSFER"].includes(method)) {
      return bad(
        res,
        "Phương thức thanh toán không hợp lệ (chỉ hỗ trợ CASH hoặc TRANSFER)",
        400,
      );
    }

    if (!booking) {
      return bad(res, "Không tồn tại Đặt phòng", 400);
    }

    if (booking.paymentStatus === "PAID") {
      return bad(res, "Tiền phòng đã được thanh toán", 400);
    }

    const totalAmountToPay =
      Number(booking.baseAmount) -
      Number(booking.discountAmount) -
      Number(booking.totalPaid || 0);

    if (!Number.isFinite(totalAmountToPay) || totalAmountToPay <= 0) {
      return bad(res, "Số tiền cần thanh toán không hợp lệ", 400);
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: totalAmountToPay,
        method,
      },
    });

    return success(
      res,
      {
        paymentId: payment.id,
      },
      "Tạo thanh toán ONLINE thành công",
      201,
    );
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

export async function createPaymentOnlineLink(req, res) {
  try {
    console.log("[createPaymentOnlineLink] Request received", {
      params: req.params,
      body: req.body,
    });

    const { paymentId } = req.body || {};
    console.log("[createPaymentOnlineLink] paymentId from body:", paymentId);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!payment) {
      return bad(res, "Không tìm thấy payment", 404);
    }

    if (payment.method !== "TRANSFER") {
      return bad(res, "Payment này không phải ONLINE", 400);
    }

    if (payment.status !== "UNPAID") {
      return bad(res, "Payment không ở trạng thái tạo link", 400);
    }

    const successUrl = `${FE_ORIGIN}/manager/bookings?result=success&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(payment.bookingId)}`;
    const errorUrl = `${FE_ORIGIN}/manager/bookings?result=fail&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(payment.bookingId)}`;
    const cancelUrl = `${FE_ORIGIN}/manager/bookings?result=cancel&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(payment.bookingId)}`;

    console.log("[createPaymentOnlineLink] Creating checkout link", {
      paymentId: payment.id,
      amount: payment.amount,
    });

    const { checkoutURL, fields } = paymentBanking({
      id: payment.id,
      amount: Math.round(Number(payment.amount)),
      desc: `Thanh toán đặt phòng: ${payment.booking.room?.name || ""}`,
      successUrl,
      errorUrl,
      cancelUrl,
    });

    console.log(
      "[createPaymentOnlineLink] Checkout link created successfully",
      {
        checkoutURL,
      },
    );

    return success(
      res,
      {
        checkoutURL,
        fields,
        paymentId: payment.id,
      },
      "Tạo link thanh toán ONLINE thành công",
      200,
    );
  } catch (e) {
    console.error("[createPaymentOnlineLink] Error occurred", e);
    return bad(res, e.message, 500);
  }
}

export async function markAsPaid(req, res) {
  try {
    const paymentId = req.params.id || null;

    if (!paymentId) {
      return bad(res, "paymentId là trường bắt buộc", 400);
    }

    const now = new Date();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    const paymentAvailable = await prisma.payment.findFirst({
      where: {
        id: Number(paymentId),
        createdAt: {
          gte: new Date(now - FIFTEEN_MINUTES),
        },
        status: "UNPAID",
      },
    });

    if (!paymentAvailable) {
      return bad(res, "Không tìm thấy thanh toán", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const updatedPayment = await tx.payment.update({
        where: { id: Number(paymentId) },
        data: {
          status: "PAID",
          paidAt: now,
        },
      });
      const updatedBooking = await tx.booking.update({
        where: { id: updatedPayment.bookingId },
        data: {
          paymentStatus: "PAID",
        },
      });
      return { updatedPayment, updatedBooking };
    });

    return success(
      res,
      {
        payment: result.updatedPayment,
        booking: result.updatedBooking,
      },
      "Thanh toán đã được cập nhật trạng thái thành đã thanh toán",
      200,
    );
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

export async function markAsFailed(req, res) {
  try {
    const paymentId = req.params.id || null;
    if (!paymentId) {
      return bad(res, "paymentId là trường bắt buộc", 400);
    }

    const paymentAvailable = await prisma.payment.findFirst({
      where: { id: Number(paymentId), status: "UNPAID" },
    });

    if (!paymentAvailable) {
      return bad(res, "Không tìm thấy thanh toán", 404);
    }

    const payment = await prisma.payment.update({
      where: { id: Number(paymentId) },
      data: {
        status: "FAILED",
      },
    });

    return success(
      res,
      payment,
      "Thanh toán đã được cập nhật trạng thái thành thất bại",
      200,
    );
  } catch (e) {
    return bad(res, e.message, 500);
  }
}

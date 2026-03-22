import { prisma } from "../../lib/prisma.js";
import { paymentBanking } from "../../utils/paymentOnline.js";
import { bad, success } from "../../utils/response.js";
const FE_ORIGIN = process.env.FE_ORIGIN || "http://localhost:5173";

export async function create(req, res) {
  try {
    const {
      invoiceId,
      type = "DEPOSIT",
      amount = 150000,
      method = "TRANSFER",
    } = req.body || {};
    if (!invoiceId) {
      return bad(res, "Thiếu thông tin ID", 400);
    }
    if (type !== "DEPOSIT") {
      return bad(res, "Loại thanh toán không hợp lệ", 400);
    }
    if (method !== "TRANSFER") {
      return bad(res, "Loại thanh toán không hợp lệ", 400);
    }
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(invoiceId) },
      select: { id: true },
    });
    if (!invoice) {
      return bad(res, "Không tồn tại hóa đơn", 400);
    }

    const existedPayment = await prisma.payment.findFirst({
      where: {
        invoiceId: invoice.id,
        type: "DEPOSIT",
        status: "PAID",
      },
    });

    if (existedPayment)
      return bad(res, "Đã đặt cọc cho đơn đặt phòng này", 400);
    const data = {
      invoiceId: Number(invoiceId),
      type,
      amount: Number(amount),
      method,
    };

    const payment = await prisma.payment.create({
      data,
      select: { id: true },
    });
    return success(res, { paymentId: payment.id }, 201);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function createCheckoutLink(req, res) {
  try {
    const isAdmin = req.user && req.user.role !== "CUSTOMER";

    const paymentId = Number(req.params.id);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            booking: {
              include: {
                room: true,
              },
            },
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

    const bookingId = payment.invoice?.booking?.id;

    let successUrl, errorUrl, cancelUrl;
    if (isAdmin) {
      successUrl = `${FE_ORIGIN}/manager/bookings?result=success&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(bookingId)}`;
      errorUrl = `${FE_ORIGIN}/manager/bookings?result=fail&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(bookingId)}`;
      cancelUrl = `${FE_ORIGIN}/manager/bookings?result=cancel&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(bookingId)}`;
    } else {
      successUrl = `${FE_ORIGIN}/payment?result=success&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(bookingId)}&invoiceId=${encodeURIComponent(payment.invoice.id)}`;
      errorUrl = `${FE_ORIGIN}/payment?result=fail&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(bookingId)}&invoiceId=${encodeURIComponent(payment.invoice.id)}`;
      cancelUrl = `${FE_ORIGIN}/payment?result=cancel&paymentId=${encodeURIComponent(paymentId)}&bookingId=${encodeURIComponent(bookingId)}&invoiceId=${encodeURIComponent(payment.invoice.id)}`;
    }

    const { checkoutURL, fields } = paymentBanking({
      id: payment.id,
      amount: Math.round(Number(payment.amount)),
      desc: `Thanh toán đặt phòng: ${payment.invoice.booking.room?.name || ""}`,
      successUrl,
      errorUrl,
      cancelUrl,
    });

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

export async function updateStatus(req, res) {
  try {
    const paymentId = Number(req.params.id);
    const { status } = req.body || {};

    if (!paymentId) {
      return bad(res, "paymentId là trường bắt buộc", 400);
    }

    if (!["PAID", "FAILED"].includes(status)) {
      return bad(res, "Trạng thái không hợp lệ", 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        status: true,
        invoiceId: true,
        amount: true,
      },
    });

    if (!payment) {
      return bad(res, "Không tìm thấy thanh toán", 404);
    }

    if (payment.status !== "UNPAID") {
      return bad(res, "Payment không ở trạng thái cập nhật", 400);
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          paidAt: status === "PAID" ? now : null,
        },
        select: {
          invoiceId: true,
          amount: true,
          status: true,
        },
      });

      if (status !== "PAID") {
        return { payment: updatedPayment };
      }

      const invoice = await tx.invoice.findUnique({
        where: { id: updatedPayment.invoiceId },
        select: {
          paidAmount: true,
        },
      });

      const newPaidAmount =
        Number(invoice.paidAmount || 0) + Number(updatedPayment.amount || 0);

      const updatedInvoice = await tx.invoice.update({
        where: { id: updatedPayment.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: "ACTIVE",
        },
        select: {
          id: true,
          bookingId: true,
        },
      });

      await tx.booking.update({
        where: {
          id: updatedInvoice.bookingId,
        },
        data: {
          status: "CONFIRMED",
        },
      });

      return { payment: updatedPayment, invoice: updatedInvoice };
    });

    return success(res, result, "Cập nhật trạng thái payment thành công", 200);
  } catch (e) {
    console.error(e);
    return bad(res, e.message, 500);
  }
}

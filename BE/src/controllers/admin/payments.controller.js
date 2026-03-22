import { prisma } from "../../lib/prisma.js";
import { sendBookingConfirmationEmail } from "../../utils/mailer.js";
import { bad, success } from "../../utils/response.js";
import { paymentBanking } from "../../utils/paymentOnline.js";

export async function create(req, res) {
  try {
    const { invoiceId, method, amount, type } = req.body || {};
    if (!invoiceId) return bad(res, "invoiceId là trường bắt buộc", 400);

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0)
      return bad(res, "Số tiền cần thanh toán không hợp lệ", 400);

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(invoiceId) },
      select: {
        status: true,
      },
    });

    if (!["CASH", "TRANSFER"].includes(method))
      return bad(
        res,
        "Phương thức thanh toán không hợp lệ (chỉ hỗ trợ CASH hoặc TRANSFER)",
        400,
      );

    if (type && !["DEPOSIT", "ROOM", "SERVICE"].includes(type))
      return bad(res, "Loại thanh toán không hợp lệ.");

    if (!invoice) return bad(res, "Không tồn tại Hóa đơn", 400);

    if (invoice.status === "PAID")
      return bad(res, "Hóa đơn đã được thanh toán", 400);

    if (invoice.status === "CANCELLED")
      return bad(res, "Hóa đơn đã được hủy bỏ", 400);

    const existedRoomOrDeposit = await prisma.payment.findFirst({
      where: {
        invoiceId: Number(invoiceId),
        type: {
          in: ["ROOM", "DEPOSIT"],
        },
      },
      select: { id: true },
    });

    let paymentType = type;

    if (!paymentType) {
      paymentType = existedRoomOrDeposit ? "SERVICE" : "ROOM";
    }

    if (paymentType === "SERVICE" && !existedRoomOrDeposit) {
      return bad(
        res,
        "Không thể tạo thanh toán SERVICE khi chưa có ROOM hoặc DEPOSIT",
        400,
      );
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: Number(amount),
        method,
        type: paymentType,
      },
      select: { id: true },
    });

    return success(
      res,
      {
        paymentId: payment.id,
      },
      "Tạo thanh toán thành công",
      201,
    );
  } catch (e) {
    console.error(e);
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
          subtotal: true,
          tax: true,
          discount: true,
          status: true,
        },
      });

      const total =
        Number(invoice.subtotal || 0) +
        Number(invoice.tax || 0) -
        Number(invoice.discount || 0);

      const newPaidAmount =
        Number(invoice.paidAmount || 0) + Number(updatedPayment.amount || 0);

      const updatedInvoice = await tx.invoice.update({
        where: { id: updatedPayment.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newPaidAmount >= total ? "PAID" : "ACTIVE",
        },
        select: {
          id: true,
          bookingId: true,
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

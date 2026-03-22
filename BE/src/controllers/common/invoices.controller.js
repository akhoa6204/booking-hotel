import { bad, success } from "../../utils/response.js";
import { prisma } from "../../lib/prisma.js";
export async function getById(req, res) {
  try {
    const { id } = req.params;

    if (!id) return bad(res, "Thiếu invoiceId", 400);

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        subtotal: true,
        discount: true,
        tax: true,
        paidAmount: true,
      },
    });

    if (!invoice) return bad(res, "Invoice không tồn tại", 404);

    const subtotal = Number(invoice.subtotal || 0);
    const discount = Number(invoice.discount || 0);
    const tax = Number(invoice.tax || 0);
    const total = subtotal - discount + tax;
    const paidAmount = Number(invoice.paidAmount || 0);

    return success(
      res,
      {
        id: invoice.id,
        subtotal,
        discount,
        tax,
        total,
        paidAmount,
      },
      200,
    );
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

import { prisma } from "../../lib/prisma.js";
import { success, bad } from "../../utils/response.js";

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { services = [], removeItemIds = [] } = req.body || {};

    if (!id) return bad(res, "Thiếu invoiceId", 400);

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: Number(id) },
      });

      if (!invoice) throw new Error("Invoice không tồn tại");

      if (Array.isArray(removeItemIds) && removeItemIds.length > 0) {
        await tx.invoiceItem.deleteMany({
          where: {
            id: { in: removeItemIds.map(Number) },
            invoiceId: invoice.id,
            type: "SERVICE",
          },
        });
      }

      let addedAmount = 0;

      if (Array.isArray(services) && services.length > 0) {
        for (const item of services) {
          const { serviceId, quantity = 1 } = item;

          const service = await tx.service.findUnique({
            where: { id: Number(serviceId), isActive: true },
          });

          if (!service) continue;

          const unitPrice = Number(service.price);
          const totalPrice = unitPrice * quantity;

          const existingItem = await tx.invoiceItem.findFirst({
            where: {
              invoiceId: invoice.id,
              serviceId: service.id,
              type: "SERVICE",
            },
          });

          if (existingItem) {
            const newQuantity = quantity;
            const newTotalPrice = newQuantity * unitPrice;

            await tx.invoiceItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: newQuantity,
                unitPrice,
                totalPrice: newTotalPrice,
              },
            });

            addedAmount += unitPrice * quantity;
          } else {
            await tx.invoiceItem.create({
              data: {
                invoiceId: invoice.id,
                type: "SERVICE",
                description: service.name,
                quantity,
                unitPrice,
                totalPrice,
                serviceId: service.id,
              },
            });

            addedAmount += totalPrice;
          }
        }
      }

      const sum = await tx.invoiceItem.aggregate({
        where: { invoiceId: invoice.id },
        _sum: { totalPrice: true },
      });

      const newSubtotal = Number(sum._sum.totalPrice || 0);

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          subtotal: newSubtotal,
          status: "ACTIVE",
        },
      });

      return updatedInvoice;
    });

    return success(
      res,
      {
        invoiceId: result.id,
        subtotal: Number(result.subtotal || 0),
        discount: Number(result.discount || 0),
        tax: Number(result.tax || 0),
        total:
          Number(result.subtotal || 0) -
          Number(result.discount || 0) +
          Number(result.tax || 0),
        paidAmount: Number(result.paidAmount || 0),
        remainingAmount:
          Number(result.subtotal || 0) -
          Number(result.discount || 0) +
          Number(result.tax || 0) -
          Number(result.paidAmount || 0),
      },
      200,
    );
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;

    if (!id) return bad(res, "Thiếu invoiceId", 400);

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) return bad(res, "Invoice không tồn tại", 404);

    const subtotal = Number(invoice.subtotal || 0);
    const discount = Number(invoice.discount || 0);
    const tax = Number(invoice.tax || 0);
    const total = subtotal - discount + tax;
    const paidAmount = Number(invoice.paidAmount || 0);

    const remainingAmount = total - paidAmount;

    return success(
      res,
      {
        invoiceId: invoice.id,
        items: invoice.items,
        payments: invoice.payments,
        subtotal,
        discount,
        tax,
        total,
        paidAmount,
        remainingAmount,
      },
      200,
    );
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

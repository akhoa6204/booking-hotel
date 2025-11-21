import { prisma } from "../lib/prisma.js";

export async function payBooking(req, res) {
  try {
    const bookingId = Number(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.userId !== req.user.id && req.user.role !== "MANAGER") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { method } = req.body; // CASH | CARD | TRANSFER
    await prisma.payment.upsert({
      where: { bookingId },
      create: { bookingId, amount: booking.totalPrice, method, status: "PAID", paidAt: new Date() },
      update: { method, status: "PAID", paidAt: new Date() }
    });
    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus: "PAID", status: "CONFIRMED" } });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

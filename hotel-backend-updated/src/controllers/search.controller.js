import { prisma } from "../lib/prisma.js";

export async function searchRooms(req, res) {
  try {
    const { q, checkIn, checkOut, guests, minPrice, maxPrice, type, hotelId } = req.query;
    const where = {
      hotelId: hotelId ? Number(hotelId) : undefined,
      type: type || undefined,
      capacity: guests ? { gte: Number(guests) } : undefined,
      pricePerNight: (minPrice || maxPrice) ? {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined
      } : undefined,
      name: q ? { contains: String(q), mode: "insensitive" } : undefined
    };

    // filter by availability in date range
    let rooms = await prisma.room.findMany({
      where,
      include: { bookings: { where: { status: { in: ["CONFIRMED","CHECKED_IN"] } } } }
    });

    if (checkIn && checkOut) {
      const a = new Date(checkIn), b = new Date(checkOut);
      rooms = rooms.filter(r => !r.bookings.some(bk => (bk.checkIn < b && a < bk.checkOut)));
    }

    res.json(rooms);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

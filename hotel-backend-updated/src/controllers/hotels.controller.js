import { prisma } from "../lib/prisma.js";

export async function getHotel(req, res) {
  try {
    const hotel = await prisma.hotel.findFirst({ include: { services: true } });
    res.json(hotel);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function upsertHotel(req, res) {
  try {
    const { id, name, address, description, images, policies } = req.body;
    const data = { name, address, description, images, policies };
    const hotel = id
      ? await prisma.hotel.update({ where: { id: Number(id) }, data })
      : await prisma.hotel.create({ data });
    res.json(hotel);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

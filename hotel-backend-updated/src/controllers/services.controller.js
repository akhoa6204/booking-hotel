import { prisma } from "../lib/prisma.js";

export async function listServices(req, res) {
  try {
    const hotelId = Number(req.query.hotelId) || (await prisma.hotel.findFirst())?.id;
    const services = await prisma.service.findMany({ where: { hotelId } });
    res.json(services);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function createService(req, res) {
  try {
    const { hotelId, name, description, price } = req.body;
    const s = await prisma.service.create({ data: { hotelId: Number(hotelId), name, description, price } });
    res.status(201).json(s);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateService(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, description, price } = req.body;
    const s = await prisma.service.update({ where: { id }, data: { name, description, price } });
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function deleteService(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.service.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

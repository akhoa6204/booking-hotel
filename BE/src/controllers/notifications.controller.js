import { prisma } from "../lib/prisma.js";

export async function listMyNotifications(req, res) {
  try {
    const items = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function markRead(req, res) {
  try {
    const id = Number(req.params.id);
    const n = await prisma.notification.update({ where: { id }, data: { isRead: true } });
    res.json(n);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function pushNotification(userId, type, message) {
  try {
    await prisma.notification.create({ data: { userId, type, message } });
  } catch {}
}

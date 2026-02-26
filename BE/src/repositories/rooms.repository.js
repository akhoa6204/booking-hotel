import { prisma } from "../lib/prisma.js";

export async function findAvailableRoomByRoomType({
  roomType_id,
  start_date,
  end_date,
}) {
  return await prisma.room.findFirst({
    where: {
      roomType_id: Number(roomType_id),
      is_active: true,
      roomType: { is_active: true },
      bookings: {
        none: {
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          AND: [
            { check_in: { lt: end_date } },
            { check_out: { gt: start_date } },
          ],
        },
      },
    },
    include: { roomType: true },
  });
}

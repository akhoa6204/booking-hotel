import { prisma } from "../lib/prisma.js";
import { success, bad } from "../utils/response.js";

// GET /api/amenities
export async function list(req, res) {
  try {
    const items = await prisma.amenity.findMany({
      orderBy: { label: "asc" },
    });
    return success(res, { items });
  } catch (e) {
    return bad(res, e.message ?? "Lỗi hệ thống", 500);
  }
}

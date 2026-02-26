import { prisma } from "../../lib/prisma.js";
import { buildOffsetMeta, parsePageLimit } from "../../utils/pagination.js";
import { bad, success } from "../../utils/response.js";

export async function list(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    const where = {
      type: { not: "CUSTOMER" },
    };

    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          type: true,
          staff: {
            select: {
              position: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return success(res, {
      items: employees,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

import { prisma } from "../../lib/prisma.js";
import { buildOffsetMeta, parsePageLimit } from "../../utils/pagination.js";
import { bad, success } from "../../utils/response.js";

export async function list(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req);
    const { type, q } = req.query;

    if (type && !["SERVICE", "EXTRA_FEE"].includes(type))
      return bad(res, "Không tồn tại loại dịch vụ này", 400);

    const where = {
      isActive: true,
      ...(type ? { type } : {}),
      ...(q?.trim().toLowerCase()
        ? { name: { contains: q.trim().toLowerCase() } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    return success(res, {
      items,
      meta: buildOffsetMeta({ total, page, limit }),
    });
  } catch (err) {
    return bad(res, err.message);
  }
}

export async function create(req, res) {
  try {
    const { name, description, price, type } = req.body;

    if (!name || !price || !type) {
      return bad(res, "Thiếu dữ liệu bắt buộc");
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        type,
      },
    });

    return success(res, service);
  } catch (err) {
    return bad(res, err.message);
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, type } = req.body;
    if (!["SERVICE", "EXTRA_FEE"].includes(type))
      return bad(res, "Loại dịch vụ không tồn tại", 400);
    const service = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(description?.trim() ? { description: description.trim() } : {}),
        ...(!isNaN(Number(price)) ? { price: Number(price) } : {}),
        ...(type ? { type } : {}),
      },
    });

    return success(res, service);
  } catch (err) {
    return bad(res, err.message);
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;

    await prisma.service.update({
      where: { id: Number(id) },
      data: {
        isActive: false,
      },
    });

    return success(res, true);
  } catch (err) {
    return bad(res, err.message);
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Thiếu thông tin ID", 400);

    const service = await prisma.service.findUnique({
      where: { id: Number(id), isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        type: true,
        description: true,
      },
    });
    if (!service) return bad(res, "Không tồn tại dịch vụ", 400);
    return success(res, service, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

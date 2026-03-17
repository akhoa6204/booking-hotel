import { prisma } from "../../lib/prisma.js";
import { buildOffsetMeta, parsePageLimit } from "../../utils/pagination.js";
import { bad, success } from "../../utils/response.js";
import bcrypt from "bcryptjs";

const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function list(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { defaultLimit: 10 });

    const q = req.query.q?.toLowerCase();
    const position = req.query.position?.toUpperCase();

    const where = {
      type: { not: "CUSTOMER" },
      ...(q && {
        OR: [
          { fullName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      }),
      ...(position && {
        staff: {
          position: position,
        },
      }),
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
          isActive: true,
          staff: {
            select: {
              position: true,
              isAdmin: true,
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

export async function getById(req, res) {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Missing id", 400);

    const employee = await prisma.user.findFirst({
      where: { id: Number(id), type: { not: "CUSTOMER" } },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        type: true,
        isActive: true,
        staff: {
          select: {
            position: true,
            isAdmin: true,
          },
        },
      },
    });

    if (!employee) return bad(res, "Employee not found", 404);
    return success(res, employee, 200);
  } catch (e) {
    return bad(res, e.message || "Internal error", 500);
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Missing id", 400);

    const { fullName, phone, email, position, isActive } = req.body;
    const employee = await prisma.user.findFirst({
      where: { id: Number(id), type: { not: "CUSTOMER" } },
    });

    if (!employee) return bad(res, "Employee not found", 404);

    if (phone) {
      const existedPhone = await prisma.user.findFirst({
        where: {
          phone: String(phone),
          NOT: { id: Number(id) },
        },
        select: { id: true },
      });

      if (existedPhone) {
        return bad(res, "Số điện thoại đã tồn tại", 400);
      }
    }
    const data = {
      ...(fullName ? { fullName } : {}),
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(position ? { staff: { update: { position } } } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };
    await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    return success(res, null, 200);
  } catch (e) {
    console.error(e);
    return bad(res, e.message || "Internal error", 500);
  }
}

export async function changePassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body || {};
    console.log(req.body);

    if (!id || !newPassword)
      return bad(res, "Thiếu thông tin ID hoặc newPassword", 400);

    const employee = await prisma.user.findFirst({
      where: { id: Number(id), type: { not: "CUSTOMER" } },
      select: { id: true },
    });

    if (!employee) return bad(res, "Nhân sự không tồn tại", 404);

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return success(res, null, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function create(req, res) {
  try {
    const {
      fullName,
      phone,
      email,
      position,
      isAdmin = false,
    } = req.body || {};

    if (!fullName || !phone || !email || !position) {
      return bad(res, "Thiếu thông tin nhân sự", 400);
    }

    if (!/^\d{10}$/.test(String(phone))) {
      return bad(res, "Điện thoại không hợp lệ", 400);
    }

    if (!isValidEmail(email)) {
      return bad(res, "Email không hợp lệ", 400);
    }

    if (!["RECEPTION", "HOUSEKEEPING", "MANAGER"].includes(position)) {
      return bad(res, "Vị trí không hợp lệ", 400);
    }

    const existed = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: String(phone) }],
      },
      select: { id: true },
    });

    if (existed) {
      return bad(res, "Email hoặc số điện thoại đã tồn tại", 400);
    }

    const employee = await prisma.$transaction(async (tx) => {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const user = await tx.user.create({
        data: {
          fullName,
          phone: String(phone),
          email,
          type: "STAFF",
          passwordHash: hashedPassword,
        },
      });

      await tx.staff.create({
        data: {
          userId: user.id,
          position,
          isAdmin,
        },
      });

      return user;
    });

    return success(res, employee, 201);
  } catch (e) {
    console.error("CREATE_EMPLOYEE_ERROR:", e);
    return bad(res, e.message || "Có lỗi xảy ra", 500);
  }
}

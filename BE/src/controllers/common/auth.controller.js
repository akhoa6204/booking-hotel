import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { success, bad } from "../../utils/response.js";
import { sendResetPasswordEmail } from "../../utils/mailer.js";

const assertEnv = (key) => {
  if (!process.env[key]) throw new Error(`${key} is not set`);
};
const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const roleFromStaff = (staff) => (staff.isAdmin ? "ADMIN" : staff.position);

export async function register(req, res) {
  try {
    assertEnv("JWT_SECRET");
    const { fullName, email, password, phone } = req.body || {};

    if (!fullName?.trim()) return bad(res, "Họ tên không hợp lệ", 400);
    if (!isValidEmail(email)) return bad(res, "Email không hợp lệ", 400);
    if (!password || password.length < 6)
      return bad(res, "Mật khẩu phải từ 6 ký tự trở lên", 400);

    const existed = await prisma.user.findUnique({ where: { email } });
    if (existed) return bad(res, "Email đã tồn tại", 409);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { fullName, email, passwordHash, phone },
      });

      await tx.customer.create({
        data: { userId: newUser.id },
      });

      return newUser;
    });

    return success(
      res,
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      "Đăng ký tài khoản thành công",
      201,
    );
  } catch (e) {
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

export async function login(req, res) {
  try {
    assertEnv("JWT_SECRET");
    const { email, password } = req.body || {};

    if (!isValidEmail(email)) return bad(res, "Email không hợp lệ", 400);

    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
      include: { staff: { select: { position: true, isAdmin: true } } },
    });
    if (!user) return bad(res, "Sai mật khẩu / Tài khoản không tồn tại", 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return bad(res, "Sai mật khẩu / Tài khoản không tồn tại", 401);

    const isStaff = user.type === "STAFF";
    let role = "CUSTOMER";
    if (isStaff) role = roleFromStaff(user.staff);
    const token = jwt.sign(
      { sub: user.id, role: role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return success(
      res,
      {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: role,
        },
      },
      "Đăng nhập thành công",
    );
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body || {};
    if (!isValidEmail(email)) return bad(res, "Email không hợp lệ", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return bad(res, "Email không tồn tại", 404);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, used: false },
    });

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    queueMicrotask(() => {
      sendResetPasswordEmail({ to: user.email, token }).catch((err) => {
        console.error("SEND RESET EMAIL ERROR:", err);
      });
    });

    return success(
      res,
      null,
      "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
      200,
    );
  } catch (e) {
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6)
      return bad(res, "Mật khẩu không hợp lệ", 400);

    const rec = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (!rec || rec.used || rec.expiresAt < new Date())
      return bad(res, "Liên kết không hợp lệ hoặc đã hết hạn", 400);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: rec.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: rec.id },
        data: { used: true },
      }),
    ]);

    return success(
      res,
      null,
      "Đặt lại mật khẩu thành công, vui lòng đăng nhập",
    );
  } catch (e) {
    console.error("RESET PASSWORD ERROR:", e);
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        type: true,
        phone: true,
        staff: { select: { position: true, isAdmin: true } },
      },
    });

    if (!user) return bad(res, "Có lỗi xảy ra", 404);

    const isStaff = user.type === "STAFF";
    let role = "CUSTOMER";

    if (isStaff) role = roleFromStaff(user.staff);

    return success(res, {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: role,
    });
  } catch (e) {
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

export async function changePassword(req, res) {
  try {
    const { password, newPassword } = req.body;
    const userId = req.user.id;

    if (!password || !newPassword) {
      return bad(
        res,
        "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.",
      );
    }

    if (newPassword.length < 6) {
      return bad(res, "Mật khẩu mới phải có ít nhất 6 ký tự.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) return bad(res, "Không tìm thấy người dùng.", 404);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return bad(res, "Mật khẩu hiện tại không đúng.");
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return success(res, null, "Đổi mật khẩu thành công.");
  } catch (err) {
    console.error("ChangePassword Error:", err);
    return bad(res, "Lỗi server.", 500);
  }
}

export async function updateAccount(req, res) {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.user.id;

    if (!fullName && !email && !phone) {
      return bad(res, "Không có dữ liệu để cập nhật.");
    }

    const data = {};
    if (fullName) data.fullName = fullName;
    if (email) data.email = email;
    if (phone) data.phone = phone;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    return success(
      res,
      { ...user, role: "CUSTOMER" },
      "Cập nhật tài khoản thành công.",
    );
  } catch (err) {
    console.error("Update Account Error:", err);

    if (err.code === "P2002") {
      return bad(res, "Email hoặc số điện thoại đã được sử dụng.", 400);
    }

    return bad(res, "Lỗi server.", 500);
  }
}

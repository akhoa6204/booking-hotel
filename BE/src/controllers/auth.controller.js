import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { success, bad } from "../utils/response.js";
import { sendResetPasswordEmail } from "../utils/mailer.js";

// --- Helpers riêng ---
const assertEnv = (key) => {
  if (!process.env[key]) throw new Error(`${key} is not set`);
};
const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// REGISTER
export async function register(req, res) {
  try {
    assertEnv("JWT_SECRET");
    const { fullName, email, password, confirmPassword, phone } =
      req.body || {};

    // ===== VALIDATE =====
    if (!fullName?.trim() || fullName.trim().length < 2)
      return bad(res, "Họ tên không hợp lệ", 400);
    if (!isValidEmail(email)) return bad(res, "Email không hợp lệ", 400);
    if (password !== confirmPassword)
      return bad(res, "Mật khẩu và Nhập lại mật khẩu không trùng khớp", 400);
    if (!password || password.length < 6)
      return bad(res, "Mật khẩu phải từ 6 ký tự trở lên", 400);

    const existed = await prisma.user.findUnique({ where: { email } });
    if (existed) return bad(res, "Email đã tồn tại", 409);

    // ===== TẠO USER =====
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, phone },
    });

    // ===== ĐỒNG BỘ CUSTOMER + GÁN LẠI BOOKING CŨ =====
    let customer = null;

    if (phone) {
      const phoneTrimmed = String(phone).trim();

      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: phoneTrimmed },
      });

      if (!existingCustomer) {
        // chưa có customer -> tạo mới
        customer = await prisma.customer.create({
          data: {
            fullName,
            phone: phoneTrimmed,
            email,
            customerType: "REGISTERED",
            linkedUserId: user.id,
          },
          select: { id: true },
        });
      } else {
        // đã có customer -> update, link với user
        customer = await prisma.customer.update({
          where: { phone: phoneTrimmed },
          data: {
            fullName: existingCustomer.fullName || fullName,
            email: existingCustomer.email || email,
            customerType: "REGISTERED",
            linkedUserId: user.id,
          },
          select: { id: true },
        });
      }

      // === QUAN TRỌNG: gán lại userId cho các booking cũ của customer này ===
      if (customer) {
        await prisma.booking.updateMany({
          where: {
            customerId: customer.id,
            userId: null, // chỉ chạm những booking chưa gán user
          },
          data: {
            userId: user.id,
          },
        });
      }
    }

    // ===== RESPONSE =====
    return success(
      res,
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      "Đăng ký tài khoản thành công",
      201
    );
  } catch (e) {
    console.error("REGISTER ERROR:", e);

    // lỗi unique phone trên bảng User
    if (e.code === "P2002" && e.meta?.target?.includes("phone")) {
      return bad(res, "Số điện thoại đã được sử dụng", 409);
    }

    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

// LOGIN
export async function login(req, res) {
  try {
    assertEnv("JWT_SECRET");
    const { email, password } = req.body || {};
    console.log("email:", email);
    console.log("password:", password);

    if (!isValidEmail(email)) return bad(res, "Email không hợp lệ", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return bad(res, "Sai mật khẩu / Tài khoản không tồn tại", 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return bad(res, "Sai mật khẩu / Tài khoản không tồn tại", 401);

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return success(
      res,
      {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone
        },
      },
      "Đăng nhập thành công"
    );
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

// REQUEST PASSWORD RESET
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body || {};
    if (!isValidEmail(email)) return bad(res, "Email không hợp lệ", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return bad(res, "Email không tồn tại", 404);

    // Xóa token cũ chưa dùng
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, used: false },
    });

    // Tạo token mới
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // Gửi email kèm link reset
    await sendResetPasswordEmail({ to: user.email, token });

    return success(
      res,
      null,
      "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn."
    );
  } catch (e) {
    console.error("REQUEST RESET ERROR:", e);
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

// RESET PASSWORD
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
      "Đặt lại mật khẩu thành công, vui lòng đăng nhập"
    );
  } catch (e) {
    console.error("RESET PASSWORD ERROR:", e);
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

// ME
export async function me(req, res) {
  try {
    if (!req.user?.id) return bad(res, "Không xác thực được người dùng", 401);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    if (!user) return bad(res, "Không tìm thấy người dùng", 404);

    return success(res, user);
  } catch (e) {
    console.error("ME ERROR:", e);
    return bad(res, "Lỗi máy chủ", 500, e.message);
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) return bad(res, "Không xác định được người dùng.", 401);
    if (!currentPassword || !newPassword) {
      return bad(
        res,
        "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới."
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

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
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
    const userId = req.user?.id;
    const { name, email, phone } = req.body;

    if (!userId) return bad(res, "Không xác định được người dùng.", 401);
    if (!name && !email && !phone) {
      return bad(res, "Không có dữ liệu để cập nhật.");
    }

    const data = {};
    if (name) data.fullName = name;
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
        role: true,
      },
    });

    return success(res, user, "Cập nhật tài khoản thành công.");
  } catch (err) {
    console.error("Update Account Error:", err);

    if (err.code === "P2002") {
      return bad(res, "Email hoặc số điện thoại đã được sử dụng.", 400);
    }

    return bad(res, "Lỗi server.", 500);
  }
}

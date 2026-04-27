import nodemailer from "nodemailer";
import puppeteer from "puppeteer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FE_ORIGIN } = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FE_ORIGIN) {
  console.warn(
    "[MAILER] Missing SMTP/FE_ORIGIN envs. Email sending may not work properly."
  );
}

export const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendResetPasswordEmail({ to, token, fullName }) {
  const resetUrl = `${FE_ORIGIN}/reset-password?token=${token}`;
  const displayName = fullName?.trim() || "bạn";

  const html = `
  <div style="background-color:#f5f5f5;padding:24px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="
      max-width:520px;
      margin:0 auto;
      background-color:#ffffff;
      border-radius:16px;
      box-shadow:0 4px 16px rgba(0,0,0,0.06);
      overflow:hidden;
    ">
      <!-- Header -->
      <div style="padding:24px 32px 8px 32px; text-align:center;">
        <div style="font-size:24px;font-weight:700;color:#2E90FA; margin-bottom:4px;">
          Diamond Sea
        </div>
        <div style="font-size:18px;font-weight:600;color:#333;">
          Đặt lại mật khẩu
        </div>
      </div>

      <!-- Body -->
      <div style="padding:8px 32px 24px 32px; font-size:14px; color:#333; line-height:1.6;">
        <p style="margin:0 0 8px 0;">Chào ${displayName},</p>
        <p style="margin:0 0 8px 0;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Skyline của bạn.
        </p>
        <p style="margin:0 0 24px 0;">
          Nếu bạn là người gửi yêu cầu này, vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới:
        </p>

        <a href="${resetUrl}"
           target="_blank"
           style="
             display:block;
             text-align:center;
             background-color:#2E90FA;
             color:#ffffff !important;
             text-decoration:none;
             padding:12px 16px;
             border-radius:8px;
             font-weight:600;
             font-size:15px;
             margin-bottom:24px;
           ">
          Đặt lại mật khẩu
        </a>

        <p style="margin:0 0 4px 0; font-size:12px; color:#666;">
          Vì lý do bảo mật, liên kết này sẽ hết hạn trong <strong>1 giờ</strong>.
        </p>
        <p style="margin:0 0 4px 0; font-size:12px; color:#666;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này &mdash; tài khoản của bạn vẫn an toàn.
        </p>
        <p style="margin:0 0 16px 0; font-size:12px; color:#666;">
          Nếu bạn cần hỗ trợ thêm, hãy liên hệ đội ngũ hỗ trợ của chúng tôi.
        </p>

        <p style="margin:0; font-size:12px; color:#777;">
          Trân trọng,<br/>
          <strong>Đội ngũ hỗ trợ Diamond Sea</strong>
        </p>
      </div>
    </div>
  </div>
  `;

  await mailer.sendMail({
    from: `"Skyline Hotel" <${SMTP_USER}>`,
    to,
    subject: "Đặt lại mật khẩu tài khoản Skyline Hotel",
    html,
  });
}

// ====== MỚI: GỬI EMAIL XÁC NHẬN ĐẶT PHÒNG ======

// format helper
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

const formatMoney = (v) => `${Number(v || 0).toLocaleString("vi-VN")} VND`;
export function bookingConfirmationTemplate({ booking, payment }) {
  const guestName = booking.fullName || "Quý khách";
  const hotelName = "Skyline Hotel";
  const roomTypeName =
    booking.room?.roomType?.name || booking.room?.name || "Phòng tại Skyline";
  const bookingCode = `BK${booking.id}`;
  const checkIn = formatDate(booking.checkIn);
  const checkOut = formatDate(booking.checkOut);
  const guests = booking.guestCount || booking.room?.roomType?.capacity || 2;

  const pricePerNight = Number(
    booking.room?.roomType?.basePrice ?? booking.totalPrice ?? 0
  );
  const totalPrice = Number(booking.finalPrice ?? booking.totalPrice ?? 0);
  const depositAmount = Number(payment?.amount ?? booking.amountPaid ?? 0);
  const remaining = Math.max(0, totalPrice - depositAmount);

  const accentColor = "#24AB70";
  const orange = "#FF8A00";
  const mainImage =
    // booking.room?.roomType?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

  return `
  <div style="font-family: Arial, sans-serif; background-color:#F5F9FF; padding:24px 0;">
    <div style="
      max-width:640px;
      margin:0 auto;
      background:#ffffff;
      border-radius:12px;
      box-shadow:0 2px 8px rgba(0,0,0,0.06);
      overflow:hidden;
      border:1px solid #E0ECFF;
    ">

      <div style="padding:20px 32px 12px 32px; text-align:center; border-bottom:2px dashed #C7DFFF;">
        <div style="font-size:26px; font-weight:700; color:${accentColor}; margin-bottom:4px;">
          Skyline
        </div>
        <div style="font-size:20px; font-weight:700; color:#333333;">
          Xác nhận đặt phòng thành công
        </div>
      </div>

      <div style="padding:24px 32px 8px 32px; font-size:14px; color:#333;">
        <p><strong>Kính gửi Quý khách ${guestName},</strong></p>
        <p>Khách sạn <strong>${hotelName}</strong> xin thông báo đã nhận được khoản tiền cọc.</p>
        <p>Thông tin đặt phòng của bạn như sau:</p>
      </div>

      <div style="padding:16px 24px 24px 24px;">
        <div style="border:1px solid #E3E8F0; border-radius:12px; overflow:hidden;">

          <div style="width:100%; max-height:260px; overflow:hidden;">
            <img src="${mainImage}" style="width:100%; object-fit:cover;" />
          </div>

          <div style="padding:16px 20px 12px 20px; border-bottom:1px solid #F0F0F0;">
            <table role="presentation" style="width:100%; font-size:14px;">
              <tr>
                <td style="font-weight:600;">Tên phòng</td>
                <td style="text-align:right; font-weight:600;">Giá phòng/ đêm</td>
              </tr>
              <tr>
                <td style="color:#0077CC; font-weight:600;">${roomTypeName}</td>
                <td style="color:${orange}; font-weight:700; text-align:right;">
                  ${formatMoney(pricePerNight)}
                </td>
              </tr>
            </table>
          </div>

          <div style="padding:12px 20px 16px 20px;">
            <table role="presentation" style="width:100%; font-size:13px;">
              <tr>
                <td style="font-weight:600;">Mã đặt phòng</td>
                <td style="font-weight:600;">Check-in</td>
                <td style="font-weight:600;">Check-out</td>
                <td style="font-weight:600;">Khách</td>
              </tr>
              <tr>
                <td style="color:${accentColor}; font-weight:600;">${bookingCode}</td>
                <td style="color:${accentColor}; font-weight:600;">${checkIn}</td>
                <td style="color:${accentColor}; font-weight:600;">${checkOut}</td>
                <td style="color:${accentColor}; font-weight:600;">${guests}</td>
              </tr>
            </table>
          </div>

          <div style="padding:8px 20px 16px 20px; border-top:1px solid #EEF2F7;">
            <table style="width:100%; font-size:13px;">
              <tr>
                <td>Tổng cộng</td>
                <td style="text-align:right; font-weight:600;">${formatMoney(
                  totalPrice
                )}</td>
              </tr>
              <tr>
                <td>Đã cọc</td>
                <td style="color:${accentColor}; text-align:right; font-weight:600;">
                  ${formatMoney(depositAmount)}
                </td>
              </tr>
              <tr>
                <td>Thanh toán khi nhận phòng</td>
                <td style="color:${orange}; text-align:right; font-weight:700;">
                  ${formatMoney(remaining)}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div style="border-top:2px dashed #C7DFFF; padding:16px 24px; font-size:12px; color:#555; line-height:1.7;">
        <p style="margin:0 0 6px 0; font-style:italic;">
          Lưu ý: Vui lòng giữ email này làm bằng chứng xác nhận đặt phòng.
        </p>

        <p style="margin:0 0 4px 0;">
          Nếu cần hỗ trợ, vui lòng liên hệ:
        </p>

        <p style="margin:0 0 4px 0;">
          📞 Hotline: <strong>84+ 123456789</strong>
        </p>

        <p style="margin:0 0 10px 0;">
          ✉ Email:
          <a href="mailto:cskh@skyline.hotel.com" style="color:#0077CC; text-decoration:none;">
            cskh@skyline.hotel.com
          </a>
        </p>

        <p style="margin:0;">
          Xin cảm ơn Quý khách đã tin tưởng và lựa chọn
          <span style="color:#24AB70; font-weight:600;">Skyline Hotel</span>.<br/>
          Chúc Quý khách một ngày tốt lành và hẹn gặp lại tại khách sạn!
        </p>
      </div>

    </div>
  </div>
  `;
}

export async function generateBookingPdf({ booking, payment }) {
  const html = bookingConfirmationTemplate({ booking, payment });

  const browser = await puppeteer.launch({
    headless: "new", // hoặc true tùy version
    // nếu deploy trên server đặc biệt (Render, Railway...) có thể cần thêm:
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  });

  await browser.close();
  return pdfBuffer; // Buffer
}
// EMAIL XÁC NHẬN ĐẶT PHÒNG
export async function sendBookingConfirmationEmail({ to, booking, payment }) {
  const html = bookingConfirmationTemplate({ booking, payment });

  let attachments = [];

  try {
    const pdfBuffer = await generateBookingPdf({ booking, payment });
    attachments.push({
      filename: `booking-${booking.id}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("Generate booking PDF error:", err);
  }

  await mailer.sendMail({
    from: `"Skyline Hotel" <${SMTP_USER}>`,
    to,
    subject: "Xác nhận đặt phòng thành công - Skyline Hotel",
    html,
    attachments,
  });
}

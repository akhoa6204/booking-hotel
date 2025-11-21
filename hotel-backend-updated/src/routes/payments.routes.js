import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { payBooking } from "../controllers/payments.controller.js";
import { success } from "../utils/response.js";
import { createRequire } from "module";
import crypto from "node:crypto";

const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || "";

function verifyVnpReturn(req) {
  // raw query: giữ nguyên dấu '+', %2F, v.v.
  const raw = req.originalUrl.split("?")[1] || "";

  // tách cặp key=value, bỏ 2 tham số hash
  const pairs = raw
    .split("&")
    .filter(
      (kv) =>
        !kv.startsWith("vnp_SecureHash=") &&
        !kv.startsWith("vnp_SecureHashType=")
    );

  // lấy secureHash gốc
  const secureHash = new URLSearchParams(raw).get("vnp_SecureHash") || "";

  // sort theo key tăng dần
  pairs.sort((a, b) => a.split("=")[0].localeCompare(b.split("=")[0]));

  // ghép lại NGUYÊN TRẠNG, không encode lại
  const signData = pairs.join("&");

  // HMAC SHA512
  const signed = crypto
    .createHmac("sha512", VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return { isValid: signed === secureHash, signData, signed, secureHash };
}
const require = createRequire(import.meta.url);
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

const vnpay = new VNPay({
  tmnCode: "X3A9VFVR",
  secureSecret: VNP_HASH_SECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});



export const paymentsRouter = Router();

paymentsRouter.post("/:id/pay", auth(), payBooking);

paymentsRouter.post("/create-qr", async (req, res) => {
  try {
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 15);

    const params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_Amount: 1_000_000 * 100,
      vnp_CreateDate: dateFormat(new Date(), "yyyyMMddHHmmss"),
      vnp_ExpireDate: dateFormat(
        new Date(Date.now() + 15 * 60000),
        "yyyyMMddHHmmss"
      ),
      vnp_CurrCode: "VND",
      vnp_IpAddr: "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: "Thanh toan don hang 12345",
      vnp_OrderType: "other",
      vnp_ReturnUrl: "http://localhost:3001/api/payments/check-payment-vnpay",
      vnp_TxnRef: `ORD${Date.now()}`.slice(0, 32),
      vnp_BankCode: "VNBANK",
    };

    const result = await vnpay.buildPaymentUrl(params);
    console.log("VNPay build result:", result);
    return success(res, { vnpayUrl: result }, "OK", 201);
  } catch (err) {
    console.error("VNPay error:", err);
    return res.status(400).json({ error: err.message });
  }
});

paymentsRouter.get("/check-payment-vnpay", (req, res) => {
  const { isValid } = verifyVnpReturn(req);
  if (!isValid) return res.status(400).json({ error: "Invalid signature" });

  const q = req.query; // chỉ để đọc code trạng thái
  const ok = q.vnp_ResponseCode === "00" && q.vnp_TransactionStatus === "00";
  if (!ok)
    return res
      .status(400)
      .json({ error: "Payment failed", code: q.vnp_ResponseCode });

  return res.json({
    success: true,
    txnRef: q.vnp_TxnRef,
    transactionNo: q.vnp_TransactionNo,
    bankTranNo: q.vnp_BankTranNo || null,
    payDate: q.vnp_PayDate || null,
  });
});

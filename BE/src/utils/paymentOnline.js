import { SePayPgClient } from "sepay-pg-node";

export function buildSePayBankTransferCheckout({
  id,
  amount,
  desc,
  successUrl,
  errorUrl,
  cancelUrl,
}) {
  if (!process.env.SEPAY_MERCHANT_ID) {
    throw new Error("Missing env: SEPAY_MERCHANT_ID");
  }
  if (!process.env.SEPAY_SECRET_KEY) {
    throw new Error("Missing env: SEPAY_SECRET_KEY");
  }

  const nAmount = Number(amount);
  if (!Number.isFinite(nAmount) || nAmount <= 0) {
    throw new Error("amount must be a positive number");
  }

  const orderAmount = Math.round(nAmount);

  const env = process.env.SEPAY_ENV || "sandbox";
  const client = new SePayPgClient({
    env,
    merchant_id: process.env.SEPAY_MERCHANT_ID,
    secret_key: process.env.SEPAY_SECRET_KEY,
  });

  const checkoutURL = client.checkout.initCheckoutUrl();
  console.log(checkoutURL);

  const fields = client.checkout.initOneTimePaymentFields({
    payment_method: "BANK_TRANSFER",
    order_invoice_number: id,
    order_amount: orderAmount,
    currency: "VND",
    order_description: desc,
    success_url: successUrl,
    error_url: errorUrl,
    cancel_url: cancelUrl,
  });

  return { checkoutURL, fields };
}

export function paymentBanking({
  id,
  amount,
  desc,
  successUrl,
  errorUrl,
  cancelUrl,
}) {
  return buildSePayBankTransferCheckout({
    id,
    amount,
    desc,
    successUrl,
    errorUrl,
    cancelUrl,
  });
}

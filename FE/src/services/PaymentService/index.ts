import httpClient from "..";
import { PaymentMethod, PaymentType } from "@constant/types";

const BASE = "admin/payments";

export default class PaymentService {
  static async create(
    invoiceId: number,
    method: PaymentMethod,
    amount: number,
    type?: PaymentType,
  ): Promise<{ paymentId: number }> {
    try {
      const res = await httpClient.post(BASE, {
        invoiceId,
        method,
        amount,
        type,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  static async createPaymentOnline(paymentId: number) {
    try {
      const res = await httpClient.post(`${BASE}/${paymentId}/checkout-link`);
      return res.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async updateStatus(
    paymentId: number,
    data: { status: "PAID" | "FAILED" },
  ) {
    try {
      const res = await httpClient.patch(`${BASE}/${paymentId}`, data);
      return res.data;
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi đánh dấu thanh toán đã hoàn thành");
    }
  }
}

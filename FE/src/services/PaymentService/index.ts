import httpClient from "..";
import { PaymentMethod } from "@constant/types";

const BASE = "admin/payments";

export default class PaymentService {
  static async create(bookingId: number, method: PaymentMethod) {
    try {
      const res = await httpClient.post(BASE, { bookingId, method });
      return res.data;
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi tạo thanh toán");
    }
  }

  static async createPaymentOnline(paymentId: number) {
    try {
      const res = await httpClient.post(`${BASE}/${paymentId}/checkout`, {
        paymentId,
      });
      return res.data;
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi tạo thanh toán");
    }
  }

  static async markAsPaid(paymentId: number) {
    try {
      const res = await httpClient.patch(`${BASE}/${paymentId}/confirm`);
      return res.data;
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi đánh dấu thanh toán đã hoàn thành");
    }
  }

  static async cancelPayment(paymentId: number) {
    try {
      const res = await httpClient.patch(`${BASE}/${paymentId}/cancel`);
      return res.data;
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi hủy thanh toán");
    }
  }
}

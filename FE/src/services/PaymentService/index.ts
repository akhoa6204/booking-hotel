import httpClient from "..";
import { PaymentMethod, PaymentType } from "@constant/types";

const BASE = "admin/payments";
const BASE_CUSTOMER = "/payments";
export default class PaymentService {
  static async customerCreate(
    invoiceId: number,
    method: PaymentMethod,
    amount: number,
    type?: PaymentType,
  ): Promise<{ paymentId: number }> {
    try {
      const res = await httpClient.post(BASE_CUSTOMER, {
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

  static async customerUpdateStatus(
    paymentId: number,
    data: { status: "PAID" | "FAILED" },
  ) {
    try {
      const res = await httpClient.patch(`${BASE_CUSTOMER}/${paymentId}`, data);
      return res.data;
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi đánh dấu thanh toán");
    }
  }

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
      const res = await httpClient.post(
        `${BASE_CUSTOMER}/${paymentId}/checkout-link`,
      );
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
      throw new Error("Có lỗi xảy ra khi đánh dấu thanh toán");
    }
  }
}

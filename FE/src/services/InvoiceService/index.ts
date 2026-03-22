import { Invoice } from "@constant/types";
import httpClient from "..";

const BASE = "/admin/invoices";
const CUSTOMER_BASE = "/invoices";

export default class InvoiceService {
  static async getById(id: number): Promise<Invoice> {
    try {
      const res = await httpClient.get(`${BASE}/${id}`);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
  static async update(
    id: number,
    data: {
      services?: {
        serviceId: number;
        quantity: number;
      }[];
      removeItemIds?: number[];
    },
  ) {
    try {
      const res = await httpClient.patch(`${BASE}/${id}`, data);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
  static async getByIdCustomer(id: number): Promise<
    Pick<Invoice, "subtotal" | "tax" | "paidAmount" | "discount"> & {
      id: number;
      total: number;
    }
  > {
    try {
      const res = await httpClient.get(`${CUSTOMER_BASE}/${id}`);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
}

import { PaginatedResponse } from "@constant/response/paginated";
import {
  Booking,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  QuoteResponse,
} from "@constant/types";
import httpClient from "@services";

const BASE = "/bookings";
const ADMIN_BASE = "/admin/bookings";

export default class BookingService {
  static async listMy(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: PaginatedResponse<Booking>;
    }>(`${BASE}`, { params });
    return data;
  }

  static async getByIdCustomer(id: number) {
    try {
      const { data } = await httpClient.get<{
        success: boolean;
        data: any;
      }>(`${BASE}/${id}`);
      return data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đặt phòng:", error);
      return { success: false, data: null, error };
    }
  }

  static async create(payload: {
    roomId: number;
    email: string;
    phone: string;
    fullName: string;
    arrivalTime?: string;
    guestType: string;
    checkIn: string;
    checkOut: string;
    promoCode?: string;
  }): Promise<{ invoiceId: number; bookingId: number }> {
    const { data } = await httpClient.post(`${BASE}`, payload);
    return data;
  }

  static async cancel(id: number, reason: string): Promise<void> {
    await httpClient.patch(`${BASE}/${id}`, { reason });
  }

  static async quote(payload: {
    roomId: number;
    checkIn: string;
    checkOut: string;
    promoCode?: string;
  }): Promise<QuoteResponse> {
    const { data } = await httpClient.post<{
      success: boolean;
      data: QuoteResponse;
    }>(`${BASE}/quote`, payload);
    return data;
  }

  static async getById(id: number) {
    try {
      const { data } = await httpClient.get<{
        success: boolean;
        data: any;
      }>(`${ADMIN_BASE}/${id}`);
      return data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đặt phòng:", error);
      return { success: false, data: null, error };
    }
  }
  static async listAll({
    page = 1,
    limit = 10,
    q,
  }: { page?: number; limit?: number; q?: string } = {}): Promise<
    PaginatedResponse<Booking>
  > {
    const { data } = await httpClient.get<{
      success: boolean;
      data: PaginatedResponse<Booking>;
    }>(`${ADMIN_BASE}/`, {
      params: {
        page,
        limit,
        q,
      },
    });
    return data;
  }

  static async adminCreate(payload: {
    fullName: string;
    phone: string;
    roomId: number;
    checkIn: string;
    checkOut: string;
    promoCode?: string;
  }): Promise<{
    bookingId: number;
    invoiceId: number;
    remainingAmount: number;
  }> {
    const { data } = await httpClient.post(`${ADMIN_BASE}/`, payload);
    return data;
  }

  static async updateStatus(
    id: number,
    status: BookingStatus,
    reason?: string,
  ): Promise<Booking> {
    const { data } = await httpClient.patch<{
      success: boolean;
      data: Booking;
    }>(`${ADMIN_BASE}/${id}`, { status, reason });
    return data;
  }

  static async updateRoom({
    id,
    roomId,
  }: {
    id: number;
    roomId: number;
  }): Promise<Booking> {
    try {
      const { data } = await httpClient.patch<{
        success: boolean;
        data: Booking;
      }>(`${ADMIN_BASE}/${id}`, { roomId });
      return data;
    } catch (e) {
      throw e;
    }
  }
}

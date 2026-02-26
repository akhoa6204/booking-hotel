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
  // ===== Người dùng =====
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

  static async create(payload: {
    roomTypeId?: number;
    email: string;
    phone: string;
    fullName: string;
    arrivalTime?: string;
    guestType: string;
    checkIn: string;
    checkOut: string;
    promoCode?: string;
  }): Promise<{ bookingId: number }> {
    const { data } = await httpClient.post<{
      success: boolean;
      data: { bookingId: number };
      message?: string;
    }>(`${BASE}`, payload);
    return data;
  }

  static async cancel(id: number, reason: string): Promise<void> {
    await httpClient.post(`${BASE}/${id}/cancel`, { reason });
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

  // ===== Admin / Manager =====
  static async getById(id: number) {
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
  }): Promise<{ bookingId: number }> {
    const { data } = await httpClient.post<{
      success: boolean;
      data: { bookingId: number };
    }>(`${ADMIN_BASE}/`, payload);
    return data;
  }

  static async updateStatus(
    id: number,
    status: BookingStatus,
  ): Promise<Booking> {
    const { data } = await httpClient.patch<{
      success: boolean;
      data: Booking;
    }>(`${ADMIN_BASE}/${id}`, { status });
    return data;
  }

  // ===== Thanh toán =====
  // ONLINE: tạo link thanh toán VNPAY
  static async createPaymentLink(
    bookingId: number,
  ): Promise<{ vnpayUrl: string; amount: number }> {
    const { data } = await httpClient.post<{
      success: boolean;
      data: { vnpayUrl: string; amount: number };
    }>(`${BASE}/${bookingId}/pay`);
    return data;
  }

  // OFFLINE: thu tiền tại quầy
  static async recordOfflinePayment(payload: {
    bookingId: number;
    method: Exclude<PaymentMethod, "VNPAY">;
    status: Exclude<PaymentStatus, "PARTIAL">;
    amount?: number;
  }): Promise<{ booking: Booking }> {
    const { data } = await httpClient.post<{
      success: boolean;
      data: { booking: Booking };
    }>(`${BASE}/check-payment`, payload);
    return data;
  }
}

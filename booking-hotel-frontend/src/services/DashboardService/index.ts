import httpClient from "@services";
import { PaginatedResponse } from "@constant/response/paginated";
import {
  Booking,
  DashboardSummary,
  MonthlyBookingStats,
  MonthlyKpis,
  MonthlyRevenue,
  TopCustomers,
} from "@constant/types";

const BASE = "/dashboard";

export default class DashboardService {
  /** Tổng quan dashboard (hôm nay & tuần) */
  static async getSummary(): Promise<DashboardSummary> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: DashboardSummary;
    }>(`${BASE}/summary`);
    return data;
  }

  /** Danh sách check-in hôm nay (phân trang) */
  static async getCheckins(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>> {
    const { page = 1, limit = 10 } = params || {};
    const { data } = await httpClient.get<{
      success: boolean;
      data: PaginatedResponse<Booking>;
    }>(`${BASE}/checkins`, { params: { page, limit } });
    return data;
  }

  /** Danh sách check-out hôm nay (phân trang) */
  static async getCheckouts(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>> {
    const { page = 1, limit = 10 } = params || {};
    const { data } = await httpClient.get<{
      success: boolean;
      data: PaginatedResponse<Booking>;
    }>(`${BASE}/checkouts`, { params: { page, limit } });
    return data;
  }

  /** Chỉ số tổng hợp theo tháng (doanh thu, lấp đầy, delta) */
  static async getMonthlyKpis(): Promise<MonthlyKpis> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: MonthlyKpis;
    }>(`${BASE}/monthly-kpis`);
    return data;
  }

  /** Doanh thu theo tháng (mặc định 6 tháng gần nhất) */
  static async getMonthlyRevenue(months = 6): Promise<MonthlyRevenue> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: MonthlyRevenue;
    }>(`${BASE}/monthly-revenue`, { params: { months } });
    return data;
  }

  static async getMonthlyBookingStats(
    month?: string
  ): Promise<MonthlyBookingStats> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: MonthlyBookingStats;
    }>(`${BASE}/monthly-booking-stats`, { params: { month } });
    return data;
  }

  /** Top customers theo tháng hiện tại (mặc định) */
  static async getTopCustomers(params?: {
    month?: string;
    limit?: number;
  }): Promise<TopCustomers> {
    const { month, limit } = params || {};
    const { data } = await httpClient.get<{
      success: boolean;
      data: TopCustomers;
    }>(`${BASE}/top-customers`, { params: { month, limit } });
    return data;
  }
}

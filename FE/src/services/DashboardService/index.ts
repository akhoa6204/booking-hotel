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

const BASE = "/admin/dashboard";

export default class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: DashboardSummary;
    }>(`${BASE}/summary`);
    return data;
  }

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

  static async getMonthlyKpis(): Promise<MonthlyKpis> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: MonthlyKpis;
    }>(`${BASE}/monthly-kpis`);
    return data;
  }

  static async getMonthlyRevenue(months = 6): Promise<MonthlyRevenue> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: MonthlyRevenue;
    }>(`${BASE}/monthly-revenue`, { params: { months } });
    return data;
  }

  static async getMonthlyBookingStats(
    month?: string,
  ): Promise<MonthlyBookingStats> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: MonthlyBookingStats;
    }>(`${BASE}/monthly-booking-stats`, { params: { month } });
    return data;
  }


}

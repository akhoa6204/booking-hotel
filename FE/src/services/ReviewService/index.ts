import { PaginatedResponse } from "@constant/response/paginated";
import { Review, ReviewStats, ReviewStatus } from "@constant/types";
import httpClient from "@services";

const BASE = "/reviews";

export default class ReviewService {
  static async create(payload: {
    bookingId: number;
    overall: number;
    amenities?: number;
    cleanliness?: number;
    comfort?: number;
    locationScore?: number;
    valueForMoney?: number;
    hygiene?: number;
    comment?: string;
  }): Promise<Review> {
    const { data } = await httpClient.post<{
      success: boolean;
      data: Review;
    }>(`${BASE}`, payload);
    return data;
  }

  static async list(params?: {
    page?: number;
    limit?: number;
    roomTypeId?: number;
    q?: string;
  }): Promise<PaginatedResponse<Review>> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: PaginatedResponse<Review>;
    }>(`${BASE}`, { params });
    return data;
  }

  static async updateStatus(
    id: number,
    payload: { status: ReviewStatus; reason?: string },
  ) {
    const { data } = await httpClient.patch<{
      success: boolean;
      data: Review;
    }>(`${BASE}/${id}`, payload);
    return data;
  }

  static async getStats(params?: { roomTypeId?: number }) {
    const { data } = await httpClient.get<{
      success: boolean;
      data: ReviewStats;
    }>(`${BASE}/stats`, { params });
    return data;
  }

  static async getById(id: number): Promise<Omit<Review, "room">> {
    const { data } = await httpClient.get<{
      success: boolean;
      data: Omit<Review, "room">;
    }>(`${BASE}/${id}`);
    return data;
  }
}

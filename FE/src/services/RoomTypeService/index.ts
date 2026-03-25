import { PaginatedResponse } from "@constant/response/paginated";
import httpClient from "..";
import {
  RoomType,
  RoomTypeGuest,
  RoomTypeReviewItem,
  RoomTypeReviewStats,
} from "@constant/types";
import { SortKey } from "@pages/common/booking-page/interface";

const CUSTOMER_BASE = "/room-types";
const ADMIN_BASE = "/admin/room-types";

export type CreateRoomTypePayload = {
  hotelId: number;
  name: string;
  basePrice: number | null;
  capacity?: number | null;
  description?: string;
  amenities?: number[];
  images?: { id?: number; url: string }[];
};

export type UpdateRoomTypePayload = Partial<CreateRoomTypePayload>;

export default class RoomTypeService {
  static async listGuest(params?: {
    hotelId?: number;
    page?: number;
    limit?: number;
    capacity?: number;
    checkIn?: string;
    checkOut?: string;
    sort?: SortKey;
    q?: string;
  }): Promise<PaginatedResponse<RoomTypeGuest>> {
    const res = await httpClient.get<{
      success: true;
      data: PaginatedResponse<RoomTypeGuest>;
    }>(`${CUSTOMER_BASE}/`, { params });
    return res.data;
  }

  static async getByIdForGuest(id: number): Promise<RoomTypeGuest> {
    const res = await httpClient.get<{ success: true; data: RoomTypeGuest }>(
      `${CUSTOMER_BASE}/${id}`,
    );
    return res.data;
  }

  static async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<PaginatedResponse<RoomType>> {
    const res = await httpClient.get<{
      success: true;
      data: PaginatedResponse<RoomType>;
    }>(`${ADMIN_BASE}/`, { params });

    return res.data;
  }

  static async getById(id: number): Promise<RoomType> {
    const res = await httpClient.get<{ success: true; data: RoomType }>(
      `${ADMIN_BASE}/${id}`,
    );
    return res.data;
  }

  static async create(payload: FormData): Promise<RoomType> {
    const res = await httpClient.post<{ success: true; data: RoomType }>(
      `${ADMIN_BASE}`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  }

  static async update(id: number, payload: FormData): Promise<RoomType> {
    const res = await httpClient.patch<{ success: true; data: RoomType }>(
      `${ADMIN_BASE}/${id}`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  }
  static async delete(id: number): Promise<void> {
    await httpClient.delete(`${ADMIN_BASE}/${id}`);
  }

  static async getReviewsForGuest(params: {
    id: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<RoomTypeReviewItem>> {
    const { id, ...query } = params;

    const res = await httpClient.get<{
      success: true;
      data: PaginatedResponse<RoomTypeReviewItem>;
    }>(`${CUSTOMER_BASE}/${id}/reviews`, { params: query });

    return res.data;
  }

  static async getReviewStatsForGuest(
    id: number,
  ): Promise<RoomTypeReviewStats> {
    const res = await httpClient.get<{
      success: true;
      data: RoomTypeReviewStats;
    }>(`${CUSTOMER_BASE}/${id}/reviews-stats`);

    return res.data;
  }

  static async getRoomAvailability(
    id: number,
    checkIn: string,
    checkOut: string,
  ): Promise<{ roomId?: number }> {
    try {
      const res = await httpClient.get(`${CUSTOMER_BASE}/${id}/avaibility`, {
        params: {
          checkIn,
          checkOut,
        },
      });

      return res.data;
    } catch (e) {
      throw e;
    }
  }
}

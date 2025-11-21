import { PaginatedResponse } from "@constant/response/paginated";
import httpClient from "..";
import {
  RoomType,
  RoomTypeGuest,
  RoomTypeReviewItem,
  RoomTypeReviewStats,
} from "@constant/types";
import { SortKey } from "@pages/common/booking-page/interface";

const BASE = "/room-types";

/** Payload tạo/cập nhật loại phòng (admin) */
export type CreateRoomTypePayload = {
  hotelId: number;
  name: string;
  basePrice: number | null;
  capacity?: number | null;
  description?: string;
  /** mảng id amenity */
  amenities?: number[];
  /** tạm thời: danh sách ảnh theo URL (nếu có) */
  images?: { id?: number; url: string }[];
};

export type UpdateRoomTypePayload = Partial<CreateRoomTypePayload>;

export default class RoomTypeService {
  /** Lấy danh sách loại phòng cho khách (public) */
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
    }>(`${BASE}/customer`, { params });
    return res.data;
  }

  /** Lấy chi tiết loại phòng cho khách (public) */
  static async getByIdForGuest(id: number): Promise<RoomTypeGuest> {
    const res = await httpClient.get<{ success: true; data: RoomTypeGuest }>(
      `${BASE}/customer/${id}`
    );
    return res.data;
  }

  /** Lấy danh sách loại phòng cho quản lý (admin) */
  static async list(params?: {
    hotelId?: number;
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<PaginatedResponse<RoomType>> {
    const res = await httpClient.get<{
      success: true;
      data: PaginatedResponse<RoomType>;
    }>(`${BASE}/admin`, { params });

    return res.data;
  }

  /** Lấy chi tiết loại phòng (admin) */
  static async getById(id: number): Promise<RoomType> {
    const res = await httpClient.get<{ success: true; data: RoomType }>(
      `${BASE}/admin/${id}`
    );
    return res.data;
  }

  // RoomTypeService.ts
  static async create(payload: FormData): Promise<RoomType> {
    const res = await httpClient.post<{ success: true; data: RoomType }>(
      `${BASE}/admin`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  }

  static async update(id: number, payload: FormData): Promise<RoomType> {
    const res = await httpClient.put<{ success: true; data: RoomType }>(
      `${BASE}/admin/${id}`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  }
  /** Xóa loại phòng (admin) */
  static async delete(id: number): Promise<void> {
    await httpClient.delete(`${BASE}/admin/${id}`);
  }

  /** Lấy danh sách review theo loại phòng cho khách */
  static async getReviewsForGuest(params: {
    id: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<RoomTypeReviewItem>> {
    const { id, ...query } = params;

    const res = await httpClient.get<{
      success: true;
      data: PaginatedResponse<RoomTypeReviewItem>;
    }>(`${BASE}/customer/${id}/reviews`, { params: query });

    return res.data;
  }

  /** Lấy thống kê review (điểm trung bình) cho loại phòng */
  static async getReviewStatsForGuest(
    id: number
  ): Promise<RoomTypeReviewStats> {
    const res = await httpClient.get<{
      success: true;
      data: RoomTypeReviewStats;
    }>(`${BASE}/customer/${id}/reviews-stats`);

    return res.data;
  }
}

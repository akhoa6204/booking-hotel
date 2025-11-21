// src/services/RoomService.ts
import { PaginatedResponse } from "@constant/response/paginated";
import { Room, RoomStatus } from "@constant/types";
import httpClient from "@services";

const BASE = "/rooms";

export default class RoomService {
  /** GET /api/rooms?hotelId=&roomTypeId=&q=&page=&limit= */
  static async list(params?: {
    hotelId?: number;
    roomTypeId?: number;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Room>> {
    try {
      const res = await httpClient.get<{
        success: boolean;
        data: PaginatedResponse<Room>;
      }>(BASE, {
        params: {
          page: 1,
          limit: 6,
          ...params,
        },
      });
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.list] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tải danh sách phòng"
      );
    }
  }

  /** GET /api/rooms/:id */
  static async get(id: number): Promise<Room> {
    try {
      const res = await httpClient.get<{ success: boolean; data: Room }>(
        `${BASE}/${id}`
      );
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.get] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tải thông tin phòng"
      );
    }
  }

  /** POST /api/rooms (chỉ dữ liệu text, không còn ảnh) */
  static async create(payload: {
    hotelId: number;
    roomTypeId: number;
    name: string;
    description?: string;
    status?: RoomStatus;
  }) {
    try {
      const res = await httpClient.post<{ success: boolean; data: Room }>(
        `${BASE}`,
        {
          hotelId: payload.hotelId,
          roomTypeId: payload.roomTypeId,
          name: payload.name,
          description: payload.description,
          status: payload.status,
        }
      );
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.create] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tạo phòng mới"
      );
    }
  }

  /** PUT /api/rooms/:id (update text fields, không còn ảnh) */
  static async update(
    id: number,
    payload: {
      name?: string;
      description?: string;
      status?: RoomStatus;
      roomTypeId?: number;
    }
  ) {
    try {
      const res = await httpClient.put<{ success: boolean; data: null }>(
        `${BASE}/${id}`,
        {
          name: payload.name,
          description: payload.description,
          status: payload.status,
          roomTypeId: payload.roomTypeId,
        }
      );
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.update] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể cập nhật phòng"
      );
    }
  }

  /** PATCH /api/rooms/:id/toggle */
  static async toggleActive(id: number) {
    try {
      const res = await httpClient.patch<{ success: boolean; data: null }>(
        `${BASE}/${id}/toggle`
      );
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.toggleActive] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể thay đổi trạng thái phòng"
      );
    }
  }

  /** POST /api/rooms/available */
  static async getAvailable(params: {
    hotelId: number;
    roomTypeId?: number;
    checkIn: string;
    checkOut: string;
  }): Promise<{ success: boolean; data: Room[] }> {
    try {
      const res = await httpClient.post<{ success: boolean; data: Room[] }>(
        `${BASE}/available`,
        params
      );
      return res;
    } catch (error: any) {
      console.error("❌ [RoomService.getAvailable] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tải danh sách phòng trống"
      );
    }
  }
}

// src/services/RoomService.ts
import { ApiSuccess } from "@constant/response/api";
import { PaginatedResponse } from "@constant/response/paginated";
import { QuoteResponse, Room, RoomStatus } from "@constant/types";
import httpClient from "@services";

const AMIN_BASE = "/admin/rooms";
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
      }>(AMIN_BASE, {
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
        error?.response?.data?.message || "Không thể tải danh sách phòng",
      );
    }
  }

  /** GET /api/rooms/:id */
  static async get(id: number): Promise<Room> {
    try {
      const res = await httpClient.get<{ success: boolean; data: Room }>(
        `${AMIN_BASE}/${id}`,
      );
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.get] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tải thông tin phòng",
      );
    }
  }

  /** POST /api/rooms (chỉ dữ liệu text, không còn ảnh) */
  static async create(payload: {
    roomTypeId: number;
    name: string;
    description?: string;
    status?: RoomStatus;
  }) {
    try {
      const res = await httpClient.post<{ success: boolean; data: Room }>(
        `${AMIN_BASE}`,
        {
          roomTypeId: payload.roomTypeId,
          name: payload.name,
          description: payload.description,
          status: payload.status,
        },
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Không thể tạo phòng mới",
      );
    }
  }

  /** PATCH /api/rooms/:id (update text fields, không còn ảnh) */
  static async update(
    id: number,
    payload: {
      name?: string;
      description?: string;
      status?: RoomStatus;
      roomTypeId?: number;
    },
  ) {
    try {
      const res = await httpClient.patch<{ success: boolean; data: null }>(
        `${AMIN_BASE}/${id}`,
        {
          name: payload.name,
          description: payload.description,
          status: payload.status,
          roomTypeId: payload.roomTypeId,
        },
      );
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.update] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể cập nhật phòng",
      );
    }
  }

  /** DELETE /api/rooms/:id */
  static async remove(id: number) {
    try {
      const res = await httpClient.delete<{ success: boolean; data: null }>(
        `${AMIN_BASE}/${id}`,
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Không thể thay đổi trạng thái phòng",
      );
    }
  }

  /** POST /api/rooms/available */
  static async getAvailable(params: {
    roomTypeId?: number;
    checkIn: string;
    checkOut: string;
  }): Promise<{ success: boolean; data: Room[] }> {
    try {
      const res = await httpClient.post<{ success: boolean; data: Room[] }>(
        `${BASE}/available`,
        params,
      );
      return res;
    } catch (error: any) {
      console.error("❌ [RoomService.getAvailable] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tải danh sách phòng trống",
      );
    }
  }

  static async quote(params: {
    roomId: number;
    checkIn: string;
    checkOut: string;
    promoCode?: string;
  }): Promise<ApiSuccess<QuoteResponse>> {
    try {
      const res = await httpClient.post(`${BASE}/quote`, params);
      return res;
    } catch (error: any) {
      console.error("❌ [RoomService.quote] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tải danh sách phòng trống",
      );
    }
  }
}

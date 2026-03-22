import { ApiSuccess } from "@constant/response/api";
import { PaginatedResponse } from "@constant/response/paginated";
import { QuoteResponse, Room, RoomStatus } from "@constant/types";
import httpClient from "@services";

const ADMIN_BASE = "/admin/rooms";
const BASE = "/rooms";

export default class RoomService {
  static async list(params?: {
    roomTypeId?: number;
    q?: string;
    page?: number;
    limit?: number;
    checkIn?: string;
    checkOut?: string;
  }): Promise<PaginatedResponse<Room>> {
    try {
      const res = await httpClient.get(BASE, { params });
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.list] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tải danh sách phòng",
      );
    }
  }

  static async getById(id: number): Promise<Room> {
    try {
      const res = await httpClient.get<{ success: boolean; data: Room }>(
        `${BASE}/${id}`,
      );
      return res.data;
    } catch (error: any) {
      console.error("❌ [RoomService.get] Error:", error);
      throw new Error(
        error?.response?.data?.message || "Không thể tải thông tin phòng",
      );
    }
  }

  static async create(payload: {
    roomTypeId: number;
    name: string;
    description?: string;
    status?: RoomStatus;
  }) {
    try {
      const res = await httpClient.post<{ success: boolean; data: Room }>(
        `${ADMIN_BASE}`,
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
        `${ADMIN_BASE}/${id}`,
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

  static async remove(id: number) {
    try {
      const res = await httpClient.delete<{ success: boolean; data: null }>(
        `${ADMIN_BASE}/${id}`,
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Không thể thay đổi trạng thái phòng",
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

import { HouseKeepingTask, TaskStatus, TaskType } from "@constant/types";
import httpClient from "..";
import { PaginatedResponse } from "@constant/response/paginated";

const BASE = "/admin/housekeepings";
export default class HouseKeepingService {
  static async list(params?: {
    q?: string;
    status?: TaskStatus | "";
    page: number;
    limit?: number;
    bookingId?: number;
  }): Promise<PaginatedResponse<HouseKeepingTask>> {
    try {
      const res = await httpClient.get(BASE, { params });
      return res.data;
    } catch (e) {
      throw e;
    }
  }
  static async update(
    id: number,
    params: {
      status?: TaskStatus;
      staffId?: number;
      note?: string;
      roomId?: number;
      type?: TaskType;
    },
  ) {
    try {
      const res = await httpClient.patch(`${BASE}/${id}`, params);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  static async create(data: {
    bookingId?: number;
    staffId?: number;
    roomId: number;
    type: TaskType;
  }) {
    try {
      const res = await httpClient.post(BASE, data);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
  static async getById(id: number) {
    try {
      const res = await httpClient.get(`${BASE}/${id}`);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
}

import {
  CustomerEligibility,
  PromoScope,
  Promotion,
  PromoType,
} from "@constant/types";
import httpClient from "..";
import { PaginatedResponse } from "@constant/response/paginated";

const BASE = "/admin/promotions";

export default class PromotionService {
  static async list(params?: {
    hotelId?: number;
    scope?: PromoScope;
    active?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Promotion>> {
    const res = await httpClient.get<{
      success: true;
      data: PaginatedResponse<Promotion>;
    }>(BASE, { params });
    return res.data;
  }

  static async getById(id: number): Promise<Promotion> {
    try {
      const res = await httpClient.get(`${BASE}/${id}`);
      return res.data;
    } catch (e) {
      throw new Error("Có lỗi xảy ra");
    }
  }

  static async create(payload: {
    scope: PromoScope;
    description?: string;
    type: PromoType;
    value: number;
    startAt: string | Date;
    endAt: string | Date;
    roomTypeIds?: number[];
    minTotal?: number;
    code?: string;
    name: string;
    autoApply: boolean;
    priority: number;
    maxDiscountAmount?: number;
    isStackable?: boolean;
  }): Promise<Promotion> {
    const body = {
      ...payload,
      startAt:
        payload.startAt instanceof Date
          ? payload.startAt.toISOString()
          : payload.startAt,
      endAt:
        payload.endAt instanceof Date
          ? payload.endAt.toISOString()
          : payload.endAt,
    };
    const res = await httpClient.post<{ success: true; data: Promotion }>(
      BASE,
      body,
    );
    return res.data;
  }

  static async update(
    id: number,
    payload: {
      scope: PromoScope;
      description?: string;
      type: PromoType;
      value: number;
      startAt: string | Date;
      endAt: string | Date;
      roomTypes?: number[];
      minTotal: number | null;
      code?: string;
      name?: string;
      autoApply: boolean;
      priority: number;
      maxDiscountAmount?: number;
      eligibleFor: CustomerEligibility;
      isStackable: boolean;
    },
  ): Promise<Promotion> {
    const body = { ...payload };
    if (payload.startAt instanceof Date)
      body.startAt = payload.startAt.toISOString();
    if (payload.endAt instanceof Date) body.endAt = payload.endAt.toISOString();

    const res = await httpClient.patch<{ success: true; data: Promotion }>(
      `${BASE}/${id}`,
      body,
    );
    return res.data;
  }

  static async delete(id: number): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  }
}

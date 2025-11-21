import { PromoScope, Promotion, PromoType } from "@constant/types";
import httpClient from "..";
import { PaginatedResponse } from "@constant/response/paginated";

const BASE = "/promotions";

export default class PromotionService {
  /** GET /api/promotions?hotelId=&scope=&active=&code=&page=&limit= */
  static async list(params?: {
    hotelId?: number;
    scope?: PromoScope;
    active?: boolean;
    code?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Promotion>> {
    const res = await httpClient.get<{
      success: true;
      data: PaginatedResponse<Promotion>;
    }>(BASE, { params });
    return res.data;
  }

  /** POST /api/promotions */
  static async create(payload: {
    hotelId: number;
    scope: PromoScope;
    description?: string;
    discountType: PromoType;
    value: number;
    startDate: string | Date;
    endDate: string | Date;
    roomTypeId?: number | null;
    minTotal?: number | null;
    code?: string | null;
    conditions?: any | null;
    active?: boolean;
  }): Promise<Promotion> {
    const body = {
      ...payload,
      startDate:
        payload.startDate instanceof Date
          ? payload.startDate.toISOString()
          : payload.startDate,
      endDate:
        payload.endDate instanceof Date
          ? payload.endDate.toISOString()
          : payload.endDate,
    };
    const res = await httpClient.post<{ success: true; data: Promotion }>(
      BASE,
      body
    );
    return res.data;
  }

  /** PUT /api/promotions/:id */
  static async update(
    id: number,
    payload: Partial<{
      scope: PromoScope;
      description?: string;
      discountType: PromoType;
      value: number;
      startDate: string | Date;
      endDate: string | Date;
      roomTypeId: number | null;
      minTotal: number | null;
      code: string | null;
      conditions: any | null;
      active: boolean;
    }>
  ): Promise<Promotion> {
    const body: any = { ...payload };
    if (payload.startDate instanceof Date)
      body.startDate = payload.startDate.toISOString();
    if (payload.endDate instanceof Date)
      body.endDate = payload.endDate.toISOString();

    const res = await httpClient.put<{ success: true; data: Promotion }>(
      `${BASE}/${id}`,
      body
    );
    return res.data;
  }

  /** DELETE /api/promotions/:id */
  static async delete(id: number): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  }
}

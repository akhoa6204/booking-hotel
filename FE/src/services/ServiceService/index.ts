import { Service, ServiceType } from "@constant/types";
import httpClient from "..";
import { PaginatedResponse } from "@constant/response/paginated";
const BASE = "/admin/services";
export default class ServiceService {
  static async list(
    params: {
      q?: string;
      type?: ServiceType;
    } = {
      q: "",
      type: "SERVICE",
    },
  ): Promise<PaginatedResponse<Service>> {
    try {
      const res = await httpClient.get(BASE, { params });
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  static async getById(id: number): Promise<Service> {
    try {
      const res = await httpClient.get(`${BASE}/${id}`);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  static async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      type?: ServiceType;
    },
  ) {
    try {
      const res = await httpClient.patch(`${BASE}/${id}`, data);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  static async remove(id: number) {
    try {
      const res = await httpClient.delete(`${BASE}/${id}`);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  static async create(data: {
    name: string;
    description: string;
    price: number;
    type: ServiceType;
  }) {
    try {
      const res = await httpClient.post(BASE, data);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
}

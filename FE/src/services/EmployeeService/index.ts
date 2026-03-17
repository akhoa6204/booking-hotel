import { Employee, UserRole } from "@constant/types";
import httpClient from "..";
import { PaginatedResponse } from "@constant/response/paginated";

const BASE = "/admin/employees";

export default class EmployeeService {
  static async list({
    q,
    page = 1,
    limit = 10,
    position,
  }: {
    q?: string;
    page?: number;
    limit?: number;
    position?: Omit<UserRole, "CUSTOMER">;
  }): Promise<PaginatedResponse<Employee>> {
    try {
      const res = await httpClient.get(BASE, {
        params: {
          q,
          page,
          limit,
          position,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error("Có lỗi xảy ra khi lấy danh sách nhân viên");
    }
  }
  static async getById(id: number): Promise<Employee> {
    try {
      const res = await httpClient.get(`${BASE}/${id}`);
      return res.data;
    } catch (e) {
      throw new Error("Có lỗi xảy ra khi lấy thông tin nhân viên");
    }
  }

  static async update(
    id: number,
    data: {
      fullName?: string;
      phone?: string;
      email?: string;
      isActive?: boolean;
      position?: Omit<UserRole, "CUSTOMER" | "ADMIN">;
    },
  ) {
    try {
      const res = await httpClient.patch(`${BASE}/${id}`, data);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  static async create({
    fullName,
    phone,
    email,
    position,
  }: {
    fullName: string;
    phone: string;
    email: string;
    position: Omit<UserRole, "CUSTOMER" | "ADMIN">;
  }) {
    try {
      const res = await httpClient.post(BASE, {
        fullName,
        phone,
        email,
        position,
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  static async resetPassword(id: number, data: { newPassword: string }) {
    try {
      const res = await httpClient.patch(`${BASE}/${id}/reset-password`, {
        ...data,
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  }
}

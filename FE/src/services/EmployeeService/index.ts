import { Employee, UserRole } from "@constant/types";
import httpClient from "..";

const BASE = "/admin/employees";

export default class EmployeeService {
  static async list({
    q,
    page = 1,
    limit = 10,
  }: {
    q?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const res = await httpClient.get(BASE, {
        params: {
          q,
          page,
          limit,
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
      throw new Error("Có lỗi xảy ra khi cập nhật thông tin nhân viên");
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
      throw new Error("Có lỗi xảy ra khi tạo nhân viên mới");
    }
  }
}

import {
  Employee,
  Shift,
  StaffShiftAssignment,
  UserRole,
} from "@constant/types";
import httpClient from "..";

const BASE = "/admin/shifts";
export default class ShiftService {
  static async list(params: { startDate: string; endDate: string }): Promise<
    {
      user: Employee;
      assignments: StaffShiftAssignment[];
    }[]
  > {
    try {
      const res = await httpClient.get(BASE, { params });
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
  static async listDefinitons() {
    try {
      const res = await httpClient.get(`${BASE}/definitions`);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
  static async create({
    shiftId,
    staffId,
    workDate,
  }: {
    shiftId: number;
    staffId: number;
    workDate: string;
  }) {
    try {
      const res = await httpClient.post(`${BASE}`, {
        shiftId,
        staffId,
        workDate,
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  }
}

import httpClient from "..";

const BASE = "/auth";

export default class AccountService {
  static async changePassword(payload: {
    password: string;
    newPassword: string;
  }) {
    const res = await httpClient.patch(`${BASE}/password/`, payload);
    return res.data;
  }

  static async updateAccount(payload: {
    name?: string;
    email?: string;
    phone?: string;
  }) {
    const res = await httpClient.patch(`${BASE}/me`, payload);
    return res.data;
  }

  static async register(payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) {
    const res = await httpClient.post(`${BASE}/register`, payload);
    return res.data;
  }

  static async requestPasswordReset(payload: { email: string }) {
    const res = await httpClient.post(
      `${BASE}/password/reset-request`,
      payload,
    );
    return res.data;
  }

  static async resetPassword(payload: { token: string; newPassword: string }) {
    const res = await httpClient.post(`${BASE}/password/reset`, payload);
    return res.data;
  }

  static async login(data: { email: string; password: string }) {
    try {
      const res = await httpClient.post(`${BASE}/login`, data);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  static async me() {
    try {
      const res = await httpClient.get(`${BASE}/me`);
      return res.data;
    } catch (e) {
      throw e;
    }
  }
}

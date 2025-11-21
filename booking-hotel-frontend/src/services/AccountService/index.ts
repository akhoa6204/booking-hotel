import httpClient from "..";

const BASE = "/auth";

export default class AccountService {
  static async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }) {
    const res = await httpClient.post(`${BASE}/change-password`, payload);
    return res.data;
  }

  static async updateAccount(payload: {
    name?: string;
    email?: string;
    phone?: string;
  }) {
    const res = await httpClient.post(`${BASE}/info`, payload);
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

  // === NEW: gửi email reset password ===
  static async requestPasswordReset(payload: { email: string }) {
    const res = await httpClient.post(`${BASE}/password/request-reset`, payload);
    return res.data; // { success, message, data: null }
  }

  // === NEW: đặt lại mật khẩu với token ===
  static async resetPassword(payload: { token: string; newPassword: string }) {
    const res = await httpClient.post(`${BASE}/password/reset`, payload);
    return res.data; // { success, message, data: null }
  }
}

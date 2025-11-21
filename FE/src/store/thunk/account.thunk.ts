import { createAsyncThunk } from "@reduxjs/toolkit";
import httpClient from "@services";
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No token found");
      }
      const response = await httpClient.get("/auth/me");
      return { user: response.data, token };
    } catch (error: any) {
      localStorage.removeItem("token");
      return rejectWithValue("Session expired");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("email:", credentials.email);
      console.log("password:", credentials.password);

      const response = await httpClient.post("/auth/login", credentials);
      const { user, token } = response.data;
      localStorage.setItem("accessToken", token);

      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || "Login failed");
    }
  }
);

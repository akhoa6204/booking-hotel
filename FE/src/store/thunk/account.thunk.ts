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
      localStorage.removeItem("accessToken");
      return rejectWithValue("Session expired");
    }
  },
);

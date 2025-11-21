import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit";
import { SliceName } from "./slice.name";
import { AccountThunk } from "../thunk";
import { LoginResponse } from "@constant/response/auth";
import { User } from "@constant/types";

interface AuthState {
  user?: User;
  token?: string;
  loading: boolean;
  error: boolean;
}

const initialState: AuthState = {
  user: null,
  token: "",
  loading: false,
  error: false,
};

const accountSlice = createSlice({
  name: SliceName.Account,
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("accessToken");
    },
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(
          AccountThunk.initializeAuth.pending,
          AccountThunk.login.pending
        ),
        (state) => {
          state.loading = true;
          state.error = false;
        }
      )
      .addMatcher(
        isAnyOf(
          AccountThunk.initializeAuth.fulfilled,
          AccountThunk.login.fulfilled
        ),
        (state, action: PayloadAction<LoginResponse>) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      )
      .addMatcher(
        isAnyOf(
          AccountThunk.initializeAuth.rejected,
          AccountThunk.login.rejected
        ),
        (state) => {
          state.loading = false;
          state.error = true;
        }
      );
  },
});

export default accountSlice;
export const { logout, loginSuccess } = accountSlice.actions;

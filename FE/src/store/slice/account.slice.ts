import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit";
import { SliceName } from "./slice.name";
import { AccountThunk } from "../thunk";
import { LoginResponse } from "@constant/response/auth";
import { User } from "@constant/types";

interface AuthState {
  user?: User;
}

const initialState: AuthState = {
  user: null,
};

const accountSlice = createSlice({
  name: SliceName.Account,
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export default accountSlice;
export const { logout, loginSuccess } = accountSlice.actions;

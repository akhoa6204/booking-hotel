import { User } from "@constant/types";

export type LoginResponse = {
  token: string;
  user: User;
};

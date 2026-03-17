import { User, UserRole } from "@constant/types";
import { RootState } from "../store";

export const isManager = (user: User | null): boolean =>
  user?.role === "MANAGER" || user?.role === "ADMIN";

export const isCustomer = (user: User | null): boolean =>
  user?.role === "CUSTOMER";

export const hasRole = (user: User | null, role: UserRole): boolean =>
  user?.role === role;

export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const canAccessManager = (user: User | null): boolean => isManager(user);

export const canAccessCustomer = (user: User | null): boolean =>
  isCustomer(user) || isManager(user); // manager có thể xem dữ liệu customer nếu cần

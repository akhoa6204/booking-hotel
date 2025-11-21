import { User, UserRole } from "@constant/types";
import { RootState } from "../store";

/* ----------- Kiểm tra từng role ----------- */
export const isManager = (user: User | null): boolean =>
  user?.role === "MANAGER";

export const isCustomer = (user: User | null): boolean =>
  user?.role === "CUSTOMER";

/* ----------- Kiểm tra có role cụ thể ----------- */
export const hasRole = (user: User | null, role: UserRole): boolean =>
  user?.role === role;

export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

/* ----------- Hiển thị tên role ----------- */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    MANAGER: "Quản lý khách sạn",
    CUSTOMER: "Khách hàng",
  };
  return roleNames[role] ?? role;
};

/* ----------- Phân quyền truy cập ----------- */
export const canAccessManager = (user: User | null): boolean =>
  isManager(user);

export const canAccessCustomer = (user: User | null): boolean =>
  isCustomer(user) || isManager(user); // manager có thể xem dữ liệu customer nếu cần
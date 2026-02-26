import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@hooks/useAuth";
import { UserRole } from "@constant/types";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: UserRole;
  requiredAnyRole?: UserRole[];
  requiredRoles?: UserRole[];
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredAnyRole,
  requiredRoles,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { user, hasRole, hasAnyRole } = useAuth();

  if (!user) return <Navigate to={fallbackPath} replace />;

  const isStaffOrAdmin = user.role !== "CUSTOMER";
  const managerHome = "/manager/bookings";
  const defaultUnauthorized = isStaffOrAdmin ? managerHome : "/";

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={defaultUnauthorized} replace />;
  }

  const anyRoleList = requiredAnyRole ?? requiredRoles;
  if (anyRoleList && anyRoleList.length && !hasAnyRole(anyRoleList)) {
    return <Navigate to={defaultUnauthorized} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

export const AdminRoute = () => (
  <ProtectedRoute requiredRole="ADMIN">
    <Outlet />
  </ProtectedRoute>
);

export const StaffRoute = ({ roles }: { roles?: UserRole[] }) => (
  <ProtectedRoute requiredAnyRole={["ADMIN", "MANAGER", ...roles]}>
    <Outlet />
  </ProtectedRoute>
);

export const CustomerRoute = () => (
  <ProtectedRoute requiredRole="CUSTOMER">
    <Outlet />
  </ProtectedRoute>
);

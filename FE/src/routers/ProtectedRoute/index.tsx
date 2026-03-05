import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@hooks/useAuth";
import { UserRole } from "@constant/types";
import { useMemo } from "react";

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

  const defaultUnauthorized = useMemo(() => {
    if (user.role === "ADMIN" || user.role === "MANAGER")
      return "/manager/dashboard";

    if (user.role === "RECEPTION") return "/manager/front-desk";

    if (user.role === "HOUSEKEEPING") return "/manager/housekeeping";

    return "/";
  }, [user.role]);

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={defaultUnauthorized} replace />;
  }

  if (requiredRoles && requiredRoles.length && !hasAnyRole(requiredRoles)) {
    return <Navigate to={defaultUnauthorized} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

export const AdminRoute = () => (
  <ProtectedRoute requiredRoles={["ADMIN", "MANAGER"]}>
    <Outlet />
  </ProtectedRoute>
);

export const StaffRoute = ({ roles }: { roles?: UserRole[] }) => (
  <ProtectedRoute requiredRoles={["ADMIN", "MANAGER", ...roles]}>
    <Outlet />
  </ProtectedRoute>
);

export const CustomerRoute = () => (
  <ProtectedRoute requiredRole="CUSTOMER">
    <Outlet />
  </ProtectedRoute>
);

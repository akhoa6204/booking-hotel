import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@hooks/useAuth";
import { UserRole } from "@constant/types";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}
export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { user, hasRole } = useAuth();

  if (!user) return <Navigate to={fallbackPath} replace />;

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

export const ManagerRoute = () => (
  <ProtectedRoute requiredRole="MANAGER">
    <Outlet />
  </ProtectedRoute>
);

export const CustomerRoute = () => (
  <ProtectedRoute requiredRole="CUSTOMER">
    <Outlet />
  </ProtectedRoute>
);

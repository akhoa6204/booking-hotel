import useAuth from "@hooks/useAuth";
import { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const UnProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace={true} /> : <Outlet />;
};

export default function PublicGate() {
  const { user, hasRole, hasAnyRole } = useAuth();

  const managerPath = useMemo(() => {
    if (!user) return "/";

    if (user.role === "ADMIN" || user.role === "MANAGER")
      return "/manager/dashboard";

    if (user.role === "RECEPTION") return "/manager/front-desk";

    if (user.role === "HOUSEKEEPING") return "/manager/housekeeping-tasks";

    return "/";
  }, [user?.role]);

  if (user && !hasRole("CUSTOMER")) {
    return <Navigate to={managerPath} replace />;
  }
  return <Outlet />;
}

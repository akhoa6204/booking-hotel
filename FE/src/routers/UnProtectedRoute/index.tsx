import useAuth from "@hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export const UnProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace={true} /> : <Outlet />;
};

export default function PublicGate() {
  const { user, hasRole } = useAuth();
  if (user && !hasRole("CUSTOMER")) {
    return <Navigate to="/manager/bookings" replace />;
  }
  return <Outlet />;
}

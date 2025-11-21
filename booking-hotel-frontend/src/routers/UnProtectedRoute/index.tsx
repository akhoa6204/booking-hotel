import useAuth from "@hooks/useAuth";
import { useAppSelector } from "@hooks/useRedux";
import { Navigate, Outlet } from "react-router-dom";

export const UnProtectedRoute = () => {
  const { user } = useAppSelector((state) => state.account);
  return user ? <Navigate to="/" replace={true} /> : <Outlet />;
};

export default function PublicGate() {
  const { user, hasRole } = useAuth();
  if (user && hasRole("MANAGER")) {
    return <Navigate to="/manager/dashboard" replace />;
  }
  return <Outlet />;
}

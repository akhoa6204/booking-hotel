import React, { useEffect } from "react";
import { useAppDispatch } from "@hooks/useRedux";
import { initializeAuth } from "@store/thunk/account.thunk";

const AuthInitialize: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitialize;

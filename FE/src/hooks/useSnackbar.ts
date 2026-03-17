import { useState } from "react";

const useSnackbar = () => {
  const [alert, setAlert] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  const showSuccess = (msg: string) =>
    setAlert({ open: true, severity: "success", message: msg });

  const showError = (msg: string) =>
    setAlert({ open: true, severity: "error", message: msg });

  const showWarning = (msg: string) =>
    setAlert({ open: true, severity: "warning", message: msg });

  const closeSnackbar = () => setAlert((a) => ({ ...a, open: false }));

  return {
    alert,
    showError,
    showSuccess,
    closeSnackbar,
    showWarning,
  };
};
export default useSnackbar;

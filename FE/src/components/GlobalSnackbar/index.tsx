import { Alert, Snackbar } from "@mui/material";

const severityColor = {
  success: "#24AB70",
  error: "#D32F2F",
  warning: "#ED6C02",
};

const GlobalSnackbar = ({ alert, closeSnackbar }) => (
  <Snackbar
    open={alert.open}
    autoHideDuration={1000}
    onClose={closeSnackbar}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
  >
    <Alert
      severity={alert.severity as any}
      onClose={closeSnackbar}
      variant="filled"
      sx={{
        alignItems: "center",
        backgroundColor: severityColor[alert.severity] || "#1976D2",
        color: "#fff",
        whiteSpace: "pre-line",
      }}
    >
      {alert.message}
    </Alert>
  </Snackbar>
);

export default GlobalSnackbar;

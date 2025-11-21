import { Alert, Snackbar } from "@mui/material";

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
        backgroundColor: alert.severity === "success" ? "#24AB70" : "#D32F2F",
        color: "#fff",
      }}
    >
      {alert.message}
    </Alert>
  </Snackbar>
);

export default GlobalSnackbar;

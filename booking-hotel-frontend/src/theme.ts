import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#24AB70" },
    text: { primary: "#222222", secondary: "#555555" },
  },
  typography: {
    fontFamily: `"Open Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.25rem", lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: "1.875rem", lineHeight: 1.25 },
    h3: { fontWeight: 600, fontSize: "1.5rem" },
    body1: { fontSize: "1rem" },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          color: "#1f2937",
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 64, paddingInline: 16, paddingBlock: 10 },
        containedPrimary: { color: "#fff" },
        text: { paddingInline: 8 },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "inherit",
          textDecoration: "none",
          "&:hover": { color: "#22A86F" },
          "&.active": { color: "#22A86F", borderBottom: "2px solid #22A86F" },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: { color: "" },
      },
    },
  },
});

export default theme;

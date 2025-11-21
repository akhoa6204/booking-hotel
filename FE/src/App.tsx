import { RouterProvider } from "react-router";
import { ThemeProvider, CssBaseline } from "@mui/material";
import router from "@routers";
import theme from "./theme";

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
  </ThemeProvider>
);

export default App;

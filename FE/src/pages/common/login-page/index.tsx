import React from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Link,
  Paper,
} from "@mui/material";
import useLogin from "./useLogin";
import useSnackbar from "@hooks/useSnackbar";
import GlobalSnackbar from "@components/GlobalSnackbar";

const LoginPage = () => {
  const { form, onChange, onSubmit, alert, closeSnackbar } = useLogin();
  return (
    <>
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            mt: 10,
            p: 5,
            borderRadius: 2,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5" fontWeight={700}>
              Đăng nhập
            </Typography>
            <Typography color="text.secondary">
              Chào mừng bạn quay trở lại Skyline
            </Typography>

            <Box
              component="form"
              sx={{ width: "100%", mt: 2 }}
              onSubmit={onSubmit}
            >
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  placeholder="example@email.com"
                  fullWidth
                  name="email"
                  onChange={onChange}
                  value={form.email}
                />
                <TextField
                  label="Mật khẩu"
                  type="password"
                  fullWidth
                  name="password"
                  onChange={onChange}
                  value={form.password}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ py: 1.2 }}
                >
                  Đăng nhập
                </Button>
              </Stack>
            </Box>

            <Stack sx={{ mt: 2 }} alignContent={"center"}>
              <Link
                href="/forgot-password"
                underline="hover"
                className="text-center !mb-2"
              >
                <Typography color="primary">Quên mật khẩu?</Typography>
              </Link>
              <Typography variant="body2">
                Chưa có tài khoản?{" "}
                <Link href="/register" underline="hover">
                  <Typography
                    component={"span"}
                    variant="body2"
                    color="primary"
                  >
                    Đăng ký ngay
                  </Typography>
                </Link>
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default LoginPage;

// src/pages/auth/ResetPasswordPage.tsx
import GlobalSnackbar from "@components/GlobalSnackbar";
import useForm from "@hooks/useForm";
import useSnackbar from "@hooks/useSnackbar";
import {
  Box,
  Button,
  Container,
  InputLabel,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AccountService from "@services/AccountService";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const fields = [
  {
    name: "password",
    label: "Mật khẩu mới",
    type: "password",
    placeholder: "Mật khẩu mới",
  },
  {
    name: "confirmPassword",
    label: "Nhập lại mật khẩu mới",
    type: "password",
    placeholder: "Nhập lại mật khẩu mới",
  },
];

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { alert, closeSnackbar, showError, showSuccess } = useSnackbar();

  // ===== LẤY TOKEN TỪ URL & XÓA KHỎI URL =====
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      navigate("/login", { replace: true });
      return;
    }

    // lưu lại token để dùng khi submit
    setToken(t);

    // xóa token khỏi URL (chỉ giữ lại path + các query khác nếu có)
    searchParams.delete("token");
    const newSearch = searchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ""}`;

    window.history.replaceState({}, "", newUrl);
  }, [location.pathname, searchParams]);

  const initForm = {
    password: "",
    confirmPassword: "",
  };

  // ===== MUTATION RESET PASSWORD =====
  const mResetPassword = useMutation({
    mutationFn: async (payload: { newPassword: string }) => {
      if (!token) {
        throw new Error("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
      }
      return AccountService.resetPassword({
        token,
        newPassword: payload.newPassword,
      });
    },
    onSuccess: () => {
      showSuccess("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate("/login");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Không thể đặt lại mật khẩu, vui lòng thử lại!";
      showError(msg);
    },
  });

  // ===== FORM + VALIDATE =====
  const { form, errors, onChange, onSubmit } = useForm(
    initForm,
    (f) => {
      const errors: Record<string, string> = {};

      if (!f.password.trim()) errors.password = "Mật khẩu không được để trống";
      else if (f.password.length < 6)
        errors.password = "Mật khẩu tối thiểu 6 ký tự";

      if (!f.confirmPassword.trim())
        errors.confirmPassword = "Vui lòng nhập lại mật khẩu";
      else if (f.confirmPassword !== f.password)
        errors.confirmPassword = "Mật khẩu nhập lại không khớp";

      if (!token) {
        errors.token = "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn";
      }

      return errors;
    },
    async (values) => {
      await mResetPassword.mutateAsync({ newPassword: values.password });
    }
  );

  return (
    <>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ my: 10, p: 5, borderRadius: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5" fontWeight={700}>
              Đặt lại mật khẩu
            </Typography>
            <Typography color="text.secondary">
              Nhập mật khẩu mới cho tài khoản của bạn
            </Typography>

            <Box
              component="form"
              sx={{ width: "100%", mt: 2 }}
              onSubmit={onSubmit}
            >
              <Stack spacing={2}>
                {fields.map((f) => (
                  <Box key={f.name}>
                    <InputLabel>{f.label}</InputLabel>
                    <TextField
                      type={f.type}
                      name={f.name}
                      fullWidth
                      value={form[f.name]}
                      onChange={onChange}
                      placeholder={f.placeholder}
                      error={Boolean(errors[f.name])}
                      helperText={errors[f.name] || ""}
                    />
                  </Box>
                ))}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ py: 1.2 }}
                  disabled={mResetPassword.isPending}
                >
                  {mResetPassword.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </Stack>
            </Box>

            <Link href="/login" textAlign="center">
              <Typography
                color="text.secondary"
                sx={{
                  "&:hover": {
                    color: "#24AB70",
                  },
                }}
              >
                Quay lại đăng nhập
              </Typography>
            </Link>
          </Stack>
        </Paper>
      </Container>

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default ResetPasswordPage;

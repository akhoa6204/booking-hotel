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
import { useNavigate } from "react-router-dom";

const fields = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Nhập email tài khoản của bạn để nhận mã xác thực",
  },
];

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { alert, closeSnackbar, showError, showSuccess } = useSnackbar();

  const initForm = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  };

  // ===== MUTATION =====
  const mRequestReset = useMutation({
    mutationFn: async (payload: { email: string }) => {
      return AccountService.requestPasswordReset(payload);
    },

    onSuccess: () => {
      showSuccess(
        "Gửi mã xác thực thành công. Kiểm tra email của bạn để nhận mật khẩu mới"
      );
    },

    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!";
      showError(msg);
    },
  });

  // ===== FORM + VALIDATE =====
  const { form, errors, onChange, onSubmit } = useForm(
    initForm,

    // validate
    (f) => {
      const errors: any = {};

      if (!f.email.trim()) errors.email = "Email không được để trống";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errors.email = "Email không hợp lệ";

      return errors;
    },

    // onSubmit
    async (values) => {
      await mRequestReset.mutateAsync(values);
    }
  );

  return (
    <>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ my: 10, p: 5, borderRadius: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5" fontWeight={700}>
              Quên mật khẩu
            </Typography>

            <Typography color="text.secondary">
              Nhập email nhận OTP đặt lại mật khẩu
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
                  disabled={mRequestReset.isPending}
                >
                  {mRequestReset.isPending
                    ? "Đang xử lý..."
                    : "Gửi mã xác thực"}
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
                Quay lại đăng nhập?
              </Typography>
            </Link>
          </Stack>
        </Paper>
      </Container>

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default ForgotPasswordPage;

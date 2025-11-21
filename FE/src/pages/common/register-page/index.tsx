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
  { name: "fullName", label: "Họ tên", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Số điện thoại", type: "tel" },
  { name: "password", label: "Mật khẩu", type: "password" },
  { name: "confirmPassword", label: "Nhập lại mật khẩu", type: "password" },
];

const RegisterPage = () => {
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
  const mRegister = useMutation({
    mutationFn: async (payload: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
    }) => {
      return AccountService.register(payload);
    },

    onSuccess: () => {
      navigate("/login", {
        state: {
          result: true,
        },
      });
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

      if (!f.fullName.trim()) errors.fullName = "Họ tên không được để trống";

      if (!f.email.trim()) errors.email = "Email không được để trống";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errors.email = "Email không hợp lệ";

      if (!f.phone.trim()) errors.phone = "Số điện thoại không được để trống";
      else if (!/^\d{9,11}$/.test(f.phone))
        errors.phone = "Số điện thoại không hợp lệ";

      if (!f.password.trim()) errors.password = "Mật khẩu không được để trống";
      else if (f.password.length < 6)
        errors.password = "Mật khẩu tối thiểu 6 ký tự";

      if (!f.confirmPassword.trim())
        errors.confirmPassword = "Vui lòng nhập lại mật khẩu";
      else if (f.confirmPassword !== f.password)
        errors.confirmPassword = "Mật khẩu nhập lại không khớp";

      return errors;
    },

    // onSubmit
    async (values) => {
      await mRegister.mutateAsync(values);
    }
  );

  return (
    <>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ my: 10, p: 5, borderRadius: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5" fontWeight={700}>
              Đăng ký
            </Typography>

            <Typography color="text.secondary">
              Tạo tài khoản mới tại Skyline
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
                  disabled={mRegister.isPending}
                >
                  {mRegister.isPending ? "Đang xử lý..." : "Đăng ký"}
                </Button>
              </Stack>
            </Box>

            <Stack sx={{ mt: 2 }} alignContent="center">
              <Typography variant="body2">
                Đã có tài khoản?{" "}
                <Link href="/login" underline="hover">
                  <Typography component="span" variant="body2" color="primary">
                    Đăng nhập ngay
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

export default RegisterPage;

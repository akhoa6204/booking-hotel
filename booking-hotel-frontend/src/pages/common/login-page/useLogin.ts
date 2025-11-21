import { Errors } from "@constant/types";
import useForm from "@hooks/useForm";
import { useAppDispatch, useAppSelector } from "@hooks/useRedux";
import useSnackbar from "@hooks/useSnackbar";
import { login } from "@store/thunk/account.thunk";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}
const initialForm: LoginForm = { email: "", password: "" };

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");
const validate = (f: LoginForm): Errors<LoginForm> => {
  const err: Errors<LoginForm> = {};
  if (!isEmail(f.email)) err.email = "Email không hợp lệ";
  if (!f.password) err.password = "Mật khẩu không hợp lệ";
  return err;
};
const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const callback = async (form: LoginForm) => {
    const { user } = await dispatch(login(form)).unwrap();
    console.log("user:", user);
    if (user.role === "MANAGER")
      navigate("/manager/dashboard", { replace: true });
    else navigate("/", { replace: true });
  };

  const location = useLocation();

  const { form, errors, onChange, onSubmit } = useForm<LoginForm>(
    initialForm,
    validate,
    callback
  );
  const { alert, closeSnackbar, showSuccess } = useSnackbar();

  useEffect(() => {
    if (location.state?.result) {
      showSuccess("Đăng kí tài khoản thành công. Đăng nhập để tiếp tục");
    }
  }, [location.state]);

  return { form, errors, onChange, onSubmit, alert, closeSnackbar };
};

export default useLogin;

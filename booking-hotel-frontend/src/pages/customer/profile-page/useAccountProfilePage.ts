import { useState, type ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "@hooks/useRedux";
import { useMutation } from "@tanstack/react-query";
import type { InfoTabProps, EditableFieldProps } from "./components/info";
import type { ChangePasswordTabProps } from "./components/change-password";
import AccountService from "@services/AccountService";
import { initializeAuth } from "@store/thunk/account.thunk";
import { useSearchParams } from "react-router-dom";

type PwState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ActiveTab = "info" | "security";

const useAccountProfilePage = () => {
  const user = useAppSelector((s) => s.account.user);
  const dispatch = useAppDispatch();

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showAlert = (
    message: string,
    severity: "success" | "error" = "success"
  ) => setAlert({ open: true, message, severity });

  const closeSnackbar = () => setAlert((prev) => ({ ...prev, open: false }));

  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    (tabFromUrl as ActiveTab) ?? "info"
  );

  // =====================================
  // Helper factory: tạo state cho 1 field
  // =====================================
  const createEditableField = (
    initialValue: string | null,
    key: "name" | "email" | "phone"
  ): EditableFieldProps => {
    const [isEditing, setIsEditing] = useState(false);
    const [input, setInput] = useState(initialValue ?? "");

    const mutation = useMutation({
      mutationFn: (value: string) =>
        AccountService.updateAccount({ [key]: value }),
      onSuccess: () => {
        showAlert(`Cập nhật ${key} thành công!`, "success");
        setIsEditing(false);
        dispatch(initializeAuth());
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message || `Không thể cập nhật ${key}.`;
        showAlert(msg, "error");
        setIsEditing(false);
      },
    });

    return {
      value: initialValue,
      input,
      isEditing,
      saving: mutation.isPending,

      onClickEdit: () => setIsEditing(true),
      onChangeInput: (v) => setInput(v),

      onCancel: () => {
        setInput(initialValue ?? "");
        setIsEditing(false);
      },

      onSave: async () => {
        if (!input) return;
        await mutation.mutateAsync(input);
      },
    };
  };

  // Tạo 3 field editable
  const nameField = createEditableField(user?.fullName ?? "", "name");
  const emailField = createEditableField(user?.email ?? "", "email");
  const phoneField = createEditableField(user?.phone ?? "", "phone");

  // ===============================
  // PASSWORD FORM
  // ===============================
  const [pwState, setPwState] = useState<PwState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const onChangeField: ChangePasswordTabProps["onChangeField"] = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPwState((prev) => ({ ...prev, [name]: value }));
  };

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      AccountService.changePassword(payload),
    onSuccess: () => {
      showAlert("Đổi mật khẩu thành công!", "success");
      setPwState({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setActiveTab("info");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Lỗi khi đổi mật khẩu.";
      showAlert(msg, "error");
    },
  });

  const handleSubmitPassword: ChangePasswordTabProps["onSubmit"] = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwState;

    if (!currentPassword || !newPassword || !confirmPassword)
      return showAlert("Vui lòng nhập đầy đủ các trường.", "error");

    if (newPassword !== confirmPassword)
      return showAlert("Mật khẩu xác nhận không khớp.", "error");

    if (newPassword.length < 6)
      return showAlert("Mật khẩu mới phải từ 6 ký tự trở lên.", "error");

    await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
  };

  // ===============================
  // Build InfoTabProps (rất gọn)
  // ===============================
  const infoTabProps: InfoTabProps | null = user
    ? {
        name: nameField,
        email: emailField,
        phone: phoneField,
      }
    : null;

  const changePasswordTabProps: ChangePasswordTabProps = {
    currentPassword: pwState.currentPassword,
    newPassword: pwState.newPassword,
    confirmPassword: pwState.confirmPassword,
    loading: changePasswordMutation.isPending,
    onChangeField,
    onSubmit: handleSubmitPassword,
  };

  return {
    user,
    activeTab,
    setActiveTab,
    infoTabProps,
    changePasswordTabProps,
    alert,
    closeSnackbar,
  };
};

export default useAccountProfilePage;

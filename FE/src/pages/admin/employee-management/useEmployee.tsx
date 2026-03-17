import { DialogMode, UserRole } from "@constant/types";
import useForm from "@hooks/useForm";
import useSnackbar from "@hooks/useSnackbar";
import EmployeeService from "@services/EmployeeService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface Filters {
  q: string;
  page: number;
  limit: number;
}
export interface EmployeeForm {
  fullName: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  position: Omit<UserRole, "CUSTOMER" | "ADMIN">;
  newPassword?: string;
}
const validateForm = (form: EmployeeForm) => {
  const errors: Partial<Record<keyof EmployeeForm, string>> = {};

  if (!form.fullName?.trim()) {
    errors.fullName = "Họ tên không được để trống";
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = "Họ tên phải có ít nhất 2 ký tự";
  }

  const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
  if (form.phone?.trim() && !phoneRegex.test(form.phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email?.trim()) {
    errors.email = "Email không được để trống";
  } else if (!emailRegex.test(form.email.trim())) {
    errors.email = "Email không đúng định dạng";
  }

  if (!form.position) {
    errors.position = "Vui lòng chọn chức vụ";
  }

  return errors;
};

const useEmployee = () => {
  const queryClient = useQueryClient();
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: DialogMode;
  }>({
    open: false,
    mode: "create",
  });
  const { alert, showError, showSuccess, closeSnackbar } = useSnackbar();
  const [tab, setTab] = useState<"info" | "password">("info");
  const onChangeTab = (tab: "info" | "password") => setTab(tab);
  const onCloseDialog = () => {
    setTab("info");
    setDialogState((prev) => ({ ...prev, open: false }));
    setSelectedEmployeeId(null);
  };
  const onOpenDialog = (mode: DialogMode) => {
    setDialogState({ open: true, mode });
  };
  const { form: filters, onChangeField: onChangeFilters } = useForm<Filters>({
    q: "",
    page: 1,
    limit: 10,
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const {
    form: employeeForm,
    onChangeField: onChangeEmployeeForm,
    updateForm: updateEmployeeForm,
    resetForm: resetEmployeeForm,
    onSubmit: onSubmitEmployeeForm,
  } = useForm<EmployeeForm>(
    {
      fullName: "",
      phone: "",
      email: "",
      isActive: true,
      position: "RECEPTION",
      isAdmin: false,
      newPassword: "",
    },
    null,
    async () => {
      if (dialogState.mode === "create") {
        const errors = validateForm(employeeForm);
        if (Object.keys(errors).length) {
          showError("Thiếu thông tin nhân sự");
          return;
        }
      } else {
        if (!employeeForm.newPassword) {
          showError("Mật khẩu không được để trống");
          return;
        }
      }
      if (dialogState.mode === "create") {
        await mCreateEmployee.mutateAsync({
          data: {
            fullName: employeeForm.fullName,
            phone: employeeForm.phone,
            email: employeeForm.email,
            position: employeeForm.position,
          },
        });
      }
      if (dialogState.mode === "edit") {
        if (tab === "info") {
          await mUpdateEmployee.mutateAsync({
            id: selectedEmployeeId,
            data: {
              fullName: employeeForm.fullName,
              phone: employeeForm.phone,
              email: employeeForm.email,
              position: employeeForm.position,
              isActive: employeeForm.isActive,
            },
          });
        } else {
          await mResetPassword.mutateAsync({
            id: selectedEmployeeId,
            data: {
              newPassword: employeeForm.newPassword,
            },
          });
        }
      }
      resetEmployeeForm();
      onCloseDialog();
    },
  );

  const { data, isLoading } = useQuery({
    queryKey: ["employees", filters.limit, filters.page, filters.q],
    queryFn: async () => {
      return await EmployeeService.list(filters);
    },
  });
  const meta = data?.meta;
  const employees = data?.items || [];

  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employee", selectedEmployeeId],
    queryFn: async () => await EmployeeService.getById(selectedEmployeeId),
    enabled: !!selectedEmployeeId,
  });
  useEffect(() => {
    if (!dialogState.open) return;

    console.log(employee);
    if (dialogState.mode === "create") {
      resetEmployeeForm();
    }

    if (dialogState.mode === "edit" && !isLoadingEmployee && employee) {
      updateEmployeeForm({
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        isActive: employee.isActive,
        position: employee.staff.position,
        isAdmin: employee.staff.isAdmin,
      });
    }
  }, [dialogState.open, dialogState.mode, employee]);

  const onEdit = (id: number) => {
    setSelectedEmployeeId(id);
    onOpenDialog("edit");
  };
  const onToggle = async (id: number, isActive: boolean) => {
    if (mUpdateEmployee.isPending) return;

    try {
      await mUpdateEmployee.mutateAsync({
        id,
        data: { isActive },
      });
    } catch (error) {
      showError("Cập nhật trạng thái nhân viên thất bại");
    }
  };

  const mUpdateEmployee = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        fullName?: string;
        phone?: string;
        email?: string;
        isActive?: boolean;
        position?: Omit<UserRole, "CUSTOMER" | "ADMIN">;
      };
    }) => {
      return await EmployeeService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees", filters.limit, filters.page, filters.q],
      });

      queryClient.invalidateQueries({
        queryKey: ["employee", selectedEmployeeId],
      });

      showSuccess("Cập nhật thông tin nhân sự thành công");
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Cập nhật thông tin nhân sự thất bại";
      showError(msg);
    },
  });

  const mResetPassword = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        newPassword: string;
      };
    }) => {
      return await EmployeeService.resetPassword(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees", filters.limit, filters.page, filters.q],
      });

      queryClient.invalidateQueries({
        queryKey: ["employee", selectedEmployeeId],
      });

      showSuccess("Thay đổi mật khẩu thành công");
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Thay đổi mật khẩu thất bại";
      showError(msg);
    },
  });

  const mCreateEmployee = useMutation({
    mutationFn: async ({
      data,
    }: {
      data: {
        fullName: string;
        phone: string;
        email: string;
        position: Omit<UserRole, "CUSTOMER" | "ADMIN">;
      };
    }) => {
      return await EmployeeService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees", filters.limit, filters.page, filters.q],
      });

      queryClient.invalidateQueries({
        queryKey: ["employee", selectedEmployeeId],
      });
      showSuccess("Tạo nhân sự thành công");
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message || e?.message || "Tạo nhân sự thất bại";
      showError(msg);
    },
  });

  return {
    employees,
    isLoading,
    filters,
    onChangeFilters,
    meta,
    onEdit,
    onToggle,
    employeeForm,
    isLoadingEmployee,
    onCloseDialog,
    onOpenDialog,
    alert,
    closeSnackbar,
    dialogState,
    onChangeEmployeeForm,
    onSubmitEmployeeForm,
    tab,
    onChangeTab,
  };
};
export default useEmployee;

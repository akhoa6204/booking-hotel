import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ShiftService from "@services/ShiftService";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useMemo, useState } from "react";
import useAuth from "@hooks/useAuth";
import useSnackbar from "@hooks/useSnackbar";
import useForm from "@hooks/useForm";
dayjs.extend(isoWeek);

const useShift = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const { canAccessManager } = useAuth();
  const { alert, closeSnackbar, showSuccess, showError } = useSnackbar();
  const { form: dialog, onChangeField: onChangeDialog } = useForm<{
    open: boolean;
  }>({
    open: false,
  });
  const { form, onChangeField, onSubmit, resetForm, updateForm } = useForm<{
    staff: { id: number; fullName: string };
    workDate: string;
    shiftId: number;
  }>(
    {
      staff: {
        id: null,
        fullName: "",
      },
      workDate: "",
      shiftId: null,
    },
    null,
    async () => {
      await mCreateShift.mutateAsync({
        shiftId: form.shiftId,
        staffId: form.staff.id,
        workDate: form.workDate,
      });
      closeDialog();
    },
  );
  const start = useMemo(
    () => currentDate.startOf("isoWeek").format("YYYY-MM-DD"),
    [currentDate],
  );

  const end = useMemo(
    () => currentDate.endOf("isoWeek").format("YYYY-MM-DD"),
    [currentDate],
  );

  const canEdit = canAccessManager();
  const { data: shiftDefinitionsResponse } = useQuery({
    queryKey: ["shift-definitions"],
    queryFn: async () => await ShiftService.listDefinitons(),
  });

  const shiftDefinitions = useMemo(
    () => shiftDefinitionsResponse?.items || [],
    [shiftDefinitionsResponse?.items],
  );

  const {
    data: shifts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shift-list", start, end],
    queryFn: async () => {
      const res = await ShiftService.list({
        startDate: start,
        endDate: end,
      });
      return res;
    },
  });
  const mRemoveShift = useMutation({
    mutationFn: async (id: number) => {
      return await ShiftService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shift-list", start, end],
      });
      showSuccess("Xóa lịch làm thành công");
    },
    onError: (error) => {
      const msg = error?.message || "Xóa lịch làm thất bại";
      showError(msg);
    },
  });
  const mCreateShift = useMutation({
    mutationFn: async (form: {
      shiftId: number;
      staffId: number;
      workDate: string;
    }) => await ShiftService.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shift-list", start, end],
      });
      showSuccess("Tạo ca làm thành công");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Tạo ca làm thất bại";
      showError(msg);
    },
  });

  const nextWeek = () => setCurrentDate((prev) => prev.add(7, "day"));
  const prevWeek = () => setCurrentDate((prev) => prev.subtract(7, "day"));
  const onRemove = async (id: number) => await mRemoveShift.mutateAsync(id);
  const openDialog = (
    staff: { id: number; fullName: string },
    workDate: string,
  ) => {
    if (shiftDefinitions.length === 0) {
      showError("Có lỗi xảy ra");
      return;
    }
    onChangeDialog("open", true);
    updateForm({
      staff,
      workDate,
      shiftId: shiftDefinitions[0].id,
    });
  };

  const closeDialog = () => {
    onChangeDialog("open", false);
    resetForm();
  };
  return {
    shifts,
    shiftDefinitions,
    nextWeek,
    prevWeek,
    start,
    end,
    onRemove,
    canEdit,

    alert,
    closeSnackbar,

    form,
    openDialog,
    closeDialog,
    onSubmit,
    open: dialog.open,
    onChangeForm: onChangeField,
  };
};

export default useShift;

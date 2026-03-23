import { DialogMode, TaskStatus, TaskType } from "@constant/types";
import useAuth from "@hooks/useAuth";
import { useEntityPicker } from "@hooks/useEntityPickerDialog";
import useForm from "@hooks/useForm";
import useSnackbar from "@hooks/useSnackbar";
import EmployeeService from "@services/EmployeeService";
import HouseKeepingService from "@services/HouseKeepingService";
import RoomService from "@services/RoomService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

interface Filter {
  q?: string;
  status: TaskStatus | "ALL";
  page: number;
  limit: number;
}
export type TaskForm = {
  roomId?: number;
  staffId?: number;
  type?: TaskType | "DEFAULT";
  status: TaskStatus;
  updatedAt?: string;
  note?: string;
};
const validateForm = (form: TaskForm) => {
  const errors: Partial<Record<keyof TaskForm, string>> = {};

  if (!form.roomId) {
    errors.roomId = "Vui lòng chọn phòng";
  }

  if (!form.staffId) {
    errors.staffId = "Vui lòng chọn nhân viên";
  }

  if (!form.type || form.type === "DEFAULT") {
    errors.type = "Vui lòng chọn loại công việc";
  }

  return errors;
};
const useHouseKeeping = () => {
  const queryClient = useQueryClient();
  const { canAccessManager, hasRole } = useAuth();
  const { alert, closeSnackbar, showError, showSuccess } = useSnackbar();
  const { form: filters, onChangeField: onChangeFilter } = useForm<Filter>({
    q: "",
    status: "ALL",
    page: 1,
    limit: 8,
  });
  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ["housekeeping-tasks", filters],
    queryFn: async () =>
      await HouseKeepingService.list({
        ...filters,
        status: filters.status === "ALL" ? "" : filters.status,
      }),
  });

  const meta = useMemo(() => tasksResponse?.meta, [tasksResponse?.meta]);
  const tasks = useMemo(
    () => tasksResponse?.items || [],
    [tasksResponse?.items],
  );
  const notHouseKeeping = canAccessManager() || hasRole("RECEPTION");
  const handleChangePage = (pageNumber: number) =>
    onChangeFilter("page", pageNumber);

  const mUpdateTask = useMutation({
    mutationFn: async ({
      id,
      staffId,
      roomId,
      status,
      note,
      type,
    }: {
      id: number;
      staffId?: number;
      status?: TaskStatus;
      note?: string;
      roomId?: number;
      type?: TaskType;
    }) =>
      await HouseKeepingService.update(id, {
        staffId,
        status,
        note,
        roomId,
        type,
      }),
    onSuccess: () => {
      showSuccess("Cập nhật nội dung nhiệm vụ phòng thành công");
      queryClient.invalidateQueries({
        queryKey: ["housekeeping-tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["housekeeping-tasks", selectedTaskId],
      });
    },
    onError(error, variables, onMutateResult, context) {
      const msg = error.message || "Cập nhật nội dung nhiệm vụ phòng thất bại";
      showError(msg);
    },
  });
  const handleUpdateTask = async ({
    id,
    staffId,
    roomId,
    status,
    note,
  }: {
    id: number;
    roomId?: number;
    staffId?: number;
    status?: TaskStatus;
    note?: string;
  }) => await mUpdateTask.mutateAsync({ id, staffId, status, note, roomId });

  const [dialog, setDialog] = useState<{ open: boolean; mode?: DialogMode }>({
    open: false,
  });
  const [filtersRoom, setFiltersRoom] = useState<{
    q?: string;
    page: number;
    limit: number;
  }>({ q: "", page: 1, limit: 4 });
  const [filtersStaff, setFiltersStaff] = useState<{
    q?: string;
    page: number;
    limit: number;
  }>({ q: "", page: 1, limit: 4 });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { form, onChangeField, onSubmit, resetForm, updateForm } =
    useForm<TaskForm>(
      {
        roomId: null,
        staffId: null,
        type: "DEFAULT",
        status: "PENDING",
        updatedAt: null,
        note: null,
      },
      validateForm,
      async () => {
        if (dialog.mode === "create") {
          await mCreateTask.mutateAsync({
            roomId: form.roomId,
            staffId: form.staffId,
            type: form.type as TaskType,
          });
        } else {
          await mUpdateTask.mutateAsync({
            id: selectedTaskId,
            roomId: form.roomId,
            staffId: form.staffId,
            type: form.type as TaskType,
            status: form.status,
            note: form.note,
          });
        }
        onClose();
      },
    );
  const mCreateTask = useMutation({
    mutationFn: async (data: {
      roomId: number;
      staffId: number;
      type: TaskType;
    }) => await HouseKeepingService.create(data),
    onSuccess: () => {
      showSuccess("Tạo nhiệm vụ phòng thành công");
      queryClient.invalidateQueries({
        queryKey: [
          "rooms-list",
          filtersRoom.q,
          filtersRoom.page,
          filtersRoom.limit,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["housekeeping-tasks", selectedTaskId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "staffs-list",
          filtersStaff.q,
          filtersStaff.page,
          filtersStaff.limit,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["housekeeping-tasks", filters],
      });
    },
    onError: (error) => {
      const msg = error?.message || "Tạo nhiệm vụ phòng thất bại";
      showError(msg);
    },
  });
  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ["housekeeping-tasks", selectedTaskId],
    queryFn: async () => await HouseKeepingService.getById(selectedTaskId),
    enabled: !!selectedTaskId,
  });
  useEffect(() => {
    if (!task) return;
    selectRoom(task.room);
    if (task.staff?.user) {
      selectStaff(task.staff.user);
    }
    updateForm({
      roomId: task.room.id,
      staffId: task.staff?.id || undefined,
      type: task.type,
      status: task.status,
      updatedAt: task.updatedAt,
      note: task.note,
    });
  }, [task]);

  const {
    selectedId: selectedIdRoom,
    selectedRow: selectedRowRoom,
    setSelectedId: setSelectedIdRoom,
    open: openEntityPickerRoomDialog,
    openPicker: openPickerRoom,
    closePicker: onClosePickerRoom,
    select: selectRoom,
    mergeOptions: mergeOptionsRoom,
    resetEntityPicker: resetEntityPickerRoom,
  } = useEntityPicker();

  const {
    selectedId: selectedIdStaff,
    selectedRow: selectedRowStaff,
    setSelectedId: setSelectedIdStaff,
    open: openEntityPickerStaffDialog,
    openPicker: openPickerStaff,
    closePicker: onClosePickerStaff,
    select: selectStaff,
    mergeOptions: mergeOptionsStaff,
    resetEntityPicker: resetEntityPickerStaff,
  } = useEntityPicker();

  const openPickerRoomHandler = () => {
    setFiltersRoom((pre) => ({ ...pre, limit: 7 }));
    openPickerRoom();
  };
  const openPickerStaffHandler = () => {
    setFiltersStaff((pre) => ({ ...pre, limit: 7 }));
    openPickerStaff();
  };
  const closePickerRoomHandler = () => {
    setFiltersRoom({ limit: 4, q: "", page: 1 });
    onClosePickerRoom();
  };
  const closePickerStaffHandler = () => {
    setFiltersStaff({ limit: 4, q: "", page: 1 });
    onClosePickerStaff();
  };
  const onChange = (field: keyof TaskForm, value: any) => {
    if (field === "roomId") {
      setSelectedIdRoom(value);
    }
    if (field === "staffId") {
      setSelectedIdStaff(value);
    }
    onChangeField(field, value);
  };
  const onOpen = (mode: DialogMode, id?: number) => {
    setDialog({ open: true, mode });
    if (id) {
      setSelectedTaskId(id);
    }
  };
  const onClose = () => {
    setDialog({ open: false });
    resetForm();
    setSelectedTaskId(null);
    resetEntityPickerRoom();
    resetEntityPickerStaff();
    setFiltersRoom({ q: "", page: 1, limit: 4 });
    setFiltersStaff({ q: "", page: 1, limit: 4 });
  };
  const canEditForm = dialog.mode !== "view";
  console.log(dialog);

  const { data: roomsResponse, isLoading: loadingRooms } = useQuery({
    queryKey: [
      "rooms-list",
      filtersRoom.q,
      filtersRoom.page,
      filtersRoom.limit,
    ],
    queryFn: async () => await RoomService.list(filtersRoom),
  });
  const rooms = roomsResponse?.items || [];
  const metaRooms = roomsResponse?.meta;
  const onSearchRoom = (value: string) =>
    setFiltersRoom((pre) => ({ ...pre, q: value }));
  const optionsRoom = mergeOptionsRoom(rooms);
  const isMoreRoom = metaRooms?.totalPages > 1;

  const onPageChangeRoom = (page: number) =>
    setFiltersRoom((pre) => ({ ...pre, page }));

  const { data: staffsResponse, isLoading: loadingStaffs } = useQuery({
    queryKey: [
      "staffs-list",
      filtersStaff.q,
      filtersStaff.page,
      filtersStaff.limit,
    ],
    queryFn: async () =>
      await EmployeeService.list({ ...filtersStaff, position: "HOUSEKEEPING" }),
  });
  const staffs = staffsResponse?.items || [];
  const metaStaffs = staffsResponse?.meta;
  const onSearchStaff = (value: string) =>
    setFiltersStaff((pre) => ({ ...pre, q: value }));
  const optionsStaff = mergeOptionsStaff(staffs);
  const isMoreStaff = metaStaffs?.totalPages > 1;

  const onPageChangeStaff = (page: number) => {
    setFiltersStaff((pre) => ({ ...pre, page }));
  };
  return {
    tasks,
    meta,
    notHouseKeeping,
    filters,
    onChangeFilter,
    handleChangePage,
    handleUpdateTask,

    alert,
    closeSnackbar,

    open: dialog.open,
    mode: dialog.mode,
    onOpen,
    form,
    onChange,
    onSubmit,
    onClose,
    canEditForm,
    optionsRoom,
    isMoreRoom,
    openPickerRoom: openPickerRoomHandler,
    optionsStaff,
    isMoreStaff,
    openPickerStaff: openPickerStaffHandler,
    loadingTask,

    rooms,
    openEntityPickerRoomDialog,
    onClosePickerRoom: closePickerRoomHandler,
    selectedIdRoom,
    filtersRoom,
    onSearchRoom,
    metaRooms,
    onPageChangeRoom,
    selectRoom,
    loadingRooms,

    staffs,
    openEntityPickerStaffDialog,
    onClosePickerStaff: closePickerStaffHandler,
    selectedIdStaff,
    filtersStaff,
    onSearchStaff,
    metaStaffs,
    onPageChangeStaff,
    selectStaff,
    loadingStaffs,
  };
};
export default useHouseKeeping;

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RoomTypeService from "@services/RoomTypeService";
import RoomService from "@services/RoomService";
import { RoomStatus, RoomType } from "@constant/types";
import useForm from "@hooks/useForm";
import useSnackbar from "@hooks/useSnackbar";

type RoomFilter = {
  searchKeyword?: string;
  roomTypeId?: number;
  currentPage: number;
  pageSize: number;
};

const defaultRoomFilter: RoomFilter = {
  searchKeyword: "",
  roomTypeId: undefined,
  currentPage: 1,
  pageSize: 6,
};

type UpsertFormRoom = {
  roomTypeId: number | "";
  name: string;
  description?: string;
  status?: RoomStatus;
};

function validateForm(form: UpsertFormRoom) {
  const errors: Partial<Record<keyof UpsertFormRoom, string>> = {};

  if (!form.name) {
    errors.name = "Tên phòng là bắt buộc.";
  }

  if (!form.roomTypeId) {
    errors.roomTypeId = "Loại phòng là bắt buộc.";
  }

  return errors;
}
export default function useRoomManagement() {
  const queryClient = useQueryClient();

  const { alert, showSuccess, showError, closeSnackbar } = useSnackbar();
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode?: "create" | "edit";
  }>({ open: false });
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const {
    form: filters,
    onChangeField: onChangeFilter,
    updateForm: updateFormFilter,
  } = useForm<RoomFilter>(defaultRoomFilter);
  const {
    form,
    updateForm,
    onChangeField,
    resetForm,
    onSubmit: submitUpsert,
  } = useForm<UpsertFormRoom>(
    {
      roomTypeId: "",
      name: "",
      description: "",
      status: "VACANT_CLEAN",
    },
    validateForm,
    async () => {
      if (editingRoomId) {
        await updateMutation.mutateAsync({
          id: editingRoomId,
          payload: form,
        });
      } else {
        await createMutation.mutateAsync(form);
      }
    },
  );

  const {
    data: roomTypeResponse,
    isLoading: isRoomTypeLoading,
    isError: isRoomTypeError,
    error: roomTypeError,
  } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: async () => await RoomTypeService.list(),
    staleTime: 30_000,
  });

  const roomTypes: RoomType[] = roomTypeResponse?.items ?? [];

  const {
    data: roomResponse,
    isLoading: isRoomLoading,
    isFetching: isRoomFetching,
  } = useQuery({
    queryKey: ["rooms", filters],
    queryFn: async () =>
      RoomService.list({
        q: filters.searchKeyword,
        roomTypeId: filters.roomTypeId,
        page: filters.currentPage,
        limit: filters.pageSize,
      }),
    staleTime: 10_000,
  });

  const rooms = roomResponse?.items ?? [];
  const paginationMetadata = roomResponse?.meta;

  const { data: roomDetail, isFetching: isRoomDetailLoading } = useQuery({
    queryKey: ["room", editingRoomId],
    queryFn: () => RoomService.get(editingRoomId!),
    enabled: !!editingRoomId && dialogState.open,
  });

  useEffect(() => {
    if (editingRoomId && roomDetail) {
      updateForm({
        roomTypeId: roomDetail.roomType.id,
        name: roomDetail.name,
        status: roomDetail.status as RoomStatus,
      });
    }
  }, [roomDetail, editingRoomId]);

  const handleSelectRoomType = (roomTypeId?: number) =>
    updateFormFilter({ roomTypeId, currentPage: 1, pageSize: 6 });

  const handleSearchByName = (keyword: string) =>
    updateFormFilter({ searchKeyword: keyword, currentPage: 1, pageSize: 6 });

  const handleChangePage = (pageNumber: number) =>
    onChangeFilter("currentPage", pageNumber);

  const openCreateDialog = () => {
    setEditingRoomId(null);
    resetForm();
    setDialogState({ open: true, mode: "create" });
  };

  const openEditDialog = (roomId: number) => {
    setEditingRoomId(roomId);
    setDialogState({ open: true, mode: "edit" });
  };

  const closeDialog = () => {
    setDialogState({ open: false });
    setEditingRoomId(null);
    resetForm();
  };

  const editStatusRoomHandler = async (id: number, status: RoomStatus) => {
    if (!id) return;

    try {
      await RoomService.update(id, { status });

      await queryClient.invalidateQueries({ queryKey: ["rooms"] });

      showSuccess("Cập nhật trạng thái phòng thành công");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Không thể cập nhật trạng thái phòng";
      showError(msg);
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: UpsertFormRoom) =>
      RoomService.create({
        roomTypeId: Number(payload.roomTypeId),
        name: payload.name,
        description: payload.description,
        status: payload.status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      closeDialog();
      showSuccess("Tạo phòng mới thành công");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Có lỗi xảy ra";
      showError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: number; payload: UpsertFormRoom }) =>
      RoomService.update(args.id, {
        name: args.payload.name,
        description: args.payload.description,
        status: args.payload.status,
        roomTypeId:
          args.payload.roomTypeId != null
            ? Number(args.payload.roomTypeId)
            : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      closeDialog();
      showSuccess("Cập nhật phòng thành công");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Có lỗi xảy ra";
      showError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (args: { id: number }) => RoomService.remove(args.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      showSuccess("Xóa phòng thành công");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Có lỗi xảy ra";
      showError(msg);
    },
  });

  const deleteRoom = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
  };

  const roomTypeLabels = useMemo(
    () => roomTypes.map((t) => t.name),
    [roomTypes],
  );

  const activeTabValue = useMemo(() => {
    const selectedType = roomTypes.find(
      (t) => t.id === filters.roomTypeId,
    )?.name;
    return selectedType || "ALL";
  }, [filters.roomTypeId, roomTypes]);

  const handleChangeTab = (tabLabel: string) => {
    const selectedTypeId =
      tabLabel === "ALL"
        ? undefined
        : roomTypes.find((t) => t.name === tabLabel)?.id;
    handleSelectRoomType(selectedTypeId);
  };

  return {
    // Data
    rooms,
    roomTypes,
    paginationMetadata,
    formValues: form,

    // Filters
    filters,
    handleSearchByName,
    handleChangeTab,
    handleChangePage,

    // Dialog
    dialogState,
    openCreateDialog,
    openEditDialog,
    closeDialog,

    // Form
    handleFormChange: onChangeField,
    submitUpsert,
    deleteRoom,

    // Loading
    isRoomLoading: isRoomLoading || isRoomFetching || isRoomTypeLoading,
    isSubmitting: createMutation.isPending || updateMutation.isPending,

    // UI helpers
    roomTypeLabels,
    activeTabValue,
    isRoomTypeError,
    roomTypeError,

    editStatusRoomHandler,
    alert,
    closeSnackbar,
  };
}

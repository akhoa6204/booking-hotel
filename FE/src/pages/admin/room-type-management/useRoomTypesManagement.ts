import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RoomTypeService from "@services/RoomTypeService";
import AmenityService from "@services/AmenityService";
import { Amenity, DialogMode, RoomType } from "@constant/types";
import useSnackbar from "@hooks/useSnackbar";
import useForm from "@hooks/useForm";

type DialogState = { open: boolean; mode?: Omit<DialogMode, "view"> };

export type UpsertFormRoomType = {
  hotelId: number;
  roomTypeId?: number;
  name: string;
  basePrice: string | number;
  capacity: number | "";
  description: string;
  amenities: Amenity[];

  images: { id?: number; url: string }[];
  imageIds: number[];
  files: File[];
};
const validateForm = (form: UpsertFormRoomType) => {
  const errors: Partial<Record<keyof UpsertFormRoomType, string>> = {};

  if (
    !form.basePrice ||
    form.basePrice === "" ||
    isNaN(Number(form.basePrice))
  ) {
    errors.basePrice = "Giá phòng là bắt buộc và phải là một số hợp lệ.";
  }

  // Kiểm tra capacity
  if (!form.capacity) {
    errors.capacity = "Số người là bắt buộc.";
  } else if (isNaN(Number(form.capacity)) || Number(form.capacity) <= 0) {
    errors.capacity = "Số người phải là một số lớn hơn 0.";
  }

  // Kiểm tra amenities
  if (form.amenities.length === 0) {
    errors.amenities = "Ít nhất một dịch vụ phải được chọn.";
  }

  return errors;
};
const initialForm: UpsertFormRoomType = {
  hotelId: 1,
  roomTypeId: undefined,
  name: "",
  basePrice: "",
  capacity: "",
  description: "",
  amenities: [],
  images: [],
  imageIds: [],
  files: [],
};

const useRoomTypesManagement = () => {
  const qc = useQueryClient();

  const [filters, setFilters] = useState({
    hotelId: 1,
    q: "",
    page: 1,
    limit: 6,
  });

  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [editingId, setEditingId] = useState<number | undefined>();
  const { form, updateForm, onChangeField, resetForm, setForm, onSubmit } =
    useForm<UpsertFormRoomType>(initialForm, validateForm, () => {
      const amenityIds = (form.amenities ?? [])
        .filter((a): a is Amenity => !!a && a.id != null)
        .map((a) => a.id);

      const cleanBase =
        form.basePrice === "" || form.basePrice == null
          ? 0
          : Number(String(form.basePrice).replace(/[,_\s]/g, ""));

      const fd = new FormData();
      fd.append("hotelId", String(form.hotelId));
      fd.append("name", form.name.trim());
      fd.append("capacity", String(form.capacity));
      fd.append("basePrice", String(cleanBase));
      fd.append("description", form.description ?? "");

      amenityIds.forEach((id) => fd.append("amenities", String(id)));
      form.imageIds.forEach((id) => fd.append("imageIds", String(id)));
      form.files.forEach((file) => fd.append("images", file));

      if (dialogState.mode === "edit" && editingId) {
        updateMutation.mutateAsync({ id: editingId, payload: fd });
      } else {
        createMutation.mutateAsync(fd);
      }
    });

  const { alert, closeSnackbar, showError, showSuccess } = useSnackbar();

  const { data, isLoading } = useQuery({
    queryKey: ["roomTypes", filters],
    queryFn: () =>
      RoomTypeService.list({
        page: filters.page,
        limit: filters.limit,
        q: filters.q,
      }),
  });

  const roomTypes: RoomType[] = data?.items ?? [];
  const meta = data?.meta;

  const handleSearch = (keyword: string) =>
    setFilters((s) => ({ ...s, q: keyword, page: 1 }));

  const handleChangePage = (page: number) =>
    setFilters((s) => ({ ...s, page }));

  const {
    data: amenityData,
    isLoading: isAmenitiesLoading,
    error: amenitiesError,
  } = useQuery({
    queryKey: ["amenities"],
    queryFn: () => AmenityService.list(),
  });

  const amenityOptions: Amenity[] = amenityData ?? [];

  const onClose = () => {
    setDialogState({ open: false });
    setEditingId(undefined);
    resetForm();
  };

  const onCreateDialog = () => {
    resetForm();
    setEditingId(undefined);
    setDialogState({ open: true, mode: "create" });
  };

  const onEditDialog = (id: number) => {
    setEditingId(id);
    setDialogState({ open: true, mode: "edit" });
  };

  const { data: roomTypeDetail } = useQuery({
    queryKey: ["roomDetail", editingId],
    queryFn: () => RoomTypeService.getById(editingId as number),
    enabled: !!editingId && dialogState.open && dialogState.mode === "edit",
  });

  useEffect(() => {
    if (!roomTypeDetail || dialogState.mode !== "edit") return;
    const rt = roomTypeDetail;

    updateForm({
      roomTypeId: rt.id,
      name: rt.name || "",
      basePrice: rt.basePrice || "",
      capacity: rt.capacity || "",
      description: rt.description || "",
      amenities: rt.amenities || [],
      images: rt.images?.map((img) => ({ id: img.id, url: img.url })) || [],
      imageIds: rt.images?.map((img) => img.id) || [],
      files: [],
    });
  }, [roomTypeDetail, dialogState.mode]);

  const handlePickFiles = (files: File[]) => {
    const currentCount = form.images?.length ?? 0;
    if (currentCount >= 8) return;

    const allow = Math.max(0, 8 - currentCount);
    const toAdd = files.slice(0, allow);

    const previews = toAdd.map((f) => ({ url: URL.createObjectURL(f) }));

    updateForm({
      ...form,
      files: [...form.files, ...toAdd],
      images: [...form.images, ...previews],
    });
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => {
      const nextImages = [...prev.images];
      const removed = nextImages[index];
      nextImages.splice(index, 1);

      let nextIds = prev.imageIds;
      let nextFiles = prev.files;

      if (removed?.id != null) {
        nextIds = prev.imageIds.filter((id) => id !== removed.id);
      } else {
        const oldCount = prev.images.filter((img) => img.id != null).length;
        const fileIndex = index - oldCount;
        if (fileIndex >= 0 && fileIndex < prev.files.length) {
          nextFiles = [
            ...prev.files.slice(0, fileIndex),
            ...prev.files.slice(fileIndex + 1),
          ];
        }
      }

      return {
        ...prev,
        images: nextImages,
        imageIds: nextIds,
        files: nextFiles,
      };
    });
  };

  const createMutation = useMutation({
    mutationFn: (payload: any) => RoomTypeService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roomTypes"] });
      showSuccess("Tạo loại phòng thành công");
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      showError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; payload: any }) =>
      RoomTypeService.update(vars.id, vars.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roomTypes"] });
      showSuccess("Cập nhật loại phòng thành công");
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      showError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => RoomTypeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roomTypes"] });
      showSuccess("Xóa loại phòng thành công");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      showError(msg);
    },
  });

  const handleDeleteRoomType = (id: number) => {
    deleteMutation.mutate(id);
  };

  const showAddButton = meta?.total < 6;

  return {
    showAddButton,
    // room types
    roomTypes,
    meta,
    isLoading,

    // amenities master
    amenityOptions,
    isAmenitiesLoading,
    amenitiesError,

    // filters
    filters,
    handleSearch,
    handleChangePage,

    // dialog state
    dialogState,
    onClose,
    onCreateDialog,
    onEditDialog,

    // form state
    form,
    onChange: onChangeField,

    // image handlers
    onPickFiles: handlePickFiles,
    onRemoveImage: handleRemoveImage,

    // delete
    handleDeleteRoomType,
    isDeleting: deleteMutation.isPending,

    // submit
    onSubmit,
    isSaving: createMutation.isPending || updateMutation.isPending,

    // snackbar
    alert,
    closeSnackbar,
  };
};

export default useRoomTypesManagement;

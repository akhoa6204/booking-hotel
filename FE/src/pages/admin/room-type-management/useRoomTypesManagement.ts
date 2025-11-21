import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RoomTypeService from "@services/RoomTypeService";
import AmenityService from "@services/AmenityService";
import { Amenity, DialogMode, RoomType } from "@constant/types";

type DialogState = { open: boolean; mode?: DialogMode };
type AlertState = {
  open: boolean;
  severity: "success" | "error" | "info" | "warning";
  message: string;
};
export type UpsertFormRoomType = {
  hotelId: number;
  roomTypeId?: number;
  name: string;
  basePrice: string | number;
  capacity: number | "";
  description: string;
  amenities: Amenity[];

  images: { id?: number; url: string }[]; // preview (cũ + mới)
  imageIds: number[]; // id ảnh cũ giữ lại
  files: File[]; // file mới
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
  const [form, setForm] = useState<UpsertFormRoomType>(initialForm);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    severity: "success",
    message: "",
  });

  const openAlert = (severity: AlertState["severity"], message: string) =>
    setAlert({ open: true, severity, message });

  const closeSnackbar = () =>
    setAlert((prev) => ({
      ...prev,
      open: false,
    }));

  /* ============ LIST ROOM TYPES ============ */
  const { data, isLoading } = useQuery({
    queryKey: ["roomTypes", filters],
    queryFn: () =>
      RoomTypeService.list({
        hotelId: filters.hotelId,
        page: filters.page,
        limit: filters.limit,
        q: filters.q,
      }),
  });

  const roomTypes: RoomType[] = data?.items ?? [];
  console.log(roomTypes);
  const meta = data?.meta;

  const handleSearch = (keyword: string) =>
    setFilters((s) => ({ ...s, q: keyword, page: 1 }));

  const handleChangePage = (page: number) =>
    setFilters((s) => ({ ...s, page }));

  /* ============ AMENITIES MASTER ============ */
  const {
    data: amenityData,
    isLoading: isAmenitiesLoading,
    error: amenitiesError,
  } = useQuery({
    queryKey: ["amenities"],
    queryFn: () => AmenityService.list(),
  });

  const amenityOptions: Amenity[] = amenityData ?? [];

  /* ============ DIALOG ============ */
  const onClose = () => {
    setDialogState({ open: false });
    setEditingId(undefined);
    setForm(initialForm);
  };

  const onCreateDialog = () => {
    setForm(initialForm);
    setEditingId(undefined);
    setDialogState({ open: true, mode: "create" });
  };

  const onEditDialog = (id: number) => {
    setEditingId(id);
    setDialogState({ open: true, mode: "edit" });
  };

  const onChange = (field: keyof UpsertFormRoomType, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* ============ DETAIL ============ */
  const { data: roomTypeDetail } = useQuery({
    queryKey: ["roomDetail", editingId],
    queryFn: () => RoomTypeService.getById(editingId as number),
    enabled: !!editingId && dialogState.open && dialogState.mode === "edit",
  });

  useEffect(() => {
    if (!roomTypeDetail || dialogState.mode !== "edit") return;
    const rt = roomTypeDetail;

    setForm({
      hotelId: 1,
      roomTypeId: rt.id,
      name: rt.name ?? "",
      basePrice: rt.basePrice ?? "",
      capacity: rt.capacity ?? "",
      description: rt.description ?? "",
      amenities: rt.amenities ?? [],
      images: rt.images?.map((img) => ({ id: img.id, url: img.url })) ?? [],
      imageIds: rt.images?.map((img) => img.id) ?? [],
      files: [],
    });
  }, [roomTypeDetail, dialogState.mode]);

  /* ============ IMAGE HANDLERS ============ */
  const handlePickFiles = (files: File[]) => {
    setForm((prev) => {
      const currentCount = prev.images?.length ?? 0;
      if (currentCount >= 8) return prev;

      const allow = Math.max(0, 8 - currentCount);
      const toAdd = files.slice(0, allow);

      const previews = toAdd.map((f) => ({ url: URL.createObjectURL(f) }));

      return {
        ...prev,
        files: [...prev.files, ...toAdd],
        images: [...prev.images, ...previews],
      };
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
        // Ảnh cũ (từ DB) -> bỏ id khỏi danh sách giữ lại
        nextIds = prev.imageIds.filter((id) => id !== removed.id);
      } else {
        // Ảnh mới (blob) -> cần xoá đúng file tương ứng
        // số ảnh cũ hiện tại = số phần tử trong images có id
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

  /* ============ MUTATIONS ============ */
  const createMutation = useMutation({
    mutationFn: (payload: any) => RoomTypeService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roomTypes"] });
      openAlert("success", "Tạo loại phòng thành công");
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Tạo loại phòng thất bại";
      openAlert("error", msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; payload: any }) =>
      RoomTypeService.update(vars.id, vars.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roomTypes"] });
      openAlert("success", "Cập nhật loại phòng thành công");
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Cập nhật loại phòng thất bại";
      openAlert("error", msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => RoomTypeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roomTypes"] });
      openAlert("success", "Xóa loại phòng thành công");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Xóa loại phòng thất bại";
      openAlert("error", msg);
    },
  });

  const handleDeleteRoomType = (id: number) => {
    deleteMutation.mutate(id);
  };

  /* ============ SUBMIT ============ */
  const onSubmit = () => {
    if (!form.basePrice || !form.capacity || !form.amenities.length) return;

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
      updateMutation.mutate({ id: editingId, payload: fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  return {
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
    setForm,
    onChange,

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

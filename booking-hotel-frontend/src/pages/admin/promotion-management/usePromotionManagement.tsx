// hooks/usePromotionManagement.ts
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PromotionService from "@services/PromotionService";
import {
  DialogMode,
  Promotion,
  PromoScope,
  PromoType,
  RoomType,
} from "@constant/types";
import RoomTypeService from "@services/RoomTypeService";

type DialogState = { open: boolean; mode?: DialogMode };

type Filters = {
  hotelId: number;
  code: string;
  scope?: PromoScope;
  active?: boolean;
  page: number;
  limit: number;
};

export type PromotionForm = {
  code: string;
  description: string;
  discountType: PromoType;
  value: number | "";
  scope: PromoScope;
  roomTypeId: number | "";
  minTotal: number | "";
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  totalCodes: number | ""; // "" = unlimited
  active: boolean;
};

const initialFilters: Filters = {
  hotelId: 1,
  code: "",
  scope: undefined,
  active: undefined,
  page: 1,
  limit: 10,
};

const initialForm: PromotionForm = {
  code: "",
  description: "",
  discountType: "PERCENT",
  value: "",
  scope: "GLOBAL",
  roomTypeId: "",
  minTotal: "",
  startDate: "",
  endDate: "",
  totalCodes: "",
  active: true,
};

const usePromotionManagement = () => {
  const qc = useQueryClient();

  /* =================== LIST =================== */
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const { data, isLoading } = useQuery({
    queryKey: ["promotions", filters],
    queryFn: () =>
      PromotionService.list({
        hotelId: filters.hotelId,
        code: filters.code || undefined,
        scope: filters.scope,
        active: filters.active,
        page: filters.page,
        limit: filters.limit,
      }),
  });

  const rows: Promotion[] = data?.items ?? [];
  const meta = data?.meta;

  const handleSearch = (keyword: string) =>
    setFilters((s) => ({ ...s, code: keyword, page: 1 }));
  const handleChangePage = (page: number) =>
    setFilters((s) => ({ ...s, page }));

  const totalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil((meta?.total ?? 0) / (meta?.limit ?? filters.limit))
      ),
    [meta?.total, meta?.limit, filters.limit]
  );
  const currentPage = meta?.page ?? filters.page;

  /* =================== DIALOG + FORM =================== */
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [form, setForm] = useState<PromotionForm>(initialForm);
  const [editingId, setEditingId] = useState<number | undefined>();

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

  // nhận thẳng bản ghi từ bảng để fill form
  const onEditDialog = (p: Promotion) => {
    setEditingId(p.id);
    setForm({
      code: p.code ?? "",
      description: (p as any).description ?? "",
      discountType: p.discountType,
      value: Number(p.value),
      scope: p.scope,
      roomTypeId: p.scope === "ROOM_TYPE" ? p.roomType?.id ?? "" : "",
      minTotal:
        p.scope === "MIN_TOTAL" || p.scope === "GLOBAL"
          ? (p as any).minTotal ?? ""
          : "",
      startDate: p.startDate?.slice(0, 10) ?? "",
      endDate: p.endDate?.slice(0, 10) ?? "",
      totalCodes: (p as any).totalCodes ?? "",
      active: p.active,
    });
    setDialogState({ open: true, mode: "edit" });
  };

  const onChange = (field: keyof PromotionForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* =================== MUTATIONS =================== */
  const createMutation = useMutation({
    mutationFn: () =>
      PromotionService.create({
        hotelId: filters.hotelId,
        scope: form.scope,
        description: form.description,
        discountType: form.discountType,
        value: Number(form.value || 0),
        startDate: form.startDate,
        endDate: form.endDate,
        roomTypeId:
          form.scope === "ROOM_TYPE"
            ? form.roomTypeId
              ? Number(form.roomTypeId)
              : null
            : null,
        minTotal:
          form.scope === "GLOBAL" || form.scope === "MIN_TOTAL"
            ? form.minTotal !== "" && form.minTotal != null
              ? Number(form.minTotal)
              : null
            : null,
        code: form.code?.trim() || null,
        conditions: null,
        active: form.active,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      PromotionService.update(editingId!, {
        scope: form.scope,
        discountType: form.discountType,
        description: form.description,
        value: form.value === "" ? undefined : Number(form.value),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        roomTypeId:
          form.scope === "ROOM_TYPE"
            ? form.roomTypeId
              ? Number(form.roomTypeId)
              : null
            : null,
        minTotal:
          form.scope === "GLOBAL" || form.scope === "MIN_TOTAL"
            ? form.minTotal !== "" && form.minTotal != null
              ? Number(form.minTotal)
              : null
            : null,
        code: form.code?.trim() || null,
        active: form.active,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => PromotionService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });

  const onSubmit = () => {
    if (!form.startDate || !form.endDate) return;
    if (dialogState.mode === "edit" && editingId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const handleDeletePromotion = (id: number) => {
    if (window.confirm("Xóa khuyến mãi này?")) deleteMutation.mutate(id);
  };

  /* =================== FETCH ROOM TYPES =================== */
  const {
    data: roomTypeResponse,
    isLoading: isRoomTypeLoading,
    isError: isRoomTypeError,
    error: roomTypeError,
  } = useQuery({
    queryKey: ["roomTypes", filters.hotelId],
    queryFn: async () =>
      await RoomTypeService.list({ hotelId: filters.hotelId }),
    staleTime: 30_000,
  });

  const roomTypes: RoomType[] = roomTypeResponse?.items ?? [];
  // usePromotionManagement.ts — chỉ phần return thêm các field sau:
  return {
    rows,
    totalPages,
    currentPage,
    isLoading,
    filters,
    handleSearch,
    handleChangePage,

    // dialog + form
    dialogState, // { open, mode }
    form, // PromotionForm
    onChange, // (field, value) => void
    onCreateDialog,
    onEditDialog, // (p: Promotion) => void
    onClose, // đóng dialog
    onSubmit, // create/update

    // actions
    handleDeletePromotion,
    // nếu bạn đã fetch roomTypes trong hook, expose:
    roomTypes, // { id, name }[]
  };
};

export default usePromotionManagement;

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PromotionService from "@services/PromotionService";
import { DialogMode, Promotion, RoomType } from "@constant/types";
import RoomTypeService from "@services/RoomTypeService";
import useForm from "@hooks/useForm";
import useSnackbar from "@hooks/useSnackbar";

type DialogState = { open: boolean; mode?: DialogMode };

type Filters = {
  q: string;
  page: number;
  limit: number;
};

const initialFilters: Filters = {
  q: "",
  page: 1,
  limit: 10,
};
export type PromotionForm = Omit<Promotion, "id" | "hotelId" | "isActive">;
const initialForm: PromotionForm = {
  name: "",
  priority: 100,
  scope: "GLOBAL",
  roomTypes: [],
  description: "",
  minTotal: null,
  code: "",
  type: "PERCENT",
  maxDiscountAmount: null,
  value: null,
  startAt: "",
  endAt: "",
  autoApply: false,
  quotaTotal: null,
  eligibleFor: "ALL",
  isStackable: false,
};
export const getPromotionLabels = (promotion) => {
  const scopeLabel =
    promotion.scope === "ROOM_TYPE"
      ? "Loại phòng"
      : promotion.scope === "MIN_TOTAL"
        ? "Giá tối thiểu"
        : "Toàn bộ";

  const discountTypeTransform =
    promotion.type === "FIXED" ? "Giá cố định" : "Phần trăm";

  const usedLabel =
    promotion.quotaTotal == null
      ? (promotion.quotaUsed ?? 0)
      : `${promotion.quotaUsed ?? 0}/${promotion.quotaTotal}`;

  const autoApplyLabel = promotion.autoApply ? "Tự động" : "Mã code";

  return {
    scopeLabel,
    discountTypeTransform,
    usedLabel,
    autoApplyLabel,
  };
};

const usePromotionManagement = () => {
  const qc = useQueryClient();

  const { alert, showError, showSuccess, closeSnackbar } = useSnackbar();
  const [editingId, setEditingId] = useState<number | undefined>();
  const {
    form: filters,
    onChangeField: onChangeFilter,
    updateForm: updateFilter,
  } = useForm<Filters>(initialFilters);
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const { form, onChangeField, resetForm, updateForm } =
    useForm<PromotionForm>(initialForm);

  const handleSearch = (keyword: string) =>
    updateFilter({
      ...filters,
      q: keyword,
      page: 1,
    });
  const handleChangePage = (page: number) => onChangeFilter("page", page);

  const { data, isLoading } = useQuery({
    queryKey: ["promotions", filters],
    queryFn: () =>
      PromotionService.list({
        q: filters.q || undefined,
        page: filters.page,
        limit: filters.limit,
      }),
  });

  const rows: Promotion[] = useMemo(() => data?.items || [], [data?.items]);
  const meta = useMemo(() => data?.meta, [data?.meta]);
  const totalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil((meta?.total ?? 0) / (meta?.limit ?? filters.limit)),
      ),
    [meta?.total, meta?.limit, filters.limit],
  );
  const currentPage = useMemo(() => meta?.page || 1, [meta?.page]);

  const { data: promotion, isLoading: isLoadingPromotion } = useQuery({
    queryKey: ["promotion", editingId],
    queryFn: () => PromotionService.getById(Number(editingId)),
    enabled: !!editingId,
  });

  const { data: roomTypeResponse } = useQuery({
    queryKey: ["roomTypes", filters.q],
    queryFn: async () => await RoomTypeService.list(),
    staleTime: 30_000,
  });

  const roomTypes: RoomType[] = useMemo(
    () => roomTypeResponse?.items || [],
    [roomTypeResponse?.items],
  );

  const onClose = () => {
    setDialogState({ open: false });
    setEditingId(undefined);
    resetForm();
  };

  const onCreateDialog = () => {
    setEditingId(undefined);
    resetForm();
    setDialogState({ open: true, mode: "create" });
  };

  const onEditDialog = (id: number) => {
    setEditingId(id);
  };

  useEffect(() => {
    if (!promotion) return;
    updateForm(promotion);
    setDialogState({ open: true, mode: "edit" });
  }, [promotion]);

  const createMutation = useMutation({
    mutationFn: () =>
      PromotionService.create({
        scope: form.scope,
        description: form.description,
        type: form.type,
        value: Number(form.value || 0),
        startAt: form.startAt,
        endAt: form.endAt,
        minTotal: Number(form.minTotal) || null,
        code: form.code?.trim() || null,
        name: form.name || null,
        autoApply: form.autoApply,
        priority: form.priority,
        maxDiscountAmount: Number(form.maxDiscountAmount) || null,
        isStackable: Boolean(form.isStackable),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      showSuccess("Tạo mã giảm giá thành công");
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Có lỗi xảy ra";
      showError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      PromotionService.update(editingId!, {
        scope: form.scope,
        type: form.type,
        description: form.description,
        value: Number(form.value) || undefined,
        startAt: form.startAt || undefined,
        endAt: form.endAt || undefined,
        roomTypes: form.roomTypes || null,
        minTotal: Number(form.minTotal) || null,
        code: form.code?.trim() || null,

        name: form.name || null,
        autoApply: form.autoApply,
        priority: form.priority,
        maxDiscountAmount: Number(form.maxDiscountAmount) || null,
        eligibleFor: form.eligibleFor,
        isStackable: Boolean(form.isStackable),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      onClose();
      showSuccess("Cập nhật mã giảm giá thành công");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Có lỗi xảy ra";
      showError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => PromotionService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      showSuccess("Xóa mã giảm giá thành công");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Có lỗi xảy ra";
      showError(msg);
    },
  });

  const onSubmit = () => {
    if (!form.startAt || !form.endAt) return;
    if (dialogState.mode === "edit" && editingId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const handleDeletePromotion = (id: number) => {
    if (window.confirm("Xóa khuyến mãi này?")) deleteMutation.mutate(id);
  };

  return {
    rows,
    totalPages,
    currentPage,
    isLoading,
    filters,
    handleSearch,
    handleChangePage,

    dialogState,
    form,
    onChangeField,
    onCreateDialog,
    onEditDialog,
    onClose,
    onSubmit,

    handleDeletePromotion,
    roomTypes,

    alert,
    closeSnackbar,

    promotion,
    isLoadingPromotion,
  };
};

export default usePromotionManagement;

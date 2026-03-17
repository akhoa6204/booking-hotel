import { DialogMode, ServiceType } from "@constant/types";
import useForm from "@hooks/useForm";
import useSnackbar from "@hooks/useSnackbar";
import ServiceService from "@services/ServiceService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Filter = {
  q?: string;
  page: number;
  limit: number;
};
export type ServiceForm = {
  name: string;
  price: number;
  type: ServiceType;
  description: string;
};
const defaultForm: ServiceForm = {
  name: "",
  price: 100000,
  type: "SERVICE",
  description: "",
};
const useService = () => {
  const queryClient = useQueryClient();
  const { alert, showSuccess, showError, closeSnackbar } = useSnackbar();
  const [filters, setFilters] = useState<Filter>({ q: "", page: 1, limit: 10 });
  const [selectedId, setSelectedId] = useState(null);
  const [dialog, setDialog] = useState<{ open: boolean; mode: DialogMode }>({
    open: false,
    mode: "create",
  });

  const { form, resetForm, onChangeField, onSubmit, updateForm } =
    useForm<ServiceForm>(defaultForm, null, async () => {
      if (dialog.mode === "create") {
        await mCreateService.mutateAsync(form);
      } else {
        await mUpdateService.mutateAsync(form);
      }

      closeDialog();
    });
  const openDialog = (mode: DialogMode) => setDialog({ open: true, mode });
  const onEdit = (id: number) => {
    setSelectedId(id);
    openDialog("edit");
  };
  const closeDialog = () => {
    setFilters({ q: "", page: 1, limit: 10 });
    setDialog((pre) => ({ ...pre, open: false }));
    setSelectedId(null);
    resetForm();
  };
  const { data: servicesResponse, isLoading: loadingServices } = useQuery({
    queryKey: ["services", filters.q, filters.page, filters.limit],
    queryFn: async () => await ServiceService.list({ ...filters }),
  });

  const services = servicesResponse?.items || [];
  const meta = servicesResponse?.meta;
  const onChangeFilter = (field: keyof Filter, value: any) =>
    setFilters((pre) => ({ ...pre, [field]: value }));

  const { data: service, isLoading: loadingServiceDetail } = useQuery({
    queryKey: ["service", selectedId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await ServiceService.getById(selectedId);
    },
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (!service) return;

    updateForm({
      name: service?.name || "",
      price: service?.price || 0,
      type: service?.type || "SERVICE",
      description: service?.description || "",
    });
  }, [service]);

  const mUpdateService = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: number;
      type: ServiceType;
    }) => await ServiceService.update(selectedId, data),
    onSuccess(data, variables, onMutateResult, context) {
      showSuccess("Cập nhật thông tin dịch vụ thành công");
      queryClient.invalidateQueries({
        queryKey: ["services", filters.q, filters.page, filters.limit],
      });
      queryClient.invalidateQueries({
        queryKey: ["service", selectedId],
      });
    },
    onError(error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Cập nhật thông tin dịch vụ thất bại";
      showError(msg);
    },
  });
  const mRemoveService = useMutation({
    mutationFn: async (id: number) => await ServiceService.remove(id),
    onSuccess(data, variables, onMutateResult, context) {
      showSuccess("Xóa dịch vụ thành công");
      queryClient.invalidateQueries({
        queryKey: ["services", filters.q, filters.page, filters.limit],
      });
      queryClient.invalidateQueries({
        queryKey: ["service", selectedId],
      });
    },
    onError(error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Xóa dịch vụ thất bại";
      showError(msg);
    },
  });

  const mCreateService = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: number;
      type: ServiceType;
    }) => await ServiceService.create(data),
    onSuccess(data, variables, onMutateResult, context) {
      showSuccess("Tạo mới dịch vụ thành công");
      queryClient.invalidateQueries({
        queryKey: ["services", filters.q, filters.page, filters.limit],
      });
      queryClient.invalidateQueries({
        queryKey: ["service", selectedId],
      });
    },
    onError(error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Tạo mới dịch vụ thất bại";
      showError(msg);
    },
  });
  const removeServiceHandler = async (id: number) =>
    await mRemoveService.mutateAsync(id);
  return {
    services,
    meta,
    service,

    loadingServices,
    loadingServiceDetail,
    creatingService: mCreateService.isPending,
    updatingService: mUpdateService.isPending,
    removingService: mRemoveService.isPending,

    filters,
    onChangeFilter,

    dialog,
    openDialog,
    onEdit,
    closeDialog,
    selectedId,
    setSelectedId,

    form,
    onChangeField,
    onSubmit,

    createService: mCreateService.mutateAsync,
    updateService: mUpdateService.mutateAsync,
    removeServiceHandler,

    alert,
    closeSnackbar,
  };
};
export default useService;

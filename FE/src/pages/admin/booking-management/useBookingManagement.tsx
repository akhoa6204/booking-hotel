import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import BookingService from "@services/BookingService";
import RoomService from "@services/RoomService";
import RoomTypeService from "@services/RoomTypeService";
import {
  Booking,
  PaymentMethod,
  PaymentType,
  QuoteResponse,
  ServiceType,
  TaskStatus,
  TaskType,
} from "@constant/types";
import { useLocation, useNavigate } from "react-router-dom";
import useSnackbar from "@hooks/useSnackbar";
import useForm from "@hooks/useForm";
import PaymentService from "@services/PaymentService";
import InvoiceService from "@services/InvoiceService";
import ServiceService from "@services/ServiceService";
import { rejects } from "assert";
import useSocket from "@hooks/useSocket";
import HouseKeepingService from "@services/HouseKeepingService";
import { useEntityPicker } from "@hooks/useEntityPickerDialog";
import { P } from "framer-motion/dist/types.d-DsEeKk6G";

export type BookingForm = {
  roomTypeId: number | "";
  roomId: number | "";
  checkIn: string;
  checkOut: string;
  promoCode: string;
  fullname: string;
  phone: string;
  paymentMethod: PaymentMethod;
};

type BookingFilter = {
  hotelId?: number;
  pageSize: number;
  currentPage: number;
  searchKeyword?: string;
};

const defaultBookingFilter: BookingFilter = {
  hotelId: 1,
  searchKeyword: "",
  currentPage: 1,
  pageSize: 20,
};

type Pricing = Omit<QuoteResponse, "promoApplied">;

export type ServiceFilter = {
  q?: string;
  type: ServiceType;
  page: number;
  limit: number;
};
type Dialog = {
  type?: "CREATE" | "VIEW";
  open: boolean;
};
const validateBookingForm = (form: BookingForm) => {
  const errors = {};
  if (!form.roomId) {
    errors["roomId"] = "Vui lòng chọn phòng";
  }
  if (!form.checkIn) {
    errors["checkIn"] = "Vui lòng chọn ngày nhận phòng";
  }
  if (!form.checkOut) {
    errors["checkOut"] = "Vui lòng chọn ngày trả phòng";
  }
  if (dayjs(form.checkOut).isBefore(dayjs(form.checkIn))) {
    errors["checkOut"] = "Ngày trả phòng phải sau ngày nhận phòng";
  }
  return errors;
};
export default function useBookingManagement() {
  const qc = useQueryClient();
  const { alert, showError, showSuccess, closeSnackbar, showWarning } =
    useSnackbar();

  const [filter, setFilter] = useState<BookingFilter>(defaultBookingFilter);
  const [dialog, setDialog] = useState<Dialog>({ open: false });
  const [selectedBookingId, setSelectedBookingId] = useState<number>();
  const {
    form: filterService,
    onChangeField: onChangeFilterService,
    updateForm: updateFilterService,
    resetForm: resetFilterService,
  } = useForm<ServiceFilter>({
    type: "SERVICE",
    page: 1,
    limit: 4,
  });
  const {
    form: formViewBooking,
    onChangeField: onChangeFormViewBooking,
    onSubmit: onSubmitFormViewBooking,
    resetForm: resetFormViewBooking,
  } = useForm<{
    method: "CASH" | "TRANSFER";
  }>({ method: "CASH" }, null, async () => {
    const subtotal = Number(invoiceDetail.subtotal || 0);
    const discount = Number(invoiceDetail.discount || 0);
    const tax = Number(invoiceDetail?.tax || 0);
    const total = subtotal - discount + tax;
    const paid = Number(invoiceDetail.paidAmount || 0);
    const remain = total - paid;

    const { paymentId } = await mCreatePayment.mutateAsync({
      invoiceId: bookingDetail.invoice.id,
      method: formViewBooking.method,
      amount: Number(remain),
    });

    if (formViewBooking.method === "CASH") {
      await mMarkPaymentAsPaid.mutateAsync(paymentId);
      qc.invalidateQueries({
        queryKey: ["invoice-detail", selectedBookingId],
      });
      showSuccess(
        "Thanh toán tiền mặt thành công cho đặt phòng ID " +
          `BK${String(selectedBookingId).padStart(4, "0")}`,
      );
      return;
    }

    await mCreatePaymentOnline.mutateAsync({ paymentId });
  });

  const [bookingViewTab, setBookingViewTab] = useState<
    "info" | "service" | "payment" | "housekeeping"
  >("info");

  const {
    selectedId,
    selectedRow,
    setSelectedId,
    open: openEntityPickerDialog,
    openPicker,
    closePicker,
    select,
    mergeOptions,
    resetEntityPicker,
  } = useEntityPicker();

  const onChangeBookingViewTab = (v: "info" | "service" | "payment") =>
    setBookingViewTab(v);
  const onChangePageService = (page: number) =>
    onChangeFilterService("page", page);
  const onChangeTabService = (tab: ServiceType) =>
    updateFilterService({ type: tab, page: 1 });

  const openDialog = (type: "CREATE" | "VIEW") =>
    setDialog({ open: true, type });
  const closeDialog = () => {
    setDialog({ open: false });
    resetFilterService();
    setBookingViewTab("info");
    resetFormViewBooking();
    resetEntityPicker();
    setSelectedTaskId(null);
    setFiltersHouseKeepingList((pre) => ({ ...pre, page: 1, limit: 5 }));
  };

  const {
    form: bookingForm,
    updateForm,
    onChangeField,
    resetForm: resetBookingForm,
    errors: bookingFormErrors,
    onSubmit: onSubmitBookingForm,
  } = useForm<BookingForm>(
    {
      roomTypeId: "",
      roomId: "",
      checkIn: dayjs().format("YYYY-MM-DD"),
      checkOut: dayjs().add(1, "day").format("YYYY-MM-DD"),
      promoCode: "",
      fullname: "",
      phone: "",
      paymentMethod: "CASH",
    },
    validateBookingForm,
    async (form: BookingForm) => {
      try {
        const { bookingId, invoiceId, remainingAmount } =
          await mCreateBooking.mutateAsync(form);
        const { paymentId } = await mCreatePayment.mutateAsync({
          invoiceId,
          method: form.paymentMethod,
          amount: Number(remainingAmount),
        });

        if (form.paymentMethod === "CASH") {
          await mMarkPaymentAsPaid.mutateAsync(paymentId);
          qc.invalidateQueries({ queryKey: ["admin-bookings"] });
          showSuccess(
            "Đặt phòng và thanh toán tiền mặt thành công cho đặt phòng ID " +
              `BK${String(bookingId).padStart(4, "0")}`,
          );
          resetForm();
          return;
        }

        await mCreatePaymentOnline.mutateAsync({ paymentId });
      } catch (error: Error | any) {
        const msg = error?.message || "Tạo đặt phòng thất bại";
        showError(msg);
      }
    },
  );

  const [pricing, setPricing] = useState<Pricing>();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as
      | { bookingId?: number; action?: "CHECK_IN" | "CHECK_OUT" }
      | undefined;
    if (!state?.bookingId) return;

    onView(state.bookingId);
    navigate(".", { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get("result");
    const paymentId = params.get("paymentId");

    if (result === "success") {
      mMarkPaymentAsPaid.mutateAsync(Number(paymentId));
    } else if (result === "cancel" || result === "fail") {
      mMarkPaymentAsCancelled.mutateAsync(Number(paymentId));
    }

    if (result) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, []);

  const onView = (id: number) => {
    setSelectedBookingId(id);
    openDialog("VIEW");
  };

  const { data: bookingDetail, isLoading: loadingCheckInDetail } = useQuery({
    queryKey: ["booking-detail", selectedBookingId],
    queryFn: async () => await BookingService.getById(selectedBookingId!),
    enabled: !!selectedBookingId,
  });

  const { data: invoiceDetail, isLoading: loadingInvoiceDetail } = useQuery({
    queryKey: ["invoice-detail", selectedBookingId],
    queryFn: async () => {
      return await InvoiceService.getById(bookingDetail.invoice.id);
    },
    enabled: !!bookingDetail?.invoice?.id,
  });

  const { data: servicesResponse, isLoading: loadingServices } = useQuery({
    queryKey: [
      "services",
      filterService.type,
      filterService.q,
      filterService.page,
    ],
    queryFn: async () => await ServiceService.list(filterService),
  });
  const services = useMemo(
    () => servicesResponse?.items || [],
    [servicesResponse?.items],
  );
  const metaServices = useMemo(
    () =>
      servicesResponse?.meta || {
        page: 1,
        limit: 4,
        total: 4,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
      },
    [servicesResponse?.meta],
  );

  const updateService = async (
    id: number,
    services: {
      serviceId: number;
      quantity: number;
    }[],
  ) => {
    await mUpdateService.mutateAsync({ id, data: { services } });
  };
  const removeService = async (id: number, removeItemIds: number[]) =>
    await mUpdateService.mutateAsync({ id, data: { removeItemIds } });

  const mUpdateService = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        services?: {
          serviceId: number;
          quantity: number;
        }[];
        removeItemIds?: number[];
      };
    }) => await InvoiceService.update(id, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail"] });
      qc.invalidateQueries({ queryKey: ["booking-detail"] });
    },
  });

  const { data: bookingListResponse, isLoading: loadingBookingList } = useQuery(
    {
      queryKey: ["admin-bookings", filter],
      queryFn: () =>
        BookingService.listAll({
          page: filter.currentPage,
          limit: filter.pageSize,
          q: filter.searchKeyword,
        }),
    },
  );

  const bookings = bookingListResponse?.items || [];
  const pagination = bookingListResponse?.meta;

  const handleSearchBooking = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFilter((prev) => ({ ...prev, searchKeyword: value, currentPage: 1 }));
  };

  const handleChangePage = (page: number) =>
    setFilter((prev) => ({ ...prev, currentPage: page }));

  const nights = useMemo(() => {
    const start = dayjs(bookingForm.checkIn);
    const end = dayjs(bookingForm.checkOut);
    const diff = end.diff(start, "day");
    return Math.max(1, Number.isFinite(diff) ? diff : 1);
  }, [bookingForm.checkIn, bookingForm.checkOut]);

  const resetForm = () => {
    resetBookingForm();
    setPricing(undefined);
    closeDialog();
  };

  const canCheckRooms =
    !!bookingForm.checkIn &&
    !!bookingForm.checkOut &&
    dayjs(bookingForm.checkOut).isAfter(bookingForm.checkIn);

  const canQuote = !!bookingForm.roomId && canCheckRooms;

  const [filtersAvailableRooms, setFiltersAvailableRooms] = useState<{
    q?: string;
    page: number;
    limit: number;
  }>({
    q: "",
    page: 1,
    limit: 4,
  });

  const openPickerHandler = () => {
    setFiltersAvailableRooms((prev) => ({
      ...prev,
      limit: 6,
      page: 1,
      q: "",
    }));
    openPicker();
  };
  const closePickerHandler = () => {
    setFiltersAvailableRooms((prev) => ({
      ...prev,
      limit: 4,
      page: 1,
      q: "",
    }));
    closePicker();
  };
  const onChangePage = (page: number) => {
    setFiltersAvailableRooms((prev) => ({ ...prev, page }));
  };

  const onSearch = (value: string) =>
    setFiltersAvailableRooms((prev) => ({ ...prev, q: value }));

  const {
    data: availableRoomsResponse,
    refetch: availableRoomRefetch,
    isLoading: loadingRooms,
  } = useQuery({
    queryKey: [
      "available-rooms",
      bookingForm.checkIn,
      bookingForm.checkOut,
      bookingForm.roomTypeId,
      filtersAvailableRooms.page,
      filtersAvailableRooms.q,
      filtersAvailableRooms.limit,
    ],
    queryFn: async () => {
      const res = await RoomService.list({
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        roomTypeId: bookingForm.roomTypeId
          ? Number(bookingForm.roomTypeId)
          : undefined,
        limit: filtersAvailableRooms.limit,
        page: filtersAvailableRooms.page,
        q: filtersAvailableRooms.q,
      });

      return res;
    },
    enabled: canCheckRooms,
  });

  const availableRooms = mergeOptions(availableRoomsResponse?.items);
  const metaAvailabelRooms = availableRoomsResponse?.meta;

  const mQuoteBooking = useMutation({
    mutationFn: async () => {
      if (!canQuote) throw new Error("Thiếu thông tin phòng hoặc ngày");
      const res = await RoomService.quote({
        roomId: Number(bookingForm.roomId),
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        promoCode: bookingForm.promoCode || undefined,
      });
      return res.data;
    },
  });

  useEffect(() => {
    const shouldQuote =
      bookingForm.roomId &&
      dayjs(bookingForm.checkOut).isAfter(bookingForm.checkIn);

    if (!shouldQuote) return;

    (async () => {
      try {
        const res = await mQuoteBooking.mutateAsync();
        setPricing(res);
      } catch {}
    })();
  }, [bookingForm.roomId, bookingForm.checkIn, bookingForm.checkOut]);

  const handleApplyPromo = () => {
    if (!canQuote) {
      showError("Vui lòng chọn phòng và ngày nhận trả phòng hợp lệ");
      return;
    }

    mQuoteBooking.mutate(undefined, {
      onSuccess: (res: any) => {
        setPricing(res);

        if (bookingForm.promoCode) {
          if (res.discount > 0) {
            showSuccess(
              `Áp dụng mã ${
                bookingForm.promoCode
              } thành công, giảm ${res.discount.toLocaleString()}₫`,
            );
          } else {
            showError("Mã giảm giá không áp dụng cho đơn này");
          }
        }
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ||
          "Không áp dụng được mã khuyến mãi. Vui lòng kiểm tra lại.";
        showError(msg);
      },
    });
  };

  const submitToSePay = (url: string, fields: Record<string, any>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const mCreateBooking = useMutation({
    mutationFn: async (form: BookingForm) =>
      await BookingService.adminCreate({
        roomId: Number(form.roomId),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        promoCode: form.promoCode || undefined,
        fullName: form.fullname?.trim() || "Khách lẻ",
        phone: form.phone?.trim() || "",
      }),
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Tạo đặt phòng thất bại, vui lòng thử lại";
      showError(msg);
    },
  });

  const mCreatePayment = useMutation({
    mutationFn: async ({
      invoiceId,
      method,
      amount,
      type,
    }: {
      invoiceId: number;
      method: PaymentMethod;
      amount: number;
      type?: PaymentType;
    }): Promise<{ paymentId: number }> => {
      return await PaymentService.create(invoiceId, method, amount, type);
    },

    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Tạo thanh toán thất bại";
      showError(msg);
    },
  });

  const mMarkPaymentAsPaid = useMutation({
    mutationFn: async (paymentId: number) => {
      new Promise((resolve) => setTimeout(resolve, 1000));
      return await PaymentService.updateStatus(paymentId, { status: "PAID" });
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-bookings", filter] });
      showSuccess(
        `Thanh toán thành công cho đặt phòng ID BK${String(data.invoice.bookingId).padStart(4, "0")}`,
      );
    },
    onError: () => {
      showError("Thanh toán đã hoàn thành thất bại");
    },
  });

  const mMarkPaymentAsCancelled = useMutation({
    mutationFn: async (paymentId: number) =>
      await PaymentService.updateStatus(paymentId, { status: "FAILED" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bookings", filter] });
      showSuccess("Hủy thanh toán thành công");
    },
    onError: () => {
      showError("Hủy thanh toán thất bại");
    },
  });

  const mCreatePaymentOnline = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: number }) => {
      return PaymentService.createPaymentOnline(paymentId);
    },

    onSuccess: (res: any) => {
      if (res.checkoutURL && res.fields) {
        submitToSePay(res.checkoutURL, res.fields);
        return;
      }
    },

    onError: () => {
      showError("Tạo thanh toán online thất bại");
    },
  });

  const mConfirmCheckIn = useMutation({
    mutationFn: (bookingId: number) =>
      BookingService.updateStatus(bookingId, "CHECKED_IN"),
    onSuccess: (_data, bookingId) => {
      showSuccess("Nhận phòng thành công");
      qc.invalidateQueries({ queryKey: ["admin-bookings", filter] });
      qc.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
    },
    onError: () => {
      showError("Nhận phòng thất bại");
    },
  });

  const mConfirmCheckOut = useMutation({
    mutationFn: (bookingId: number) =>
      BookingService.updateStatus(bookingId, "CHECKED_OUT"),
    onSuccess: (_data, bookingId) => {
      showSuccess("Trả phòng thành công");
      qc.invalidateQueries({ queryKey: ["admin-bookings", filter] });
      qc.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
    },
    onError: () => {
      showError("Trả phòng thất bại");
    },
  });

  const mConfirmCancelled = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: number;
      reason?: string;
    }) => BookingService.updateStatus(bookingId, "CANCELLED", reason),
    onSuccess: (_data, bookingId) => {
      showSuccess("Hủy phòng thành công");
      closeCancelDialog();
      qc.invalidateQueries({ queryKey: ["admin-bookings", filter] });
      qc.invalidateQueries({ queryKey: ["booking-detail", selectedBookingId] });
    },
    onError: () => {
      showError("Hủy phòng thất bại");
    },
  });

  const handleCancelled = async ({
    bookingId,
    reason,
  }: {
    bookingId: number;
    reason: string;
  }) => {
    await mConfirmCancelled.mutateAsync({ bookingId, reason });
  };

  const handleCheckout = async (bookingId: number, remain: number) => {
    if (remain) {
      setBookingViewTab("payment");
      showError("Yêu cầu thanh toán toàn bộ hóa đơn trước khi trả phòng");
      return;
    }
    await mConfirmCheckOut.mutateAsync(bookingId);
  };

  const handleCheckIn = async (bookingId: number, remain: number) => {
    if (remain) {
      setBookingViewTab("payment");
      showError("Yêu cầu thanh toán tiền phòng trước khi nhận phòng");
      return;
    }
    await mConfirmCheckIn.mutateAsync(bookingId);
  };

  const { data: roomTypes = [] } = useQuery({
    queryKey: ["room-types"],
    queryFn: async () => {
      const res = await RoomTypeService.list({ page: 1, limit: 100 });
      return res.items || [];
    },
    staleTime: 30_000,
  });

  const handleChangeBookingForm = (field: keyof BookingForm, value: any) => {
    if (field === "roomTypeId" || field === "checkIn" || field === "checkOut") {
      setPricing(undefined);
    }
    if (field === "roomId" && value === "") {
      setPricing(undefined);
    }
    if (field === "roomId") {
      setSelectedId(value);
    }

    onChangeField(field, value);
  };

  useSocket({
    room: selectedBookingId ? String(selectedBookingId) : undefined,
    event: "room_inspected",
    handler: (data) => {
      if (data.bookingId === selectedBookingId) {
        qc.invalidateQueries({
          queryKey: ["booking-detail", selectedBookingId],
        });
        qc.invalidateQueries({
          queryKey: ["housekeeping-detail", selectedBookingId],
        });
        showSuccess(
          `Phòng BK${selectedBookingId.toString().padStart(4, "0")} đã được kiểm tra xong`,
        );
      }
    },
  });

  const mCreateHousekeepingTask = useMutation({
    mutationFn: async ({
      bookingId,
      roomId,
      type,
    }: {
      bookingId: number;
      roomId: number;
      type: TaskType;
    }) =>
      await HouseKeepingService.create({
        bookingId,
        roomId,
        type,
      }),
    onSuccess: (data) => {
      if (data.staffId) {
        showSuccess("Tạo nhiệm vụ dọn phòng thành công");
      } else {
        showWarning("Không có nhân viên dọn phòng đang trong ca làm!");
      }

      qc.invalidateQueries({
        queryKey: ["booking-detail", selectedBookingId],
      });
      qc.invalidateQueries({
        queryKey: ["housekeeping-detail", selectedBookingId, selectedTaskId],
      });
      qc.invalidateQueries({
        queryKey: [
          "housekeeping-list",
          selectedBookingId,
          filtersHouseKeepingList.limit,
          filtersHouseKeepingList.page,
        ],
      });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Tạo nhiệm vụ buồng phòng thất bại";
      showError(msg);
    },
  });

  const mUpdateInspectionTask = useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: number;
      status: TaskStatus;
      note: string;
    }) => await HouseKeepingService.update(id, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["housekeeping-detail", selectedBookingId, selectedTaskId],
      });
    },
  });

  const handleUpdateTask = async (
    id: number,
    status: TaskStatus,
    note?: string,
  ) => await mUpdateInspectionTask.mutateAsync({ id, status, note });

  const handleCreateTask = async (
    bookingId: number,
    roomId: number,
    type: TaskType,
  ) => await mCreateHousekeepingTask.mutateAsync({ bookingId, roomId, type });

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [filtersHouseKeepingList, setFiltersHouseKeepingList] = useState<{
    page: number;
    limit: number;
  }>({ page: 1, limit: 5 });
  const { data: housekeepingDetail, isLoading: loadingHousekeepingDetail } =
    useQuery({
      queryKey: ["housekeeping-detail", selectedBookingId, selectedTaskId],
      queryFn: async () => await HouseKeepingService.getById(selectedTaskId),
      enabled: !!selectedTaskId,
    });
  const { data: housekeepingListResponse, isLoading: loadingHousekeepingList } =
    useQuery({
      queryKey: [
        "housekeeping-list",
        selectedBookingId,
        filtersHouseKeepingList.limit,
        filtersHouseKeepingList.page,
      ],
      queryFn: async () =>
        await HouseKeepingService.list({
          bookingId: bookingDetail.id,
          page: filtersHouseKeepingList.page,
          limit: filtersHouseKeepingList.limit,
        }),
      enabled: !!bookingDetail?.id,
    });

  const housekeepingList = housekeepingListResponse?.items;
  const metaHousekeepingList = housekeepingListResponse?.meta;
  const onSelectTask = (id: number) => setSelectedTaskId(id);
  const onChangePageHousekeeping = (page: number) =>
    setFiltersHouseKeepingList((pre) => ({ ...pre, page }));

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const openCancelDialog = () => {
    setCancelReason("");
    setCancelOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelOpen(false);
    setCancelReason("");
  };

  const confirmCancel = () => {
    if (!cancelReason.trim()) {
      showError("Vui lòng nhập lý do hủy phòng.");
      return;
    }

    handleCancelled({
      bookingId: Number(selectedBookingId),
      reason: cancelReason.trim(),
    });
  };

  return {
    dialog,
    openDialog,
    closeDialog,
    bookingForm,
    handleChangeBookingForm,
    availableRooms: availableRooms || [],
    nights,
    pricing,
    canCheckRooms,
    canQuote,
    loadingRooms,
    quoting: mQuoteBooking.isPending,
    creating: mCreateBooking.isPending,
    handleApplyPromo,
    handleCreateBooking: onSubmitBookingForm,
    roomTypes,
    bookings,
    loadingBookingList,
    alert,
    closeSnackbar,
    pagination,
    handleSearchBooking,
    handleChangePage,
    selectedBookingId,
    bookingDetail,
    loadingCheckInDetail,
    handleCheckIn,
    handleCheckout,
    handleCancelled,
    showLoadingOverlay: mMarkPaymentAsPaid.isPending,
    onChangePageService,
    services,
    onView,
    filterService,
    onChangeTabService,
    metaServices,
    bookingViewTab,
    onChangeBookingViewTab,
    invoiceDetail,
    loadingInvoiceDetail,
    updateService,
    removeService,
    handleCreateTask,
    handleUpdateTask,
    housekeepingDetail,
    loadingHousekeepingDetail,
    formViewBooking,
    onChangeFormViewBooking,
    onSubmitFormViewBooking,

    openEntityPickerDialog,
    closePickerHandler,
    openPickerHandler,
    onChangePage,
    onSearch,
    selectedId,
    metaAvailabelRooms,
    select,
    filtersAvailableRooms,

    housekeepingList,
    loadingHousekeepingList,
    onSelectTask,
    selectedTaskId,
    onChangePageHousekeeping,
    metaHousekeepingList,

    cancelOpen,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    cancelReason,
    setCancelReason,
  };
}

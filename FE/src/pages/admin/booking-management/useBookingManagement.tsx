import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import BookingService from "@services/BookingService";
import RoomService from "@services/RoomService";
import RoomTypeService from "@services/RoomTypeService";
import { Booking, PaymentMethod, QuoteResponse } from "@constant/types";
import { useLocation, useNavigate } from "react-router-dom";
import useSnackbar from "@hooks/useSnackbar";
import useForm from "@hooks/useForm";
import PaymentService from "@services/PaymentService";

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
  pageSize: 5,
};

type Pricing = Omit<QuoteResponse, "promoApplied">;

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
  const { alert, showError, showSuccess, closeSnackbar } = useSnackbar();

  const [filter, setFilter] = useState<BookingFilter>(defaultBookingFilter);
  const [dialogState, setDialogState] = useState({ open: false });
  const [selectedBookingId, setSelectedBookingId] = useState<number>();

  const openDialog = () => setDialogState({ open: true });

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
        const { bookingId } = await mCreateBooking.mutateAsync(form);
        const { paymentId } = await mCreatePayment.mutateAsync({
          bookingId,
          method: form.paymentMethod,
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
  const [availableRooms, setAvailableRooms] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [paymentMethodCheckIn, setPaymentMethodCheckIn] =
    useState<PaymentMethod>("CASH");
  const [pricing, setPricing] = useState<Pricing>();

  const location = useLocation();
  const navigate = useNavigate();

  const [pendingAction, setPendingAction] = useState<
    "CHECK_IN" | "CHECK_OUT" | "PAYMENT" | null
  >(null);

  useEffect(() => {
    const state = location.state as
      | { bookingId?: number; action?: "CHECK_IN" | "CHECK_OUT" }
      | undefined;
    if (!state?.bookingId) return;

    setSelectedBookingId(state.bookingId);
    setPendingAction(state.action ?? "CHECK_IN");

    navigate(".", { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get("result");
    const paymentId = params.get("paymentId");
    const bookingId = params.get("bookingId");

    if (result === "success") {
      mMarkPaymentAsPaid.mutateAsync(Number(paymentId)).then(() => {
        qc.invalidateQueries({ queryKey: ["admin-bookings"] });
        showSuccess(
          `Thanh toán thành công cho đặt phòng ID BK${String(bookingId).padStart(4, "0")}`,
        );
      });
    } else if (result === "fail") {
      showError("Thanh toán thất bại. Vui lòng thử lại.");
      mMarkPaymentAsCancelled.mutateAsync(Number(paymentId));
    } else if (result === "cancel") {
      showError("Bạn đã hủy thanh toán.");
      mMarkPaymentAsCancelled.mutateAsync(Number(paymentId));
    }

    if (result) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, []);

  const isFullyPaid = (booking: Booking) => booking.paymentStatus === "PAID";

  const openCheckInDialog = (id: number) => setSelectedBookingId(id);
  const closeCheckInDialog = () => setSelectedBookingId(undefined);

  const { data: bookingDetail, isLoading: loadingCheckInDetail } = useQuery({
    queryKey: ["booking-detail", selectedBookingId],
    queryFn: () => BookingService.getById(selectedBookingId!),
    enabled: !!selectedBookingId,
  });

  useEffect(() => {
    if (!bookingDetail || !pendingAction) return;

    const run = async () => {
      if (pendingAction === "CHECK_IN") {
        if (isFullyPaid(bookingDetail)) {
          await mConfirmCheckIn.mutateAsync(bookingDetail.id);
          setSelectedBookingId(undefined);
        } else {
          openCheckInDialog(bookingDetail.id);
        }
      } else {
        await handleCheckout(bookingDetail);
        setSelectedBookingId(undefined);
      }
      setPendingAction(null);
    };

    run();
  }, [bookingDetail, pendingAction]);

  const onChangeCheckInPaymentMethod = (method: PaymentMethod) =>
    setPaymentMethodCheckIn(method);

  // ========== BOOKINGS LIST ==========
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

  // ========== ROOM AVAILABILITY & QUOTE ==========
  const nights = useMemo(() => {
    const start = dayjs(bookingForm.checkIn);
    const end = dayjs(bookingForm.checkOut);
    const diff = end.diff(start, "day");
    return Math.max(1, Number.isFinite(diff) ? diff : 1);
  }, [bookingForm.checkIn, bookingForm.checkOut]);

  const resetForm = () => {
    resetBookingForm();
    setAvailableRooms([]);
    setPricing(undefined);
    setDialogState({ open: false });
  };

  const canCheckRooms =
    !!bookingForm.checkIn &&
    !!bookingForm.checkOut &&
    dayjs(bookingForm.checkOut).isAfter(bookingForm.checkIn);

  const canQuote = !!bookingForm.roomId && canCheckRooms;

  const mGetAvailableRooms = useMutation({
    mutationFn: async () => {
      if (!canCheckRooms) throw new Error("Ngày không hợp lệ");
      const res = await RoomService.getAvailable({
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        roomTypeId: bookingForm.roomTypeId
          ? Number(bookingForm.roomTypeId)
          : undefined,
      });
      return res;
    },
    onSuccess: (res) => setAvailableRooms(res.data),
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể lấy danh sách phòng trống";
      showError(msg);
    },
  });

  const handleCheckAvailableRooms = () => {
    if (!canCheckRooms) {
      showError("Vui lòng chọn ngày nhận trả phòng hợp lệ");
      return;
    }
    mGetAvailableRooms.mutate();
  };

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

  // ========== BOOKING ACTIONS ==========
  const mCreateBooking = useMutation<{ bookingId: number }, any, BookingForm>({
    mutationFn: async (form: BookingForm) => {
      return BookingService.adminCreate({
        roomId: Number(form.roomId),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        promoCode: form.promoCode || undefined,
        fullName: form.fullname?.trim() || "Khách lẻ",
        phone: form.phone?.trim() || "",
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Tạo đặt phòng thất bại, vui lòng thử lại";
      showError(msg);
    },
  });

  const mCreatePayment = useMutation({
    mutationFn: async ({
      bookingId,
      method,
    }: {
      bookingId: number;
      method: PaymentMethod;
    }): Promise<{ paymentId: number }> => {
      return await PaymentService.create(bookingId, method);
    },

    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Tạo thanh toán thất bại";
      showError(msg);
    },
  });

  const mMarkPaymentAsPaid = useMutation({
    mutationFn: async (paymentId: number) => {
      new Promise((resolve) => setTimeout(resolve, 1000));
      return await PaymentService.markAsPaid(paymentId);
    },
    onSuccess: () => {
      showSuccess("Thanh toán thành công");
    },
    onError: () => {
      showError("Thanh toán đã hoàn thành thất bại");
    },
  });

  const mMarkPaymentAsCancelled = useMutation({
    mutationFn: async (paymentId: number) =>
      await PaymentService.cancelPayment(paymentId),
    onSuccess: () => {
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
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
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
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
    },
    onError: () => {
      showError("Trả phòng thất bại");
    },
  });

  const mConfirmCancelled = useMutation({
    mutationFn: (bookingId: number) =>
      BookingService.updateStatus(bookingId, "CANCELLED"),
    onSuccess: (_data, bookingId) => {
      showSuccess("Hủy phòng thành công");
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
    },
    onError: () => {
      showError("Hủy phòng thất bại");
    },
  });

  const handleCancelled = async (booking: Booking) => {
    await mConfirmCancelled.mutateAsync(booking.id);
  };

  const handleCheckout = async (booking: Booking) => {
    await mConfirmCheckOut.mutateAsync(booking.id);
  };

  const handleCheckIn = async (booking: Booking) => {
    if (isFullyPaid(booking)) {
      await mConfirmCheckIn.mutateAsync(booking.id);
      return;
    }
    openCheckInDialog(booking.id);
  };

  const confirmCheckInPayment = async () => {
    if (!bookingDetail) return;

    const { paymentId } = await mCreatePayment.mutateAsync({
      bookingId: bookingDetail.id,
      method: paymentMethodCheckIn,
    });

    // CASH → thanh toán ngay rồi check‑in
    if (paymentMethodCheckIn === "CASH") {
      await mMarkPaymentAsPaid.mutateAsync(paymentId);
      await mConfirmCheckIn.mutateAsync(bookingDetail.id);
      closeCheckInDialog();
      return;
    }

    // ONLINE → chuyển sang trang thanh toán
    await mCreatePaymentOnline.mutateAsync({ paymentId });
    closeCheckInDialog();
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
      setAvailableRooms([]);
    }
    if (field === "roomId" && value === "") {
      setPricing(undefined);
    }
    onChangeField(field, value);
  };

  return {
    dialog: { open: dialogState.open, openDialog, resetForm },
    bookingForm,
    handleChangeBookingForm,
    availableRooms,
    nights,
    pricing,
    canCheckRooms,
    canQuote,
    loadingRooms: mGetAvailableRooms.isPending,
    quoting: mQuoteBooking.isPending,
    creating: mCreateBooking.isPending,
    handleCheckAvailableRooms,
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
    openCheckInDialog,
    closeCheckInDialog,
    selectedBookingId,
    bookingDetail,
    loadingCheckInDetail,
    paymentMethodCheckIn,
    onChangeCheckInPaymentMethod,
    handleCheckIn,
    confirmCheckInPayment,
    handleCheckout,
    handleCancelled,
    showLoadingOverlay: mMarkPaymentAsPaid.isPending,
  };
}

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import BookingService from "@services/BookingService";
import RoomService from "@services/RoomService";
import RoomTypeService from "@services/RoomTypeService";
import { Booking, PaymentMethod } from "@constant/types";
import { useLocation, useNavigate } from "react-router-dom";
import useSnackbar from "@hooks/useSnackbar";

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

export default function useBookingManagement() {
  const qc = useQueryClient();
  const { alert, showError, showSuccess, closeSnackbar } = useSnackbar();

  const [filter, setFilter] = useState<BookingFilter>(defaultBookingFilter);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number>();
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    roomTypeId: "",
    roomId: "",
    checkIn: dayjs().format("YYYY-MM-DD"),
    checkOut: dayjs().add(1, "day").format("YYYY-MM-DD"),
    promoCode: "",
    fullname: "",
    phone: "",
    paymentMethod: "CASH",
  });
  const [availableRooms, setAvailableRooms] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [paymentMethodCheckIn, setPaymentMethodCheckIn] =
    useState<PaymentMethod>("CASH");
  const [pricing, setPricing] = useState<any>();

  const location = useLocation();
  const navigate = useNavigate();

  const [pendingAction, setPendingAction] = useState<
    "CHECK_IN" | "CHECK_OUT" | null
  >(null);

  // ====== HANDLE DEEP LINK CHECK-IN/CHECK-OUT ======
  useEffect(() => {
    const state = location.state as
      | { bookingId?: number; action?: "CHECK_IN" | "CHECK_OUT" }
      | undefined;
    if (!state?.bookingId) return;

    setSelectedBookingId(state.bookingId);
    setPendingAction(state.action ?? "CHECK_IN");

    navigate(".", { replace: true, state: null });
  }, [location.state, navigate]);

  // ====== URL PARAM PAYMENT RESULT (VNPay redirect) ======
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get("result");
    const bookingId = params.get("bookingId");
    const amount = params.get("amount");

    if (result === "success") {
      showSuccess(
        `Thanh toán thành công đơn BK${bookingId} (${Number(
          amount
        ).toLocaleString()}₫)`
      );
    } else if (result === "fail") {
      showError("Thanh toán thất bại. Vui lòng thử lại.");
    }

    // clear query string
    if (result) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location, showError, showSuccess]);

  // ========== CHECK-IN LOGIC ==========
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
    }
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

  const handleChangeBookingForm = (field: keyof BookingForm, value: any) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));

    if (["checkIn", "checkOut", "roomTypeId", "roomId"].includes(field)) {
      setPricing(undefined);
    }
  };

  const resetForm = () => {
    setBookingForm({
      roomTypeId: "",
      roomId: "",
      checkIn: dayjs().format("YYYY-MM-DD"),
      checkOut: dayjs().add(1, "day").format("YYYY-MM-DD"),
      promoCode: "",
      fullname: "",
      phone: "",
      paymentMethod: "CASH",
    });
    setAvailableRooms([]);
    setPricing(undefined);
    setOpenDialog(false);
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
        hotelId: 1,
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
      const res = await BookingService.quote({
        roomId: Number(bookingForm.roomId),
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        promoCode: bookingForm.promoCode || undefined,
      });
      return res;
    },
  });

  // Auto quote khi chọn phòng + ngày (KHÔNG show snackbar ở đây)
  useEffect(() => {
    const shouldQuote =
      bookingForm.roomId &&
      dayjs(bookingForm.checkOut).isAfter(bookingForm.checkIn);

    if (!shouldQuote) return;

    (async () => {
      try {
        const res = await mQuoteBooking.mutateAsync();
        setPricing(res);
      } catch {
        // auto quote lỗi thì bỏ qua, không show snackbar
      }
    })();
  }, [bookingForm.roomId, bookingForm.checkIn, bookingForm.checkOut]);

  // User bấm áp dụng mã khuyến mãi → có snackbar
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
              } thành công, giảm ${res.discount.toLocaleString()}₫`
            );
          } else {
            // Trường hợp backend không báo lỗi nhưng không có giảm
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

  // ========== PAYMENT LOGIC ==========
  const handlePayment = async (
    bookingId: number,
    amount: number,
    method: PaymentMethod
  ) => {
    if (method === "CASH") {
      await BookingService.recordOfflinePayment({
        bookingId,
        method: "CASH",
        status: "PAID",
        amount,
      });

      showSuccess("Thanh toán tiền mặt thành công");

      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking-detail", bookingId] });

      resetForm();
    } else {
      const { vnpayUrl } = await BookingService.createPaymentLink(bookingId);
      window.location.href = vnpayUrl;
    }
  };

  // ========== CREATE BOOKING (ADMIN) ==========
  const mCreateBooking = useMutation({
    mutationFn: async () => {
      return BookingService.adminCreate({
        roomId: Number(bookingForm.roomId),
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        status: "CONFIRMED",
        paymentMethod: bookingForm.paymentMethod,
        promoCode: bookingForm.promoCode || undefined,
        customer: {
          fullName: bookingForm.fullname?.trim() || "Khách lẻ",
          phone: bookingForm.phone?.trim(),
        },
      });
    },
    onSuccess: async (res) => {
      const booking = res.booking;
      const total = res.pricing?.totalAfter ?? booking.totalPrice ?? 0;

      showSuccess(`Tạo đặt phòng thành công (BK${booking.id})`);

      await handlePayment(booking.id, total, bookingForm.paymentMethod);

      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Tạo đặt phòng thất bại, vui lòng thử lại";
      showError(msg);
    },
  });

  const handleCreateBooking = () => {
    if (!canQuote) {
      showError("Vui lòng kiểm tra lại phòng và ngày nhận trả phòng");
      return;
    }
    if (!bookingForm.phone) {
      showError("Vui lòng nhập số điện thoại khách");
      return;
    }
    mCreateBooking.mutate();
  };

  // ========== CHECK-IN PAYMENT ==========
  const mHandleCheckInPayment = useMutation({
    mutationFn: async (booking: Booking) => {
      const total = booking.finalPrice ?? booking.totalPrice ?? 0;
      await handlePayment(booking.id, total, paymentMethodCheckIn);
    },
  });

  // ========== CONFIRM CHECK-IN ==========
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

  // ========== CONFIRM CHECK-OUT ==========
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

  // ========== CONFIRM CANCELLED ==========
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

    await mHandleCheckInPayment.mutateAsync(bookingDetail);
    await mConfirmCheckIn.mutateAsync(bookingDetail.id);

    closeCheckInDialog();
  };

  // ========== ROOM TYPES ==========
  const { data: roomTypes = [] } = useQuery({
    queryKey: ["room-types"],
    queryFn: async () => {
      const res = await RoomTypeService.list({ page: 1, limit: 100 });
      return res.items || [];
    },
    staleTime: 30_000,
  });

  // ========== RETURN ==========
  return {
    dialog: { openDialog, setOpenDialog, resetForm },
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
    handleCreateBooking,
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
    handlePayment,
    handleCheckIn,
    confirmCheckInPayment,
    handleCheckout,
    handleCancelled,
  };
}

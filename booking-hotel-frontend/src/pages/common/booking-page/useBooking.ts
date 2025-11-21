import useSnackbar from "@hooks/useSnackbar";
import RoomTypeService from "@services/RoomTypeService";
import BookingService from "@services/BookingService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BookingForm, FormData, GuestType, SortKey } from "./interface";
import { SearchState } from "@constant/types";
import useForm from "@hooks/useForm";
import useAuth from "@hooks/useAuth";
import { sleep } from "@utils/sleep";

const useBooking = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { state } = useLocation() as { state?: Partial<SearchState> };
  const [searchParams, setSearchParams] = useSearchParams();

  const { alert, showError, closeSnackbar } = useSnackbar();

  // ===== STEP =====
  const rawStep = searchParams.get("step");
  const step = Number(rawStep || "1");

  // ===== ROOM TYPE ĐÃ CHỌN =====
  const [roomTypeSelectedId, setRoomTypeSelectedId] = useState<number | null>(
    null
  );

  // ===== FORM STEP 2: THÔNG TIN BOOKING =====
  const bookingInitForm: BookingForm = {
    fullName: auth.user?.fullName || "",
    phone: auth.user?.phone || "",
    email: auth.user?.email || "",
    guestType: "SELF",
    arrivalTime: "",
  };

  const {
    form: bookingForm,
    errors: bookingErrors,
    onChange: onChangeBookingInput,
    onChangeField: setBookingField,
  } = useForm<BookingForm>(bookingInitForm);

  const onChangeGuestType = (value: GuestType) => {
    setBookingField("guestType", value);
  };

  const onChangeArrivalTime = (value: string) => {
    setBookingField("arrivalTime", value);
  };

  // ===== FORM STEP 1: TÌM PHÒNG (draft) =====
  const initForm: FormData = {
    from: state?.from ?? "",
    to: state?.to ?? "",
    capacity: Number(state?.capacity ?? 1),
    sort: "price-asc",
  };

  // form nhập của user (không ảnh hưởng API)
  const {
    form: formSearch,
    errors,
    onChange: onChangeFormSearch,
    onSubmit: onSubmitSearch,
  } = useForm<FormData>(initForm, undefined, (f) => {
    // Chỉ cập nhật khi nhấn nút LỌC
    setFilters((p) => ({
      ...p,
      from: f.from,
      to: f.to,
      capacity: Number(f.capacity),
      page: 1,
    }));
  });

  // filters chính thức dùng gọi API
  const [filters, setFilters] = useState({
    hotelId: 1,
    page: 1,
    limit: 10,
    q: "",
    from: initForm.from,
    to: initForm.to,
    capacity: initForm.capacity,
    sort: initForm.sort,
  });

  const enabled = useMemo(
    () => Boolean(filters.from && filters.to && filters.capacity >= 1),
    [filters.from, filters.to, filters.capacity]
  );

  // ===== API: LIST ROOM TYPES =====
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["roomTypes.search", filters],
    queryFn: async () => {
      await sleep(1000);
      return RoomTypeService.listGuest({
        hotelId: filters.hotelId,
        page: filters.page,
        limit: filters.limit,
        q: filters.q,
        capacity: filters.capacity,
        checkIn: filters.from,
        checkOut: filters.to,
        sort: filters.sort,
      });
    },
    enabled,
  });

  const rooms = data?.items ?? [];
  const meta = data?.meta;

  // ===== ROOM DETAIL (STEP 2) =====
  const {
    data: room,
    isLoading: loadingRoom,
    isFetching: fetchingRoom,
  } = useQuery({
    queryKey: ["room-detail", roomTypeSelectedId],
    queryFn: async () => {
      await sleep(1000); // fake loading 1s
      return RoomTypeService.getByIdForGuest(Number(roomTypeSelectedId));
    },
    enabled: !!roomTypeSelectedId,
  });

  const handleSort = (s: SortKey) =>
    setFilters((p) => ({ ...p, sort: s, page: 1 }));

  const handleRoomType = (value: string | undefined) =>
    setFilters((p) => ({ ...p, roomType: value, page: 1 }));

  // ===== STEP HELPERS =====
  const goToStep = (nextStep: number) => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("step", String(nextStep));
      return sp;
    });
  };

  const selectRoomType = (roomTypeId: number) => {
    setRoomTypeSelectedId(roomTypeId);
    goToStep(2);
  };

  const backToStep = (step: number) => goToStep(step);

  const onBooking = (id: number) => {
    if (!filters.from || !filters.to) {
      showError("Điền đủ thông tin ngày bắt đầu - ngày kết thúc");
      return;
    }
    selectRoomType(id);
  };

  // ===== QUOTE BOOKING =====
  const canQuote = !!room && !!filters.from && !!filters.to && step === 2;

  const [pricing, setPricing] = useState<any>();

  const mQuoteBooking = useMutation({
    mutationFn: async () => {
      await sleep(1000);
      return BookingService.quote({
        roomId: Number(room!.id),
        checkIn: filters.from,
        checkOut: filters.to,
      });
    },
    onSuccess: (res) => setPricing(res),
  });

  // ===== CREATE BOOKING + PAYMENT LINK =====
  const mCreateBooking = useMutation({
    mutationFn: async () => {
      if (!room) throw new Error("Missing room type");
      await sleep(1000);

      return BookingService.create({
        roomTypeId: room.id,
        fullName: bookingForm.fullName.trim(),
        phone: bookingForm.phone.trim(),
        email: bookingForm.email.trim(),
        guestType: bookingForm.guestType,
        arrivalTime: bookingForm.arrivalTime,
        checkIn: filters.from,
        checkOut: filters.to,
      });
    },
  });

  const mCreatePaymentLink = useMutation({
    mutationFn: async (bookingId: number) => {
      await sleep(1000); // fake loading 1s
      return BookingService.createPaymentLink(bookingId);
    },
  });

  // ===== EFFECTS =====
  useEffect(() => {
    if (canQuote) mQuoteBooking.mutate();
  }, [canQuote]);

  useEffect(() => {
    if (step !== 1 && !roomTypeSelectedId) backToStep(1);
    if (step === 3 && !room) backToStep(1);
  }, [step, roomTypeSelectedId, room]);

  // ===== VALIDATE STEP 2 =====
  const validateBookingForm = () => {
    if (!bookingForm.fullName.trim()) {
      showError("Vui lòng nhập họ tên người đặt phòng");
      return false;
    }
    if (!bookingForm.phone.trim()) {
      showError("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!bookingForm.email.trim()) {
      showError("Vui lòng nhập email");
      return false;
    }
    return true;
  };

  const onMovePayment = async () => {
    if (!room) {
      showError("Vui lòng chọn phòng trước khi tiếp tục thanh toán");
      return;
    }
    if (!validateBookingForm()) return;
    await mQuoteBooking.mutate();
    goToStep(3);
  };

  const onPayment = async () => {
    if (!validateBookingForm() || !room) return;

    try {
      // 1. Tạo booking
      let bookingId: number;
      try {
        const res = await mCreateBooking.mutateAsync();
        bookingId = res.bookingId;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Không thể tạo đơn đặt phòng.";
        showError(`Lỗi khi tạo đơn: ${msg}`);
        return;
      }

      // 2. Tạo link thanh toán
      try {
        const res2 = await mCreatePaymentLink.mutateAsync(bookingId);
        const vnpayUrl = res2.vnpayUrl;
        // 3. Điều hướng
        window.location.href = vnpayUrl;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Không thể tạo link thanh toán.";
        showError(`Lỗi khi tạo link thanh toán: ${msg}`);
        return;
      }
    } catch (err) {
      showError("Đã xảy ra lỗi không xác định.");
    }
  };

  // ===== LOADING STATES =====
  const loadingRooms = isLoading || isFetching;
  const loadingRoomDetail = loadingRoom || fetchingRoom;
  const loadingQuote = mQuoteBooking.isPending;
  const loadingCreateBooking = mCreateBooking.isPending;
  const loadingPaymentLink = mCreatePaymentLink.isPending;

  // ===== RETURN =====
  return {
    // Step
    step,
    goToStep,
    backToStep,

    // Form nhập step 1
    formSearch,
    errors,
    onChangeFormSearch,
    onSubmitSearch,

    // filters chính thức (API dùng)
    filters,

    // list room
    rooms,
    loading: loadingRooms,
    meta,
    sort: filters.sort,
    handleSort,
    handleRoomType,
    setPage: (page: number) => setFilters((p) => ({ ...p, page })),
    setLimit: (limit: number) => setFilters((p) => ({ ...p, limit })),

    // room detail
    roomTypeSelectedId,
    room,
    loadingRoom,
    fetchingRoom,
    pricing,

    // booking form step 2
    bookingForm,
    bookingErrors,
    onChangeBookingInput,
    onChangeGuestType,
    onChangeArrivalTime,

    // snackbar
    alert,
    closeSnackbar,

    // actions
    onBooking,
    onMovePayment,
    onPayment,

    // loading states chi tiết
    loadingRooms,
    loadingRoomDetail,
    loadingQuote,
    loadingCreateBooking,
    loadingPaymentLink,
  };
};

export default useBooking;

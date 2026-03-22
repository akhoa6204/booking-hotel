import useSnackbar from "@hooks/useSnackbar";
import RoomTypeService from "@services/RoomTypeService";
import BookingService from "@services/BookingService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BookingForm, FormData, GuestType, SortKey } from "./interface";
import useForm from "@hooks/useForm";
import useAuth from "@hooks/useAuth";
import RoomService from "@services/RoomService";
const validateForm = (form: BookingForm) => {
  const errors: Partial<Record<keyof BookingForm, string>> = {};

  const fullName = form.fullName?.trim() || "";
  const phone = form.phone?.trim() || "";
  const email = form.email?.trim() || "";
  const checkIn = form.checkIn || "";
  const checkOut = form.checkOut || "";

  if (!fullName) {
    errors.fullName = "Vui lòng nhập họ tên người đặt phòng";
  }

  if (!phone) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^\d{9,11}$/.test(phone)) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  if (!email) {
    errors.email = "Vui lòng nhập email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!form.guestType) {
    errors.guestType = "Vui lòng chọn loại khách";
  }

  if (!checkIn) {
    errors.checkIn = "Vui lòng chọn ngày nhận phòng";
  }

  if (!checkOut) {
    errors.checkOut = "Vui lòng chọn ngày trả phòng";
  }

  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start.getTime())) {
      errors.checkIn = "Ngày nhận phòng không hợp lệ";
    }

    if (isNaN(end.getTime())) {
      errors.checkOut = "Ngày trả phòng không hợp lệ";
    }

    if (!errors.checkIn && !errors.checkOut && start >= end) {
      errors.checkOut = "Ngày trả phòng phải sau ngày nhận phòng";
    }
  }

  return errors;
};
const useBooking = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { state } = useLocation() as {
    state: { roomId: number; checkIn: string; checkOut: string };
  };

  useEffect(() => {
    if (!state?.roomId || !state?.checkIn || !state.checkOut) {
      navigate("/search");
    }
  }, [state?.roomId, state?.checkIn, state?.checkOut]);

  const { alert, showError, closeSnackbar } = useSnackbar();

  const {
    form: bookingForm,
    errors: bookingErrors,
    onChangeField,
    errors,
    onSubmit,
  } = useForm<BookingForm>(
    {
      fullName: auth.user?.fullName || "",
      phone: auth.user?.phone || "",
      email: auth.user?.email || "",
      guestType: "SELF",
      arrivalTime: "",
      checkIn: state?.checkIn,
      checkOut: state?.checkOut,
    },
    validateForm,
    async () => {
      await mCreateBooking.mutateAsync();
    },
  );

  const {
    data: room,
    isLoading: loadingRoom,
    isFetching: fetchingRoom,
  } = useQuery({
    queryKey: ["room-detail", state?.roomId],
    queryFn: async () => {
      return RoomService.getById(Number(state?.roomId));
    },
    enabled: !!state?.roomId,
  });

  const mCreateBooking = useMutation({
    mutationFn: async () => {
      if (!room) throw new Error("Missing room type");

      return BookingService.create({
        roomId: room.id,
        fullName: bookingForm.fullName.trim(),
        phone: bookingForm.phone.trim(),
        email: bookingForm.email.trim(),
        guestType: bookingForm.guestType,
        arrivalTime: bookingForm.arrivalTime,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
      });
    },
    onSuccess: (data) => {
      navigate(`/payment`, {
        state: {
          invoiceId: data.invoiceId,
          bookingId: data.bookingId,
        },
      });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      showError(msg || "Tạo đặt phòng thất bại");
    },
  });

  const [pricing, setPricing] = useState<any>();

  const mQuoteBooking = useMutation({
    mutationFn: async () => {
      return RoomService.quote({
        roomId: Number(room!.id),
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
      });
    },
    onSuccess: (res) => setPricing(res.data),
  });
  useEffect(() => {
    if (!room) return;
    mQuoteBooking.mutateAsync();
  }, [room]);

  const loadingRoomDetail = loadingRoom || fetchingRoom;
  const loadingCreateBooking = mCreateBooking.isPending;
  const loadingQuote = mQuoteBooking.isPending;

  return {
    room,
    loadingRoom,
    fetchingRoom,

    bookingForm,
    bookingErrors,
    onChangeField,
    errors,

    alert,
    closeSnackbar,

    pricing,

    loadingRoomDetail,
    loadingCreateBooking,
    loadingQuote,

    onSubmit,
  };
};

export default useBooking;

import useSnackbar from "@hooks/useSnackbar";
import BookingService from "@services/BookingService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { sleep } from "@utils/sleep";
import InvoiceService from "@services/InvoiceService";
import { diffNights } from "@utils/format";
import { Booking } from "@constant/types";

const useBookingDetail = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { alert, closeSnackbar, showError, showSuccess } = useSnackbar();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking-detail", id],
    queryFn: async () => {
      return BookingService.getByIdCustomer(Number(id));
    },
    enabled: !!id,
  });

  const onBack = () => navigate("/account/bookings");

  const onReview = () =>
    navigate("/account/reviews/create", {
      state: { bookingId: id },
    });

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

  const cancelMutation = useMutation({
    mutationFn: async (payload: { id: number; reason: string }) =>
      BookingService.cancel(payload.id, payload.reason),
    onSuccess: async () => {
      showSuccess("Hủy đặt phòng thành công");
      closeCancelDialog();
      await queryClient.invalidateQueries({ queryKey: ["booking-detail", id] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Hủy đặt phòng thất bại, vui lòng thử lại.";
      showError(msg);
    },
  });

  const confirmCancel = () => {
    if (!cancelReason.trim()) {
      showError("Vui lòng nhập lý do hủy phòng.");
      return;
    }

    cancelMutation.mutate({
      id: booking.id,
      reason: cancelReason.trim(),
    });
  };

  const onReBook = () => {
    navigate("/search", {
      state: {
        roomTypeId: booking.room.roomType.id,
        nights: diffNights(booking.checkIn, booking.checkOut),
      },
    });
  };

  return {
    booking,
    loadingBooking: isLoading,
    onBack,
    onReview,
    alert,
    closeSnackbar,

    onReBook,
    confirmCancel,

    cancelOpen,
    cancelReason,
    setCancelReason,
    openCancelDialog,
    closeCancelDialog,
  };
};

export default useBookingDetail;

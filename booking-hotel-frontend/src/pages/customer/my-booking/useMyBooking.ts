import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BookingService from "@services/BookingService";
import type { Booking } from "@constant/types";
import { useNavigate } from "react-router-dom";
import useSnackbar from "@hooks/useSnackbar";
import { sleep } from "@utils/sleep";

export type BookingTab = "upcoming" | "done" | "cancelled";

const PAGE_SIZE = 5;

const mapTabToStatus = (tab: BookingTab): string | undefined => {
  switch (tab) {
    case "upcoming":
      return "CONFIRMED";
    case "done":
      return "CHECKED_OUT";
    case "cancelled":
      return "CANCELLED";
    default:
      return undefined;
  }
};

const mapTabToHeading = (tab: BookingTab): string => {
  switch (tab) {
    case "upcoming":
      return "Lịch đặt phòng sắp tới";
    case "done":
      return "Phòng đã lưu trú";
    case "cancelled":
      return "Đặt phòng đã huỷ";
    default:
      return "";
  }
};

const useMyBooking = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<BookingTab>("upcoming");
  const [page, setPage] = useState(1);
  const status = mapTabToStatus(tab);

  const { alert, showSuccess, showError, closeSnackbar } = useSnackbar();

  // --- DANH SÁCH BOOKING ---
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["my-bookings", tab, page, PAGE_SIZE],
    queryFn: async () => {
      // fake delay 1s
      await sleep(1000);
      return BookingService.listMy({
        page,
        limit: PAGE_SIZE,
        status,
      });
    },
  });

  const bookings: Booking[] = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const heading = mapTabToHeading(tab);

  const changeTab = (next: BookingTab) => {
    setTab(next);
    setPage(1);
  };

  const onSelectBooking = (id: number) => navigate(`/account/bookings/${id}`);

  // =========================
  // HỦY PHÒNG
  // =========================
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const openCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelReason("");
    setCancelOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelOpen(false);
    setBookingToCancel(null);
    setCancelReason("");
  };

  const cancelMutation = useMutation({
    mutationFn: async (payload: { id: number; reason: string }) =>
      BookingService.cancel(payload.id, payload.reason),
    onSuccess: async () => {
      showSuccess("Hủy đặt phòng thành công");
      closeCancelDialog();
      await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Hủy đặt phòng thất bại, vui lòng thử lại.";
      showError(msg);
    },
  });

  const confirmCancel = () => {
    if (!bookingToCancel) return;
    if (!cancelReason.trim()) {
      showError("Vui lòng nhập lý do hủy phòng.");
      return;
    }

    cancelMutation.mutate({
      id: bookingToCancel.id,
      reason: cancelReason.trim(),
    });
  };

  const onReview = (bookingId: number) =>
    navigate("/account/reviews/create", {
      state: {
        bookingId,
      },
    });

  return {
    // list + tab
    tab,
    changeTab,
    heading,
    bookings,
    page,
    totalPages,
    setPage,
    meta,
    loading: isLoading,
    fetching: isFetching,
    onSelectBooking,
    onReview,

    // cancel dialog
    cancelOpen,
    bookingToCancel,
    cancelReason,
    setCancelReason,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    cancelLoading: cancelMutation.isPending,

    // snackbar
    alert,
    closeSnackbar,
  };
};

export default useMyBooking;

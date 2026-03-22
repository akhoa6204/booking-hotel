import useSnackbar from "@hooks/useSnackbar";
import BookingService from "@services/BookingService";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { sleep } from "@utils/sleep";
import InvoiceService from "@services/InvoiceService";

const useBookingDetail = () => {
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

  return {
    booking,
    loadingBooking: isLoading,
    onBack,
    onReview,
    alert,
    closeSnackbar,
  };
};

export default useBookingDetail;

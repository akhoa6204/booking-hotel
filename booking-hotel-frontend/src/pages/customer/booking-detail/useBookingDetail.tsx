import useSnackbar from "@hooks/useSnackbar";
import BookingService from "@services/BookingService";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { sleep } from "@utils/sleep";

const useBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { alert, closeSnackbar, showError, showSuccess } = useSnackbar();

  // ===== LẤY BOOKING (fake loading 1s) =====
  const {
    data: booking,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["booking-detail", id],
    queryFn: async () => {
      await sleep(1000);
      return BookingService.getById(Number(id));
    },
    enabled: !!id,
  });

  // ===== XỬ LÝ KẾT QUẢ THANH TOÁN =====
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get("result");
    const amount = params.get("amount");

    if (result === "success") {
      showSuccess(
        amount
          ? `Thanh toán thành công (${Number(amount).toLocaleString()}₫)`
          : `Thanh toán thành công`
      );
    }

    if (result === "fail") {
      showError("Thanh toán thất bại. Vui lòng thử lại.");
    }

    if (result) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, showError, showSuccess, navigate, location.pathname]);

  const onBack = () => navigate("/account/bookings");

  const onReview = () =>
    navigate("/account/reviews/create", {
      state: { bookingId: id },
    });

  return {
    booking,
    loading: isLoading,
    fetching: isFetching,
    onBack,
    onReview,
    alert,
    closeSnackbar,
  };
};

export default useBookingDetail;

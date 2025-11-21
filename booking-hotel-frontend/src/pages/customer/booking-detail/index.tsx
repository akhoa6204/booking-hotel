import {
  BookingGuestAndStay,
  BookingGuestAndStaySkeleton,
  BookingHeaderSkeleton,
  GlobalSnackbar,
} from "@components";
import BookingHeader from "../../../components/BookingHeader";
import BookingRoomAndPrice from "./components/BookingRoomAndPrice";
import BookingTimeline from "./components/BookingTimeline";
import useBookingDetail from "./useBookingDetail";
import VacationCountdown from "./components/VacationCountdown";
import BookingTimelineSkeleton from "./components/booking-timeline-skeleton";
import BookingRoomAndPriceSkeleton from "./components/BookingRoomAndPriceSkeleton";

// skeletons

const BookingDetailPage = () => {
  const { booking, loading, onBack, onReview, alert, closeSnackbar } =
    useBookingDetail();

  const isLoading = loading && !booking;

  if (isLoading) {
    return (
      <>
        <BookingHeaderSkeleton />
        <BookingTimelineSkeleton />
        <BookingGuestAndStaySkeleton />
        <BookingRoomAndPriceSkeleton />

        <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
      </>
    );
  }

  if (!booking) return null;

  return (
    <>
      <BookingHeader id={booking.id} status={booking.status} onBack={onBack} />

      {booking.status !== "CONFIRMED" ? (
        <BookingTimeline booking={booking} onReview={onReview} />
      ) : (
        <VacationCountdown checkIn={booking.checkIn} />
      )}

      <BookingGuestAndStay
        title="Chi tiết đặt phòng của bạn"
        booking={booking}
        customer={booking.customer}
      />

      <BookingRoomAndPrice booking={booking} />

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default BookingDetailPage;

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

const BookingDetailPage = () => {
  const { booking, loadingBooking, onBack, onReview, alert, closeSnackbar } =
    useBookingDetail();

  if (loadingBooking)
    return (
      <>
        <BookingHeaderSkeleton />
        <BookingTimelineSkeleton />
        <BookingGuestAndStaySkeleton />
        <BookingRoomAndPriceSkeleton />
      </>
    );
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
      />

      <BookingRoomAndPrice booking={booking} invoice={booking.invoice} />

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default BookingDetailPage;

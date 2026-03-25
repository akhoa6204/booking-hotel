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
import CancelBookingDialog from "./components/CancelBookingDialog";

const BookingDetailPage = () => {
  const {
    booking,
    loadingBooking,
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
  } = useBookingDetail();

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
        <BookingTimeline
          booking={booking}
          onReview={onReview}
          onRebook={onReBook}
        />
      ) : (
        <VacationCountdown
          checkIn={booking.checkIn}
          onCancel={openCancelDialog}
        />
      )}

      <BookingGuestAndStay
        title="Chi tiết đặt phòng của bạn"
        booking={booking}
      />

      <BookingRoomAndPrice booking={booking} invoice={booking.invoice} />

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />

      {cancelOpen && (
        <CancelBookingDialog
          open={cancelOpen}
          onClose={closeCancelDialog}
          onConfirm={confirmCancel}
          reason={cancelReason}
          onChangeReason={setCancelReason}
        />
      )}
    </>
  );
};

export default BookingDetailPage;

import { Box, Stack, Typography, Tabs, Tab } from "@mui/material";
import useMyBooking, { BookingTab } from "./useMyBooking";
import BookingCard from "./components/BookingCard";
import BookingCardSkeleton from "./components/BookingCardSkeleton";
import Pager from "@components/pager";
import CancelBookingDialog from "./components/CancelBookingDialog";
import GlobalSnackbar from "@components/GlobalSnackbar";
import NoBooking from "./components/NoBooking";
import { formatDate } from "@utils/format";

const MyBookingPage = () => {
  const {
    tab,
    changeTab,
    heading,
    bookings,
    page,
    totalPages,
    setPage,
    loading,
    onSelectBooking,
    onReview,

    // cancel
    cancelOpen,
    bookingToCancel,
    cancelReason,
    setCancelReason,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,

    // snackbar
    alert,
    closeSnackbar,
  } = useMyBooking();

  return (
    <>
      {/* Tabs */}
      <Box
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
          bgcolor: "grey.50",
          mb: 3,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => changeTab(v as BookingTab)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 48,
            },
          }}
        >
          <Tab value="upcoming" label="Sắp tới" />
          <Tab value="done" label="Hoàn tất" />
          <Tab value="cancelled" label="Đã huỷ" />
        </Tabs>
      </Box>

      {/* Phần nội dung chính */}
      <Box
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
          p: 2.5,
          bgcolor: "#fff",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          {heading}
        </Typography>

        {loading ? (
          // Loading lần đầu: show 3 skeleton cards
          <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </Stack>
        ) : bookings.length === 0 ? (
          <NoBooking step={tab} />
        ) : (
          <>
            {/* Danh sách booking */}
            <Stack spacing={2}>
              {bookings.map((b) => (
                <BookingCard
                  key={b.id}
                  image={
                    b.room.roomType.images?.[0]?.url ||
                    "/images/placeholder-room.jpg"
                  }
                  roomName={b.room.name}
                  roomType={b.room.roomType.name}
                  fromDate={formatDate(b.checkIn)}
                  toDate={formatDate(b.checkOut)}
                  guests={b.room.roomType.capacity}
                  totalPrice={b.finalPrice ?? b.totalPrice}
                  status={b.status}
                  canReview={b.canReview}
                  onCancel={
                    tab === "upcoming" ? () => openCancelDialog(b) : undefined
                  }
                  onClick={() => onSelectBooking(b.id)}
                  onReview={() => onReview(b.id)}
                />
              ))}
            </Stack>

            {/* Phân trang */}
            {totalPages > 1 && (
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Pager page={page} totalPages={totalPages} onChange={setPage} />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Dialog hủy phòng */}
      {bookingToCancel && (
        <CancelBookingDialog
          open={cancelOpen}
          onClose={closeCancelDialog}
          onConfirm={confirmCancel}
          reason={cancelReason}
          onChangeReason={setCancelReason}
        />
      )}

      {/* Snackbar */}
      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default MyBookingPage;

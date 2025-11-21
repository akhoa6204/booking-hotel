import {
  Box,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import Title from "@components/Title";
import BookingCreateDialog from "./components/BookingCreateDialog";
import CheckInPaymentDialog from "./components/CheckInPaymentDialog";
import BookingCard from "./components/BookingCard";
import { Pager } from "@components";
import useBookingManagement from "./useBookingManagement";
import GlobalSnackbar from "@components/GlobalSnackbar";

export default function BookingManagement() {
  const {
    dialog: { openDialog, setOpenDialog, resetForm },
    bookingForm,
    handleChangeBookingForm,
    availableRooms,
    nights,
    pricing,
    canCheckRooms,
    canQuote,
    loadingRooms,
    quoting,
    creating,
    handleCheckAvailableRooms,
    handleApplyPromo,
    handleCreateBooking,
    roomTypes,
    bookings,
    loadingBookingList,
    alert,
    closeSnackbar,
    pagination,
    handleSearchBooking,
    handleChangePage,
    openCheckInDialog,
    closeCheckInDialog,
    selectedBookingId,
    bookingDetail,
    loadingCheckInDetail,
    paymentMethodCheckIn,
    onChangeCheckInPaymentMethod,
    handleCheckIn,
    confirmCheckInPayment,
    handleCheckout,
    handleCancelled,
  } = useBookingManagement();

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const currentPage = pagination?.page ?? 1;

  return (
    <Box>
      <Title
        title="Quản lý đặt phòng"
        subTitle="Quản lý danh sách đặt phòng và trạng thái khách hàng"
        onAdd={() => setOpenDialog(true)}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo mã đặt phòng, tên khách hàng"
          onChange={handleSearchBooking}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box p={2} borderRadius={2} border="1px solid #ccc" mb={2}>
        <Stack spacing={1.5}>
          {loadingBookingList ? (
            <Typography variant="body2" color="text.secondary">
              Đang tải…
            </Typography>
          ) : bookings.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Không có đặt phòng.
            </Typography>
          ) : (
            <>
              {bookings.map((b) => (
                <BookingCard
                  key={b.id}
                  code={`BK${String(b.id).padStart(4, "0")}`}
                  customer={{
                    name: b.customer?.fullName || "Khách",
                    email: b.customer?.email || undefined,
                    phone: b.customer?.phone || undefined,
                  }}
                  room={{
                    name: b.room?.name || "-",
                    type: b.room?.roomType?.name || "-",
                  }}
                  promotion={b.promotion}
                  checkIn={b.checkIn}
                  checkOut={b.checkOut}
                  total={Number(b.finalPrice) || 0}
                  status={b.status}
                  paymentStatus={b.paymentStatus}
                  onCheckIn={() => handleCheckIn(b)}
                  onCancel={() => handleCancelled(b)}
                  onCheckOut={() => handleCheckout(b)}
                />
              ))}

              {totalPages > 1 && (
                <Box mt={1.5} display="flex" justifyContent="center">
                  <Pager
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={handleChangePage}
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              )}
            </>
          )}
        </Stack>
      </Box>

      {/* Dialog tạo booking */}
      <BookingCreateDialog
        open={openDialog}
        onClose={resetForm}
        values={bookingForm}
        onChange={handleChangeBookingForm}
        roomTypes={roomTypes}
        rooms={availableRooms}
        nights={nights}
        pricing={pricing}
        loadingRooms={loadingRooms}
        quoting={quoting}
        submitting={creating}
        onCheckRooms={handleCheckAvailableRooms}
        onApplyPromo={handleApplyPromo}
        onSubmit={handleCreateBooking}
      />

      {/* Dialog thanh toán khi check-in */}
      {selectedBookingId && !loadingCheckInDetail ? (
        <CheckInPaymentDialog
          open={!!selectedBookingId}
          onClose={closeCheckInDialog}
          loading={loadingCheckInDetail}
          booking={bookingDetail!}
          paymentMethod={paymentMethodCheckIn}
          onPaymentMethodChange={onChangeCheckInPaymentMethod}
          onConfirm={confirmCheckInPayment}
        />
      ) : null}

      {/* Snackbar thông báo */}
      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </Box>
  );
}

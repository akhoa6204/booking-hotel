import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import SearchBar from "./components/search-bar";
import useBooking from "./useBooking";
import SearchResultsHeader from "./components/result-header";
import { MatchNotFound } from "@assets/images";
import BookingStepper from "./components/BookingStepper";
import GlobalSnackbar from "@components/GlobalSnackbar";
import BookingInfoCard from "./components/BookingInfoCard";
import ArrivalTimeCard from "./components/ArrivalTimeCard";
import RulesCard from "./components/RulesCard";
import RoomCard from "./components/RoomCard";
import BookingDetailCard from "./components/BookingDetailCard";
import PriceSummaryCard from "./components/PriceSummaryCard";
import { ArrowForward } from "@mui/icons-material";
import DepositNoticeCard from "./components/DepositNoticeCard";
import PaymentSummaryCard from "./components/PaymentSummaryCard";
import BookingSummaryCard from "./components/BookingSummaryCard";

// Skeleton components
import RoomCardSkeleton from "./components/RoomCardSkeleton";
import PriceSummarySkeleton from "./components/PriceSummarySkeleton";
import PaymentSummarySkeleton from "./components/PaymentSummarySkeleton";
import BookingSummaryCardSkeleton from "./components/BookingSummaryCardSkeleton";
import {
  RoomCardSkeleton as RoomCardSkeletonGlobal,
  RoomCard as RoomCardGlobal,
} from "@components";

const BookingPage = () => {
  const {
    step,

    // step 1 – form nhập & filters chính thức
    formSearch,
    onChangeFormSearch,
    onSubmitSearch,
    filters,

    rooms,
    loading, // = loadingRooms (list phòng)
    meta,
    sort,
    handleSort,
    onBooking,

    // step 2 – 3
    room,
    pricing,
    bookingForm,
    onChangeBookingInput,
    onChangeGuestType,
    onChangeArrivalTime,

    // snackbar
    alert,
    closeSnackbar,

    // actions
    onMovePayment,
    onPayment,

    // loading chi tiết
    loadingRoomDetail,
    loadingQuote,
    loadingCreateBooking,
    loadingPaymentLink,
  } = useBooking();

  const numericStep = Number(step) || 1;
  const totalRooms = meta?.total ?? 0;
  const fallbackImg =
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop";

  // tách riêng
  const loadingRoomPanel = loadingRoomDetail; // detail phòng
  const loadingPricing = loadingQuote; // quote / pricing

  // Overlay loading khi bấm "Tiến hành thanh toán"
  const showGlobalOverlay = loadingCreateBooking || loadingPaymentLink;

  const renderStep = () => {
    // ----------------------- STEP 1 -----------------------
    if (numericStep === 1) {
      return (
        <>
          <Stack
            sx={{
              bgcolor: "rgba(36,171,112,0.05)",
              py: "44px",
              justifyContent: "center",
            }}
          >
            <SearchBar
              form={formSearch}
              onChange={onChangeFormSearch}
              onSubmit={onSubmitSearch}
            />
          </Stack>

          <Container>
            {loading ? (
              <>
                {/* Skeleton cho header kết quả */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  py={2.5}
                >
                  <Skeleton
                    variant="text"
                    width={200}
                    height={32}
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={160}
                    height={40}
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>

                <Skeleton variant="rectangular" height={2} sx={{ mb: 4.5 }} />

                {/* Skeleton list phòng */}
                <Grid container spacing={3}>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                      <RoomCardSkeletonGlobal />
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : rooms.length > 0 ? (
              <>
                <SearchResultsHeader
                  total={totalRooms}
                  sort={sort}
                  onSortChange={handleSort}
                />
                <Grid container spacing={3} mb={2.5}>
                  {rooms.map((room) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                      <RoomCardGlobal
                        id={room.id}
                        name={room.name}
                        type={room.name || "Hạng phòng"}
                        price={Number(room.basePrice)}
                        capacity={room.capacity}
                        image={room.image || fallbackImg}
                        onBooking={() => onBooking(room.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Stack
                sx={{ height: 620, py: 2.5 }}
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  component="img"
                  src={MatchNotFound}
                  alt="Không tìm thấy"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    mx: "auto",
                    mb: 4.5,
                  }}
                />
                <Typography
                  color="textPrimary"
                  fontSize={32}
                  fontWeight={600}
                  mb={1}
                  textAlign="center"
                >
                  Không tìm thấy kết quả
                </Typography>
                <Typography color="textSecondary" textAlign="center">
                  Thử thay đổi ngày nhận phòng, trả phòng hoặc số lượng khách.
                </Typography>
              </Stack>
            )}
          </Container>
        </>
      );
    }

    // ----------------------- STEP 2 -----------------------
    if (numericStep === 2) {
      return (
        <Container sx={{ mt: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                <BookingInfoCard
                  value={bookingForm}
                  onChange={onChangeBookingInput}
                  onChangeGuestType={onChangeGuestType}
                />

                <ArrivalTimeCard
                  value={bookingForm.arrivalTime}
                  onChange={onChangeArrivalTime}
                  checkInDate={filters.from}
                />

                <RulesCard />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2.5}>
                {/* ROOM DETAIL: chỉ phụ thuộc loadingRoomPanel */}
                {loadingRoomPanel ? (
                  <>
                    <RoomCardSkeleton />
                  </>
                ) : (
                  room && (
                    <RoomCard
                      name={room.name}
                      image={room.images?.[0]?.url}
                      capacity={room.capacity}
                    />
                  )
                )}
                <BookingDetailCard
                  checkIn={filters.from}
                  checkOut={filters.to}
                  guests={filters.capacity}
                />
                {/* PRICING: chỉ phụ thuộc loadingPricing */}
                {loadingPricing ? (
                  <>
                    <PriceSummarySkeleton />
                    <Skeleton
                      variant="rectangular"
                      height={48}
                      sx={{ borderRadius: 1.5 }}
                    />
                  </>
                ) : (
                  <>
                    <PriceSummaryCard
                      originalPrice={pricing?.totalBefore ?? 0}
                      discount={pricing?.discount ?? 0}
                    />

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: 1.5,
                      }}
                      onClick={onMovePayment}
                      disabled={!pricing}
                    >
                      <Typography>Tiếp theo thanh toán</Typography>
                      <ArrowForward />
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      );
    }

    // ----------------------- STEP 3 -----------------------
    if (numericStep === 3 && room) {
      return (
        <Container sx={{ mt: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              {/* BÊN TRÁI: chỉ PaymentSummary phụ thuộc quote */}
              <DepositNoticeCard />
              {loadingPricing ? (
                <PaymentSummarySkeleton />
              ) : (
                <Stack spacing={2.5}>
                  <PaymentSummaryCard total={pricing?.totalAfter ?? 0} />
                </Stack>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              {/* BÊN PHẢI: BookingSummary luôn render được (không phụ thuộc quote) */}
              <Stack spacing={2.5}>
                {loadingRoomPanel ? (
                  <BookingSummaryCardSkeleton />
                ) : (
                  <BookingSummaryCard
                    roomName={room.name}
                    checkIn={filters.from}
                    checkOut={filters.to}
                    capacity={room.capacity}
                    guestName={bookingForm.fullName}
                    guestPhone={bookingForm.phone}
                    guestEmail={bookingForm.email}
                  />
                )}
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ borderRadius: 1.5 }}
                  onClick={onPayment}
                  disabled={showGlobalOverlay || loadingPricing}
                >
                  <Typography>Tiến hành thanh toán</Typography>
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      );
    }

    return null;
  };

  return (
    <>
      <Container>
        <BookingStepper activeStep={numericStep} />
      </Container>

      {renderStep()}

      {/* GLOBAL OVERLAY khi tạo booking + tạo payment link */}
      {showGlobalOverlay && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: (theme) => theme.zIndex.modal + 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: "#fff" }} />
            <Typography color="#fff" fontWeight={500}>
              Đang xử lý thanh toán, vui lòng chờ...
            </Typography>
          </Stack>
        </Box>
      )}

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default BookingPage;

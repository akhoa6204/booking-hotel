import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import useBooking from "./useBooking";

import BookingInfoCard from "./components/BookingInfoCard";
import ArrivalTimeCard from "./components/ArrivalTimeCard";
import RulesCard from "./components/RulesCard";
import RoomCard from "./components/RoomCard";
import BookingDetailCard from "./components/BookingDetailCard";
import PriceSummaryCard from "./components/PriceSummaryCard";
import { ArrowForward } from "@mui/icons-material";

import RoomCardSkeleton from "./components/RoomCardSkeleton";
import PriceSummarySkeleton from "./components/PriceSummarySkeleton";
import { BookingStepper, GlobalSnackbar, Loading } from "@components";

const BookingPage = () => {
  const {
    room,
    bookingForm,
    onChangeField,
    errors,

    alert,
    closeSnackbar,

    pricing,

    loadingRoomDetail,
    loadingCreateBooking,
    loadingQuote,

    onSubmit,
  } = useBooking();

  return (
    <>
      <Container>
        <BookingStepper activeStep={2} />
      </Container>

      <Container sx={{ mt: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <BookingInfoCard
                value={bookingForm}
                onChange={onChangeField}
                errors={errors}
              />

              <ArrivalTimeCard
                value={bookingForm.arrivalTime}
                onChange={onChangeField}
                checkInDate={""}
              />

              <RulesCard />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2.5}>
              {loadingRoomDetail ? (
                <>
                  <RoomCardSkeleton />
                </>
              ) : (
                room && (
                  <RoomCard
                    name={room.roomType.name}
                    image={room.roomType.images?.[0]?.url}
                    capacity={room.roomType.capacity}
                  />
                )
              )}
              <BookingDetailCard
                checkIn={bookingForm.checkIn}
                checkOut={bookingForm.checkOut}
                guests={room?.roomType.capacity}
              />
              {loadingQuote ? (
                <>
                  <PriceSummarySkeleton />
                  <Skeleton
                    variant="rectangular"
                    height={48}
                    sx={{ borderRadius: 1.5 }}
                  />
                </>
              ) : (
                <Box component={"form"} onSubmit={onSubmit}>
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
                    type="submit"
                    disabled={!pricing}
                  >
                    <Typography>Tiếp theo thanh toán</Typography>
                    <ArrowForward />
                  </Button>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {loadingCreateBooking && <Loading content="Đang tạo đặt phòng..." />}

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default BookingPage;

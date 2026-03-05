import Title from "@components/Title";
import StatCard from "./components/StatCard";
import { Box, Grid, Paper, Typography } from "@mui/material";
import PagedSection from "./components/PagedSection";
import BookingItemCard from "./components/BookingItemCard";
import useFrontDesk from "./useFrontDesk";

const FrontDesk = () => {
  const {
    summary,
    loadingSummary,
    checkins,
    loadingCheckins,
    checkinsMeta,
    handleChangeCheckinPage,
    checkouts,
    loadingCheckouts,
    checkoutsMeta,
    handleChangeCheckoutPage,
    handleCheckin,
    handleCheckout,
  } = useFrontDesk();

  return (
    <>
      <Box sx={{ mb: 2.5 }}>
        <Title
          title="Hoạt động lễ tân hôm nay"
          subTitle="Quản lý check-in, check-out và khách lưu trú"
        />

        <Grid container spacing={3.25} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <StatCard
              label="Booking hôm nay"
              value={summary?.todayBookings ?? 0}
              delta={summary?.bookingsDeltaPct}
              deltaText="so với hôm qua"
              loading={loadingSummary}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <StatCard
              label="Phòng còn trống"
              value={`${summary?.availableRooms ?? 0}/${
                summary?.totalRooms ?? 0
              }`}
              delta={summary?.availableRoomsDelta}
              deltaText="so với hôm qua"
              suffix=""
              loading={loadingSummary}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <StatCard
              label="Phòng đang được dọn"
              value={`${summary?.totalCleanRooms ?? 0}/${
                summary?.totalRooms ?? 0
              }`}
              loading={loadingSummary}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3.25} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <PagedSection
              title="Check-in hôm nay"
              items={checkins}
              meta={checkinsMeta}
              loading={loadingCheckins}
              emptyText="Hôm nay chưa có khách check-in."
              onChangePage={handleChangeCheckinPage}
              renderItem={(b) => (
                <BookingItemCard
                  booking={b}
                  handleOnClick={
                    b.status === "CONFIRMED"
                      ? () => handleCheckin(b.id)
                      : undefined
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <PagedSection
              title="Check-out hôm nay"
              items={checkouts}
              meta={checkoutsMeta}
              loading={loadingCheckouts}
              emptyText="Hôm nay chưa có khách check-out."
              onChangePage={handleChangeCheckoutPage}
              renderItem={(b) => (
                <BookingItemCard
                  booking={b}
                  handleOnClick={
                    b.status === "CHECKED_IN"
                      ? () => handleCheckout(b.id)
                      : undefined
                  }
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default FrontDesk;

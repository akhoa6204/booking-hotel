import Title from "@components/Title";
import StatCard from "./components/StatCard";
import { Box, Grid, Paper, Typography } from "@mui/material";
import useDashboard from "./useDashboard";
import PagedSection from "./components/PagedSection";
import BookingItemCard from "./components/BookingItemCard";
import MonthlyRevenueChart from "./components/MonthlyRevenueChart";
import MonthlyBookingStatsCard from "./components/MonthlyBookingStatsCard";
import TopCustomersList from "./components/TopCustomersList";

const Dashboard = () => {
  const {
    summary,
    loadingSummary,
    monthlyKpis,
    loadingMonthlyKpis,
    monthlyRevenue,
    loadingMonthlyRevenue,
    monthlyBookingStats,
    loadingMonthlyBookingStats,
    topCustomers,
    loadingTopCustomers,
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
  } = useDashboard();

  return (
    <>
      <Box sx={{ mb: 2.5 }}>
        <Title title="Dashboard" subTitle="Tổng quan hoạt động khách sạn" />

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
              suffix="" // delta là số phòng
              loading={loadingSummary}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <StatCard
              label="Doanh thu tuần này"
              value={summary?.weekRevenue ?? 0}
              delta={summary?.weekRevenueDeltaPct}
              deltaText="so với tuần trước"
              isMoney
              loading={loadingSummary}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <StatCard
              label="Khách hàng mới"
              value={summary?.newCustomers ?? 0}
              delta={summary?.newCustomersDelta}
              deltaText="so với tuần trước"
              suffix="%"
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

      {/* Báo cáo & doanh thu theo THÁNG */}
      <Box>
        <Title
          title="Báo cáo và doanh thu"
          subTitle="Thống kê và phân tích doanh thu"
        />

        <Grid container spacing={3.25} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <StatCard
              label="Tổng doanh thu"
              value={monthlyKpis?.totalRevenue ?? 0}
              delta={monthlyKpis?.totalRevenueDeltaPct ?? null}
              deltaText="so với tháng trước"
              isMoney
              loading={loadingMonthlyKpis}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <StatCard
              label="Tỉ lệ lấp đầy"
              value={`${monthlyKpis?.occupancyPct ?? 0}%`}
              delta={monthlyKpis?.occupancyDeltaPct ?? null}
              deltaText="so với tháng trước"
              suffix="%"
              loading={loadingMonthlyKpis}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }} alignItems={"stretch"}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
              <Typography sx={{ px: 2, pt: 2, fontWeight: 600, fontSize: 20 }}>
                Doanh thu theo tháng
              </Typography>
              <MonthlyRevenueChart data={monthlyRevenue} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MonthlyBookingStatsCard
              data={monthlyBookingStats}
              loading={loadingMonthlyBookingStats}
            />
          </Grid>
        </Grid>

        <TopCustomersList data={topCustomers} loading={loadingTopCustomers} />
      </Box>
    </>
  );
};

export default Dashboard;

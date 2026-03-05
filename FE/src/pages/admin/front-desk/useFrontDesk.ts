import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardService from "@services/DashboardService";
import {
  Booking,
  DashboardSummary,
  MonthlyKpis,
  MonthlyRevenue,
  TopCustomers,
} from "@constant/types";
import { PaginatedResponse } from "@constant/response/paginated";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;
const REVENUE_MONTHS = 6;

type PageParams = { page: number; limit: number };

const SUMMARY_QK = ["dashboard", "summary"] as const;
const MONTHLY_KPIS_QK = ["dashboard", "monthly-kpis"] as const;
const MONTHLY_REVENUE_QK = (m: number) =>
  ["dashboard", "monthly-revenue", m] as const;
const CHECKINS_QK = (p: PageParams) =>
  ["dashboard", "checkins", p.page, p.limit] as const;
const CHECKOUTS_QK = (p: PageParams) =>
  ["dashboard", "checkouts", p.page, p.limit] as const;
const MONTHLY_BOOKING_STATS_QK = [
  "dashboard",
  "monthly-booking-stats",
] as const;

const useFrontDesk = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // phân trang
  const [checkinPage, setCheckinPage] = useState<number>(1);
  const [checkoutPage, setCheckoutPage] = useState<number>(1);

  const checkinsParams: PageParams = { page: checkinPage, limit: PAGE_SIZE };
  const checkoutsParams: PageParams = { page: checkoutPage, limit: PAGE_SIZE };

  // 1) Summary
  const { data: summary, isLoading: loadingSummary } =
    useQuery<DashboardSummary>({
      queryKey: SUMMARY_QK,
      queryFn: DashboardService.getSummary,
      staleTime: 30_000,
      retry: 1,
    });

  console.log("summary:", summary);

  // 4) Check-ins
  const { data: checkinsRes, isLoading: loadingCheckins } = useQuery<
    PaginatedResponse<Booking>
  >({
    queryKey: CHECKINS_QK(checkinsParams),
    queryFn: () => DashboardService.getCheckins(checkinsParams),
    staleTime: 15_000,
    retry: 1,
  });
  const checkins = checkinsRes?.items ?? [];
  const checkinsMeta = checkinsRes?.meta;

  // 5) Check-outs
  const { data: checkoutsRes, isLoading: loadingCheckouts } = useQuery<
    PaginatedResponse<Booking>
  >({
    queryKey: CHECKOUTS_QK(checkoutsParams),
    queryFn: () => DashboardService.getCheckouts(checkoutsParams),
    staleTime: 15_000,
    retry: 1,
  });
  const checkouts = checkoutsRes?.items ?? [];
  const checkoutsMeta = checkoutsRes?.meta;

  // handlers
  const handleChangeCheckinPage = (page: number) => setCheckinPage(page);
  const handleChangeCheckoutPage = (page: number) => setCheckoutPage(page);

  const handleCheckin = (id: number) => {
    navigate("/manager/bookings", {
      state: { bookingId: id, action: "CHECK_IN" },
    });
  };
  const handleCheckout = (id: number) => {
    navigate("/manager/bookings", {
      state: { bookingId: id, action: "CHECK_OUT" },
    });
  };

  return {
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
  };
};

export default useFrontDesk;

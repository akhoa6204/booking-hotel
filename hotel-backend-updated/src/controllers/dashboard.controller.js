import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { success, bad } from "../utils/response.js";
import { parsePageLimit, buildOffsetMeta } from "../utils/pagination.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

const VN_TZ = "Asia/Ho_Chi_Minh";

const todayRange = () => {
  const s = dayjs().tz(VN_TZ).startOf("day");
  const e = s.add(1, "day");
  return { start: s.toDate(), end: e.toDate() };
};

const yesterdayRange = () => {
  const e = dayjs().tz(VN_TZ).startOf("day");
  const s = e.subtract(1, "day");
  return { start: s.toDate(), end: e.toDate() };
};

const thisWeekStart = () => dayjs().tz(VN_TZ).startOf("week").toDate();

const lastWeekRange = () => {
  const thisStart = dayjs().tz(VN_TZ).startOf("week");
  const lastStart = thisStart.subtract(1, "week");
  return { start: lastStart.toDate(), end: thisStart.toDate() };
};

function monthRangeVN(d = dayjs().tz(VN_TZ)) {
  const y = d.year();
  const m = d.month();
  const start = new Date(y, m, 1, 0, 0, 0, 0);
  const end = new Date(y, m + 1, 1, 0, 0, 0, 0);
  return { start, end };
}

function lastMonthRangeVN() {
  return monthRangeVN(dayjs().tz(VN_TZ).subtract(1, "month"));
}

// Số “đêm” overlap giữa [aStart,aEnd) và [bStart,bEnd)
function overlapNights(aStart, aEnd, bStart, bEnd) {
  const s = Math.max(+aStart, +bStart);
  const e = Math.min(+aEnd, +bEnd);
  if (e <= s) return 0;
  const MS = 24 * 60 * 60 * 1000;
  return Math.ceil((e - s) / MS);
}

// --- 1. Tổng quan + Delta ---
export async function getDashboardSummary(req, res) {
  try {
    const hotelId = 1;
    const { start, end } = todayRange();
    const { start: yStart, end: yEnd } = yesterdayRange();

    const weekStart = thisWeekStart();
    const { start: lastWeekStart, end: lastWeekEnd } = lastWeekRange();

    // ---- PROMISES HÔM NAY ----
    const todayBookingsPromise = prisma.booking.count({
      where: {
        room: { hotelId },
        checkIn: { gte: start, lt: end },
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
      },
    });

    const totalRoomsPromise = prisma.room.count({ where: { hotelId } });

    const busyRoomsTodayPromise = prisma.booking.findMany({
      where: {
        room: { hotelId },
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { gte: start, lt: end },
      },
      select: { roomId: true },
      distinct: ["roomId"],
    });

    const weekRevenuePromise = prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: weekStart } },
      _sum: { amount: true },
    });

    const newCustomersTodayPromise = prisma.customer.count({
      where: { createdAt: { gte: new Date(yEnd), lt: new Date(end) } },
    });

    // ---- PROMISES HÔM QUA / TUẦN TRƯỚC ----
    const yesterdayBookingsPromise = prisma.booking.count({
      where: {
        room: { hotelId },
        checkIn: { gte: yStart, lt: yEnd },
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
      },
    });

    const busyRoomsYesterdayPromise = prisma.booking.findMany({
      where: {
        room: { hotelId },
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { gte: yStart, lt: yEnd },
      },
      select: { roomId: true },
      distinct: ["roomId"],
    });

    const lastWeekRevenuePromise = prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: lastWeekStart, lt: lastWeekEnd },
      },
      _sum: { amount: true },
    });

    const newCustomersYesterdayPromise = prisma.customer.count({
      where: { createdAt: { gte: new Date(yStart), lt: new Date(yEnd) } },
    });

    const [
      todayBookings,
      totalRooms,
      busyRoomsToday,
      weekRevenue,
      newCustomersToday,
      yesterdayBookings,
      busyRoomsYesterday,
      lastWeekRevenue,
      newCustomersYesterday,
    ] = await Promise.all([
      todayBookingsPromise,
      totalRoomsPromise,
      busyRoomsTodayPromise,
      weekRevenuePromise,
      newCustomersTodayPromise,
      yesterdayBookingsPromise,
      busyRoomsYesterdayPromise,
      lastWeekRevenuePromise,
      newCustomersYesterdayPromise,
    ]);

    const busyToday = busyRoomsToday.length;
    const availableRooms = Math.max(0, totalRooms - busyToday);
    const occupancyPct =
      totalRooms > 0 ? Math.round((busyToday / totalRooms) * 100) : 0;

    const weekRevenueNow = Number(weekRevenue._sum.amount || 0);

    const busyYesterday = busyRoomsYesterday.length;
    const availableYesterday = Math.max(0, totalRooms - busyYesterday);
    const occupancyYesterdayPct =
      totalRooms > 0 ? Math.round((busyYesterday / totalRooms) * 100) : 0;

    const weekRevenuePrev = Number(lastWeekRevenue._sum.amount || 0);

    const pct = (cur, prev) =>
      prev > 0
        ? Number(((cur - prev) / prev) * 100).toFixed(2)
        : cur > 0
        ? 100
        : 0;

    const bookingsDeltaPct = pct(todayBookings, yesterdayBookings);
    const occupancyDeltaPct = Number(
      (occupancyPct - occupancyYesterdayPct).toFixed(2)
    );
    const availableRoomsDelta = availableRooms - availableYesterday;
    const weekRevenueDeltaPct = pct(weekRevenueNow, weekRevenuePrev);
    const newCustomersDelta = newCustomersToday - newCustomersYesterday;

    return success(res, {
      todayBookings,
      availableRooms,
      totalRooms,
      occupancyPct,
      weekRevenue: weekRevenueNow,
      newCustomers: newCustomersToday,
      bookingsDeltaPct,
      occupancyDeltaPct,
      availableRoomsDelta,
      weekRevenueDeltaPct,
      newCustomersDelta,
    });
  } catch (e) {
    console.error(e);
    return bad(res, e.message || "Internal server error", 500);
  }
}

// --- 2. Danh sách Check-in hôm nay ---
export async function getDashboardCheckins(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req);
    const { start, end } = todayRange();
    const hotelId = 1;

    const where = {
      checkIn: { gte: start, lt: end },
      status: { notIn: ["CANCELLED"] },
      room: { hotelId },
    };

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          room: {
            include: { roomType: true },
          },
          customer: true,
        },
        orderBy: { checkIn: "asc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return success(res, {
      items,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

// --- 3. Danh sách Check-out hôm nay ---
export async function getDashboardCheckouts(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req);
    const { start, end } = todayRange();
    const hotelId = 1;

    const where = {
      checkOut: { gte: start, lt: end },
      status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
      room: { hotelId },
    };

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          room: {
            include: { roomType: true },
          },
          customer: true,
        },
        orderBy: { checkOut: "asc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return success(res, {
      items,
      meta: buildOffsetMeta({ page, limit, total }),
    });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

// GET /api/dashboard/monthly-kpis
export async function getMonthlyKpis(req, res) {
  try {
    const hotelId = 1;

    const { start, end } = monthRangeVN();
    const { start: pStart, end: pEnd } = lastMonthRangeVN();

    const [curAgg, prevAgg] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: start, lt: end },
          booking: { room: { hotelId } },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: pStart, lt: pEnd },
          booking: { room: { hotelId } },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(curAgg._sum.amount ?? 0);
    const prevTotalRevenue = Number(prevAgg._sum.amount ?? 0);

    const totalRooms = await prisma.room.count({ where: { hotelId } });

    const daysInMonth = dayjs(end)
      .tz(VN_TZ)
      .diff(dayjs(start).tz(VN_TZ), "day");
    const totalRoomNights = totalRooms * daysInMonth;

    const bookingWhereFor = (a, b) => ({
      room: { hotelId },
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
      AND: [{ checkIn: { lt: b } }, { checkOut: { gt: a } }],
    });

    const [curBookings, prevBookings] = await Promise.all([
      prisma.booking.findMany({
        where: bookingWhereFor(start, end),
        select: { checkIn: true, checkOut: true },
      }),
      prisma.booking.findMany({
        where: bookingWhereFor(pStart, pEnd),
        select: { checkIn: true, checkOut: true },
      }),
    ]);

    const curOccNights = curBookings.reduce(
      (sum, b) => sum + overlapNights(start, end, b.checkIn, b.checkOut),
      0
    );
    const prevOccNights = prevBookings.reduce(
      (sum, b) => sum + overlapNights(pStart, pEnd, b.checkIn, b.checkOut),
      0
    );

    const occupancyPct =
      totalRoomNights > 0
        ? Math.round((curOccNights / totalRoomNights) * 100)
        : 0;

    const prevTotalRoomNights =
      totalRooms * dayjs(pEnd).tz(VN_TZ).diff(dayjs(pStart).tz(VN_TZ), "day");
    const prevOccupancyPct =
      prevTotalRoomNights > 0
        ? Math.round((prevOccNights / prevTotalRoomNights) * 100)
        : 0;

    const pctDelta = (cur, prev) =>
      prev > 0 ? Number(((cur - prev) / prev) * 100).toFixed(2) : null;

    return success(res, {
      totalRevenue,
      totalRevenueDeltaPct: pctDelta(totalRevenue, prevTotalRevenue),
      occupancyPct,
      occupancyDeltaPct: pctDelta(occupancyPct, prevOccupancyPct),
    });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

export async function getMonthlyRevenue(req, res) {
  try {
    const hotelId = 1;
    const n = Math.max(1, Math.min(24, Number(req.query.months) || 6));

    const months = Array.from({ length: n }, (_, i) =>
      dayjs()
        .tz(VN_TZ)
        .startOf("month")
        .subtract(n - 1 - i, "month")
    );

    const results = await Promise.all(
      months.map(async (m) => {
        const { start, end } = monthRangeVN(m);
        const agg = await prisma.payment.aggregate({
          where: {
            status: "PAID",
            paidAt: { gte: start, lt: end },
            booking: { room: { hotelId } },
          },
          _sum: { amount: true },
        });
        return {
          month: m.format("YYYY-MM"),
          label: `T${m.month() + 1}`,
          revenue: Number(agg._sum.amount || 0),
        };
      })
    );

    return success(res, { months: results });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

// GET /api/dashboard/monthly-booking-stats?month=YYYY-MM
export async function getMonthlyBookingStats(req, res) {
  try {
    const hotelId = 1;

    const monthParam = req.query.month;
    const base = monthParam ? dayjs.tz(monthParam, VN_TZ) : dayjs().tz(VN_TZ);
    const { start, end } = monthRangeVN(base);

    const whereBase = {
      room: { hotelId },
      checkIn: { gte: start, lt: end },
    };

    const successStatuses = ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"];

    const [total, successCount, cancelledCount] = await Promise.all([
      prisma.booking.count({ where: whereBase }),
      prisma.booking.count({
        where: { ...whereBase, status: { in: successStatuses } },
      }),
      prisma.booking.count({
        where: { ...whereBase, status: "CANCELLED" },
      }),
    ]);

    const cancelRate =
      total > 0 ? Math.round((cancelledCount / total) * 100) : 0;

    return success(res, {
      month: base.format("YYYY-MM"),
      total,
      success: successCount,
      cancelled: cancelledCount,
      cancelRate,
    });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

// GET /api/dashboard/top-customers
export async function getTopCustomers(req, res) {
  try {
    const hotelId = 1;
    const limit = 5;

    const base = req.query.month
      ? dayjs.tz(req.query.month, VN_TZ)
      : dayjs().tz(VN_TZ);
    const { start, end } = monthRangeVN(base);

    const bookings = await prisma.booking.findMany({
      where: {
        room: { hotelId },
        status: { not: "CANCELLED" },
        checkIn: { gte: start, lt: end },
      },
      select: {
        customerId: true,
        customer: { select: { fullName: true } },
        payments: {
          where: { status: "PAID", paidAt: { gte: start, lt: end } },
          select: { amount: true },
        },
      },
    });

    const map = new Map();

    for (const b of bookings) {
      const paid = b.payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );
      if (!map.has(b.customerId)) {
        map.set(b.customerId, {
          name: b.customer?.fullName || "Khách lẻ",
          bookings: 0,
          totalPaid: 0,
        });
      }
      const agg = map.get(b.customerId);
      agg.bookings++;
      agg.totalPaid += paid;
    }

    const items = Array.from(map.values())
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, limit)
      .map((c, i) => ({
        rank: i + 1,
        name: c.name,
        bookings: c.bookings,
        totalPaid: c.totalPaid,
      }));

    return success(res, { month: base.format("YYYY-MM"), items });
  } catch (e) {
    return bad(res, e.message || "Internal server error", 500);
  }
}

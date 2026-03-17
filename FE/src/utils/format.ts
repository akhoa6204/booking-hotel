import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/vi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.locale("vi");

export const fmtVND = (n: number | string) =>
  Number(n ?? 0).toLocaleString("vi-VN");

export const formatMoneyShort = (value: number): string => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return value.toString();
};

export const formatDate = (
  iso?: string,
  options?: { withTime?: boolean; withWeekday?: boolean }
) => {
  if (!iso) return "";

  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const { withTime = false, withWeekday = false } = options || {};

  const baseOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  if (withWeekday) {
    baseOptions.weekday = "short";
  }

  if (withTime) {
    return d.toLocaleString("vi-VN", {
      ...baseOptions,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return d.toLocaleDateString("vi-VN", baseOptions);
};

export const diffNights = (from?: string, to?: string) => {
  if (!from || !to) return 0;
  const a = new Date(from);
  const b = new Date(to);
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
};

export const formatTime = (iso?: string) => {
  if (!iso) return "";
  return dayjs(iso).utc().format("HH:mm");
};

export const formatDateInput = (iso?: string) => {
  if (!iso) return "";
  return dayjs(iso).format("YYYY-MM-DD");
};

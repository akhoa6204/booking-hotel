import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

export function getWeekRangeVN(dateInput) {
  const date = dayjs(dateInput).tz(VN_TZ);

  const monday = date.startOf("week").add(1, "day");
  const start = monday.startOf("day");
  const end = monday.add(6, "day").endOf("day");

  return {
    weekStart: start.toDate(),
    weekEnd: end.toDate(),
  };
}

export const DAY = 24 * 60 * 60 * 1000;
export const toDate = (date) => new Date(date);
export const computeNight = (startDate, endDate) =>
  Math.max(1, Math.ceil((endDate - startDate) / DAY));

import dayjs from "dayjs";

export function buildDefaultSearchParams(capacity?: number) {
  const from = dayjs().startOf("day");
  const to = from.add(1, "day");

  return {
    from: from.format("YYYY-MM-DD"),
    to: to.format("YYYY-MM-DD"),
    capacity: Number(capacity) > 0 ? Number(capacity) : 2,
  };
}

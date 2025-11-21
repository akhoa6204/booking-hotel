export const fmtVND = (n: number | string) =>
  Number(n ?? 0).toLocaleString("vi-VN");

export const fmtDate = (iso: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN");
};

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

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const diffNights = (from?: string, to?: string) => {
  if (!from || !to) return 0;
  const a = new Date(from);
  const b = new Date(to);
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
};

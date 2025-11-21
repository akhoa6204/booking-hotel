import {
  BookingStatus,
  PaymentStatus,
  PromoScope,
  PromoType,
} from "@constant/types";
import { Circle } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Stack,
  Box,
  Typography,
  Chip,
  Button,
  Grid,
} from "@mui/material";
import { fmtVND } from "@utils/format";
import dayjs from "dayjs";

type BookingCardProps = {
  code: string;
  customer: { name: string; email?: string; phone?: string };
  room: { name: string; type: string };
  checkIn: string;
  checkOut: string;
  total: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  onCheckIn: () => void;
  onCancel: () => void;
  onCheckOut: () => void;
  promotion?: {
    id: number;
    code?: string | null;
    description?: string | null;
    scope: PromoScope;
    discountType: PromoType;
    value: number;
  };
};

const nightsBetween = (a: string, b: string) =>
  Math.max(1, dayjs(b).diff(dayjs(a), "day"));

const StatusChip = ({ status }: { status: BookingCardProps["status"] }) => {
  const map: Record<
    string,
    {
      label: string;
      color: "default" | "primary" | "warning" | "error" | "info";
    }
  > = {
    PENDING: { label: "Chờ xác nhận", color: "warning" },
    CONFIRMED: { label: "Đã xác nhận", color: "primary" },
    CANCELLED: { label: "Đã hủy", color: "error" },
    CHECKED_IN: { label: "Đang ở", color: "info" },
    CHECKED_OUT: { label: "Đã trả phòng", color: "default" },
  };
  const s = map[status] || map.PENDING;
  return (
    <Chip size="small" label={s.label} color={s.color} variant="outlined" />
  );
};

const PayChip = ({ ps }: { ps: BookingCardProps["paymentStatus"] }) => {
  const map: Record<
    string,
    { label: string; color: "default" | "primary" | "warning" }
  > = {
    UNPAID: { label: "Chưa thanh toán", color: "warning" },
    PARTIAL: { label: "Đã cọc", color: "warning" },
    PAID: { label: "Đã thanh toán", color: "primary" },
  };
  const s = map[ps] || map.UNPAID;
  return (
    <Chip size="small" label={s.label} color={s.color} variant="outlined" />
  );
};

export default function BookingCard({
  code,
  customer,
  room,
  checkIn,
  checkOut,
  total,
  status,
  paymentStatus,
  promotion,
  onCheckIn,
  onCancel,
  onCheckOut,
}: BookingCardProps) {
  const nights = nightsBetween(checkIn, checkOut);

  const renderActionButton = () => {
    const now = dayjs();
    const checkInTime = dayjs(checkIn).hour(14).minute(0).second(0); // 14:00
    const checkOutTime = dayjs(checkOut).hour(12).minute(0).second(0); // 12:00

    const inWindow = !now.isBefore(checkInTime) && now.isBefore(checkOutTime); // [14:00, 12:00)
    const beforeCheckIn = now.isBefore(checkInTime);
    const afterCheckOut = !now.isBefore(checkOutTime); // now >= 12:00

    if (status === "CONFIRMED" && inWindow) {
      return (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={onCheckIn}
        >
          Check-in
        </Button>
      );
    }

    if (status === "CONFIRMED" && beforeCheckIn) {
      return (
        <Button
          size="small"
          variant="outlined"
          disabled
          sx={{
            color: "#888",
            borderColor: "#ccc",
            bgcolor: "#f5f5f5",
            "&.Mui-disabled": {
              color: "#aaa",
              borderColor: "#ddd",
              bgcolor: "#fafafa",
            },
          }}
        >
          Chưa đến giờ
        </Button>
      );
    }

    if (status === "CONFIRMED" && afterCheckOut) {
      return (
        <Button size="small" variant="outlined" color="error" disabled>
          Quá hạn
        </Button>
      );
    }

    if (status === "CHECKED_IN") {
      return (
        <Button
          size="small"
          variant="outlined"
          color="warning"
          onClick={onCheckOut}
        >
          Check-out
        </Button>
      );
    }

    if (status === "CHECKED_OUT") {
      return (
        <Button
          size="small"
          variant="outlined"
          color="success"
          sx={{ pointerEvents: "none" }} // khóa click nhưng giữ màu
        >
          Hoàn tất
        </Button>
      );
    }

    if (status === "CANCELLED") {
      return (
        <Button
          size="small"
          variant="outlined"
          color="error"
          sx={{ pointerEvents: "none" }}
        >
          Đã hủy phòng
        </Button>
      );
    }

    return null;
  };

  const renderCancelButton = () => {
    const now = dayjs();
    const checkInTime = dayjs(checkIn).hour(14).minute(0).second(0);

    // Cho hủy nếu CONFIRMED và trước 14:00 ngày check-in
    const canCancel = status === "CONFIRMED" && now.isBefore(checkInTime);
    const disabled =
      !canCancel || ["CANCELLED", "CHECKED_OUT", "CHECKED_IN"].includes(status);

    if (disabled) return null;
    return (
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        onClick={onCancel}
      >
        Hủy
      </Button>
    );
  };
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
          <Typography variant="h6" fontWeight={700}>
            {code}
          </Typography>
          <StatusChip status={status} />
          <PayChip ps={paymentStatus} />
        </Stack>
        <Grid container spacing={2}>
          <Grid size={5}>
            <Box flex={1}>
              <Typography fontWeight={700}>{customer.name}</Typography>
              {customer.email && (
                <Typography variant="body2" color="text.secondary">
                  Email: {customer.email}
                </Typography>
              )}
              {customer.phone && (
                <Typography variant="body2" color="text.secondary">
                  SDT: {customer.phone}
                </Typography>
              )}

              <Typography mt={1.5} fontWeight={700} color="primary">
                Tổng: {fmtVND(total)} VND ({nights} đêm)
              </Typography>
            </Box>
          </Grid>
          <Grid size={5}>
            <Box>
              <Typography>
                Phòng: {room.name} - {room.type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check-in: {dayjs(checkIn).format("DD/M/YYYY")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check-out: {dayjs(checkOut).format("DD/M/YYYY")}
              </Typography>
              {promotion ? (
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Mã giảm giá: {promotion.code}
                </Typography>
              ) : null}
            </Box>
          </Grid>
          <Grid size={2}>
            <Stack spacing={1}>
              {renderActionButton()}
              {renderCancelButton()}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

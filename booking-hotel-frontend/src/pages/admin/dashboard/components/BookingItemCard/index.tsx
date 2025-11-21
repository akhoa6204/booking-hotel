// BookingItemCard.tsx
import { Box, Stack, Typography, Chip } from "@mui/material";
import { Booking, BookingStatus } from "@constant/types";

const STATUS_UI: Record<
  BookingStatus,
  { label: string; color: string; border: string; bg: string }
> = {
  PENDING: {
    label: "Đang chờ xác nhận",
    color: "#9E9E9E",
    border: "#BDBDBD",
    bg: "#F5F5F5",
  },
  CONFIRMED: {
    label: "Check-in",
    color: "#24AB70",
    border: "#24AB70",
    bg: "rgba(36, 171, 112, 0.1)",
  },
  CHECKED_IN: {
    label: "Đã nhận phòng",
    color: "#ED6C02",
    border: "#ED6C02",
    bg: "rgba(237, 108, 2, 0.1)",
  },
  CHECKED_OUT: {
    label: "Đã trả phòng",
    color: "#2E7D32",
    border: "#2E7D32",
    bg: "rgba(46, 125, 50, 0.1)",
  },
  CANCELLED: {
    label: "Đã hủy phòng",
    color: "#D32F2F",
    border: "#D32F2F",
    bg: "rgba(211, 47, 47, 0.1)",
  },
};

export default function BookingItemCard({
  booking,
  handleOnClick,
}: {
  booking: Booking;
  handleOnClick?: () => void;
}) {
  const ui = STATUS_UI[booking.status];

  return (
    <Box
      sx={{
        border: "1px solid #24AB70",
        borderRadius: 2.5,
        p: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography fontWeight={600}>
            {booking.customer?.fullName ?? "Khách"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phòng {booking.room?.name} — {booking.room?.roomType?.name ?? "-"}
          </Typography>
        </Box>

        <Chip
          label={ui.label}
          size="small"
          sx={{
            fontWeight: 600,
            color: ui.color,
            borderColor: ui.border,
            borderWidth: 1.5,
            borderStyle: "solid",
            backgroundColor: ui.bg,
          }}
          onClick={handleOnClick}
        />
      </Stack>
    </Box>
  );
}

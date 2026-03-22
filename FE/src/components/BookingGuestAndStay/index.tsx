import { Box, Divider, Stack, Typography } from "@mui/material";
import type { Booking } from "@constant/types";
import EastIcon from "@mui/icons-material/East";
import { diffNights, formatDate } from "@utils/format";

export const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

type Props = {
  title: string;
  booking: Booking;
};

const BookingGuestAndStay = ({ title, booking }: Props) => {
  const nights = diffNights(booking.checkIn, booking.checkOut);

  return (
    <Box
      sx={{
        mb: 1.5,
        bgcolor: "white",
      }}
    >
      <Typography variant="h6" fontWeight={600} px={2.5} py={2}>
        {title}
      </Typography>
      <Divider />

      <Stack direction="row" spacing={3} px={2.5} py={2}>
        {/* Guest info */}
        <Box sx={{ minWidth: 260 }}>
          <Typography fontWeight={600} mb={1}>
            {booking.fullName}
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">
              📞 {booking.phone || "Chưa có số điện thoại"}
            </Typography>
            <Typography variant="body2">
              ✉️ {booking.email || "Chưa có email"}
            </Typography>
          </Stack>
        </Box>
        <Divider orientation="vertical" flexItem />
        {/* Stay info card */}
        <Box
          sx={{
            flex: 1,
            borderRadius: 2,
            bgcolor: "#F5F8F7",
            p: 2.5,
            width: "100%",
          }}
        >
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Nhận phòng
              </Typography>
              <Typography fontWeight={600}>
                {formatDate(booking.checkIn)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime("2025-01-01T14:00:00")}
              </Typography>
            </Box>

            <Stack alignItems="center" justifyContent="center" spacing={0.5}>
              <Typography variant="body2">{nights} đêm</Typography>
              <EastIcon sx={{ fontSize: 24, color: "text.primary" }} />
            </Stack>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Trả phòng
              </Typography>
              <Typography fontWeight={600}>
                {formatDate(booking.checkOut)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime("2025-01-01T12:00:00")}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default BookingGuestAndStay;

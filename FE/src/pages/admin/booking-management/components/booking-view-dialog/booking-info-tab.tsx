import { Booking, Invoice } from "@constant/types";
import { Typography, Grid, Box } from "@mui/material";

type Props = {
  booking: Booking;
};

const getLabelStatus = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  CHECKED_IN: "Đang ở",
  CHECKED_OUT: "Đã trả phòng",
};

export default function BookingInfoTab({ booking }: Props) {
  return (
    <Box minHeight={400}>
      <Grid container spacing={2}>
        <Grid size={6}>
          <Typography variant="body2">Khách</Typography>
          <Typography fontWeight={600}>{booking.fullName}</Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Điện thoại</Typography>
          <Typography fontWeight={600}>{booking.phone}</Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Phòng</Typography>
          <Typography fontWeight={600}>
            {booking.room.name} - {booking.room.roomType.name}
          </Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Trạng thái</Typography>
          <Typography fontWeight={600}>
            {getLabelStatus[booking.status]}
          </Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Check-in</Typography>
          <Typography fontWeight={600}>
            {new Date(booking.checkIn).toLocaleDateString()}
          </Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Check-out</Typography>
          <Typography fontWeight={600}>
            {new Date(booking.checkOut).toLocaleDateString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

import { Box, Divider, Stack, Typography } from "@mui/material";
import { CalendarMonthRounded, Person } from "@mui/icons-material";
import type { Booking } from "@constant/types";
import { formatDate } from "@utils/format";

type Props = {
  booking: Booking;
};

const BookingRoomAndPrice = ({ booking }: Props) => {
  const primaryImage =
    booking.room.roomType.images?.find((i) => i.isPrimary)?.url ??
    booking.room.roomType.images?.[0]?.url ??
    "/images/placeholder-room.jpg";

  const remaining =
    Number(booking.finalPrice) - Number(booking.amountPaid || 0);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        p: 3,
        bgcolor: "white",
      }}
    >
      <Stack direction="row" spacing={3} mb={3}>
        <Box
          component="img"
          src={primaryImage}
          sx={{
            width: 260,
            height: 180,
            borderRadius: 2,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />

        <Stack sx={{ flex: 1 }} spacing={1} justifyContent={"space-between"}>
          <Box flex={1}>
            <Typography fontWeight={600} fontSize={18}>
              Phòng {booking.room.name}
            </Typography>
            <Typography color="text.secondary" mb={1}>
              {booking.room.roomType.name}
            </Typography>

            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthRounded
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Person fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {booking.room.roomType.capacity} khách
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <Box textAlign="right" minWidth={200}>
            <Typography variant="body2" color="text.secondary">
              Tổng giá
            </Typography>
            <Typography fontSize={22} fontWeight={700} color="primary">
              {Number(booking.finalPrice).toLocaleString("vi-VN")} VND
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Tổng tiền</Typography>
          <Typography>
            {Number(booking.totalPrice).toLocaleString("vi-VN")} VND
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography>Khuyến mãi</Typography>
          <Typography color="success.main">
            -{Number(booking.discountAmount || 0).toLocaleString("vi-VN")} VND
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography>Đã thanh toán</Typography>
          <Typography>
            {Number(booking.amountPaid || 0).toLocaleString("vi-VN")} VND
          </Typography>
        </Stack>
        {booking.status === "CONFIRMED" && (
          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography fontWeight={600}>
              Trả phần còn lại khi check-in
            </Typography>
            <Typography fontWeight={700}>
              {remaining > 0
                ? remaining.toLocaleString("vi-VN") + " VND"
                : "0 VND"}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default BookingRoomAndPrice;

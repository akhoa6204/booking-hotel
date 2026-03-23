import { Box, Button, Stack, Typography } from "@mui/material";
import { CalendarMonthRounded, LocationOnRounded } from "@mui/icons-material";
import { Booking, BookingStatus } from "@constant/types";
import { fmtVND, formatDate } from "@utils/format";

type BookingCardProps = {
  booking: Booking;
  onCancel?: () => void;
  onClick?: () => void;
  onReview?: () => void;
};

const BookingCard = ({
  booking,
  onCancel,
  onClick,
  onReview,
}: BookingCardProps) => {
  const handleCardClick = () => {
    onClick?.();
  };

  const renderActionButton = () => {
    switch (booking.status) {
      case "PENDING":
      case "CONFIRMED":
        if (!onCancel) return null;
        return (
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              py: 0.5,
              px: 2,
              borderRadius: 1,
              bgcolor: "error.main",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            Hủy phòng
          </Button>
        );

      case "CHECKED_OUT":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              sx={{ textTransform: "none", py: 0.5, px: 2, borderRadius: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                console.log("Re-book");
              }}
            >
              Đặt lại
            </Button>

            {booking.canReview && (
              <Button
                variant="contained"
                sx={{ textTransform: "none", py: 0.5, px: 2, borderRadius: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onReview?.();
                }}
              >
                Đánh giá
              </Button>
            )}
          </Stack>
        );

      case "CANCELLED":
        return (
          <Button
            variant="outlined"
            sx={{ textTransform: "none", py: 0.5, px: 2, borderRadius: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Re-book");
            }}
          >
            Đặt lại
          </Button>
        );

      case "CHECKED_IN":
      default:
        return null;
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e5e5e5",
        bgcolor: "#F5F8F7",
        alignItems: "stretch",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={handleCardClick}
    >
      <Box
        component="img"
        src={booking.room.roomType.images[0]?.url}
        sx={{
          width: 220,
          height: 150,
          flexShrink: 0,
          borderRadius: 2,
          objectFit: "cover",
        }}
      />

      <Box sx={{ flex: 1, display: "flex" }}>
        <Stack
          spacing={2.5}
          justifyContent="space-between"
          sx={{ flex: 1, height: "100%" }}
        >
          <Box>
            <Typography fontSize={20} fontWeight={600}>
              Phòng {booking.room.name}
            </Typography>

            <Typography color="text.secondary" mb={1.5}>
              {booking.room.roomType.name}
            </Typography>

            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthRounded
                  fontSize="small"
                  sx={{ color: "#657672" }}
                />
                <Typography color="text.secondary">
                  {formatDate(booking.checkIn, { withWeekday: true })} -{" "}
                  {formatDate(booking.checkOut, { withWeekday: true })}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnRounded fontSize="small" sx={{ color: "#657672" }} />
                <Typography color="text.secondary">
                  {booking.room.roomType.capacity ?? "-"} khách
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography fontSize={14} color="text.secondary">
                Tổng giá
              </Typography>
              <Stack direction={"row"} spacing={1}>
                <Typography
                  fontSize={16}
                  fontWeight={700}
                  sx={{ color: "#ccc", textDecoration: "line-through" }}
                >
                  {fmtVND(booking.invoice.subtotal)} VND
                </Typography>
                <Typography fontSize={16} fontWeight={700}>
                  -
                </Typography>
                <Typography fontSize={16} fontWeight={700} color="primary">
                  {fmtVND(
                    Number(booking.invoice.subtotal) -
                      Number(booking.invoice.discount) +
                      Number(booking.invoice.tax),
                  )}{" "}
                  VND
                </Typography>
              </Stack>
            </Box>

            {renderActionButton()}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default BookingCard;

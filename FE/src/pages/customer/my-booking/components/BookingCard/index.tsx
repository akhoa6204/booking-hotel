import { Box, Button, Stack, Typography } from "@mui/material";
import { CalendarMonthRounded, LocationOnRounded } from "@mui/icons-material";
import { BookingStatus } from "@constant/types";

type BookingCardProps = {
  image: string;
  roomName: string;
  roomType: string;
  fromDate: string;
  toDate: string;
  guests: number;
  status: BookingStatus;
  totalPrice: number;
  canReview: boolean;
  onCancel?: () => void;
  onClick?: () => void;
  onReview?: () => void;
};

const BookingCard = ({
  image,
  roomName,
  roomType,
  fromDate,
  toDate,
  guests,
  totalPrice,
  status,
  canReview,
  onCancel,
  onClick,
  onReview,
}: BookingCardProps) => {
  const handleCardClick = () => {
    onClick?.();
  };

  const renderActionButton = () => {
    switch (status) {
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

            {canReview && (
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
        src={image}
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
              Phòng {roomName}
            </Typography>

            <Typography color="text.secondary" mb={1.5}>
              {roomType}
            </Typography>

            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthRounded
                  fontSize="small"
                  sx={{ color: "#657672" }}
                />
                <Typography color="text.secondary">
                  {fromDate} - {toDate}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnRounded fontSize="small" sx={{ color: "#657672" }} />
                <Typography color="text.secondary">
                  {guests ?? "-"} khách
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
              <Typography fontSize={22} fontWeight={700} color="primary">
                {Number(totalPrice).toLocaleString("vi-VN")} VND
              </Typography>
            </Box>

            {renderActionButton()}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default BookingCard;

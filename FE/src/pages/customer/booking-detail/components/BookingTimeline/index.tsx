import {
  StarBorderRounded,
  HotelRounded,
  LoginRounded,
  LogoutRounded,
  CheckCircleOutline,
  Cancel,
  CancelOutlined,
  Close,
} from "@mui/icons-material";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import type { Booking } from "@constant/types";

type Props = {
  booking: Booking;
  onRebook?: () => void;
  onReview?: () => void;
};

const BookingTimeline = ({ booking, onRebook, onReview }: Props) => {
  const canRebook =
    booking.status === "CHECKED_OUT" || booking.status === "CANCELLED";
  const canReview = booking.canReview;

  const steps =
    booking.status !== "CANCELLED"
      ? [
          {
            label: "Phòng đã đặt",
            icon: <HotelRounded />,
            active: true,
          },
          {
            label: "Đã check-in",
            icon: <LoginRounded />,
            active:
              booking.status === "CHECKED_IN" ||
              booking.status === "CHECKED_OUT",
          },
          {
            label: "Đã check-out",
            icon: <LogoutRounded />,
            active: booking.status === "CHECKED_OUT",
          },
          {
            label: "Đánh giá",
            icon: <StarBorderRounded />,

            active: booking.status === "CHECKED_OUT" && !booking.canReview,
          },
        ]
      : [
          {
            label: "Phòng đã đặt",
            icon: <HotelRounded />,
            active: false,
          },
          {
            label: "Hủy đặt phòng",
            icon: <Close />,

            active: false,
          },
        ];

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        mb: 1.5,
        bgcolor: "white",
      }}
    >
      {/* timeline */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={3}
        px={5}
        py={4}
      >
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <Stack
              key={step.label}
              direction="row"
              alignItems="center"
              sx={{ flex: isLast ? "0 auto" : 1 }}
              spacing={2}
            >
              <Stack alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: step.active ? "#24AB70" : "grey.200",
                    color: step.active ? "#fff" : "grey.600",
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  variant="body2"
                  color={step.active ? "primary" : "text.secondary"}
                >
                  {step.label}
                </Typography>
              </Stack>

              {!isLast && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    bgcolor: step.active ? "success.main" : "grey.300",
                  }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>
      <Divider />
      {/* nút action */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        px={2.5}
        py={2}
      >
        {canReview && (
          <Button
            variant="outlined"
            startIcon={<CheckCircleOutline />}
            onClick={onReview}
            sx={{ textTransform: "none", py: 0.5, px: 2, borderRadius: 1 }}
          >
            Đánh giá
          </Button>
        )}

        {canRebook && (
          <Button
            variant="contained"
            onClick={onRebook}
            sx={{ textTransform: "none", py: 0.5, px: 2, borderRadius: 1 }}
          >
            Đặt lại
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default BookingTimeline;

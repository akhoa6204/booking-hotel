import { Box, Chip, Stack, Typography } from "@mui/material";

type BookingStepperProps = {
  activeStep: number;
};

const steps = ["Bạn chọn", "Đặt phòng", "Thanh toán"];

const BookingStepper = ({ activeStep = 1 }: BookingStepperProps) => {
  return (
    <Box py={4.5}>
      <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === activeStep;
          const isCompleted = stepNumber < activeStep;
          const isLast = index === steps.length - 1;

          return (
            <Stack
              key={label}
              direction="row"
              alignItems="center"
              sx={{ flex: isLast ? "0 auto" : 1 }} 
            >
              {/* circle + label */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={stepNumber}
                  size="small"
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    fontWeight: 600,
                    "& .MuiChip-label": { p: 0, lineHeight: "28px" },
                    ...(isActive || isCompleted
                      ? {
                          bgcolor: "#24AB70",
                          color: "white",
                          border: "none",
                        }
                      : {
                          bgcolor: "transparent",
                          color: "#24AB70",
                          border: "1px solid #24AB70",
                        }),
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive ? 600 : 500,
                    color:
                      isActive || isCompleted
                        ? "text.primary"
                        : "text.secondary",
                  }}
                >
                  {label}
                </Typography>
              </Stack>

              {/* line bên phải, chỉ vẽ nếu không phải step cuối */}
              {!isLast && (
                <Box
                  sx={{
                    flex: 1,
                    ml: 2,
                    height: 2,
                    borderRadius: 999,
                    bgcolor: isCompleted ? "#24AB70" : "grey.300",
                  }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

export default BookingStepper;

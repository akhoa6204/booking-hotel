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
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems="center"
              >
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
                          bgcolor: "#2E90FA",
                          color: "white",
                          border: "none",
                        }
                      : {
                          bgcolor: "transparent",
                          color: "#2E90FA",
                          border: "1px solid #2E90FA",
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

              {!isLast && (
                <Box
                  sx={{
                    flex: 1,
                    ml: 2,
                    height: 2,
                    borderRadius: 999,
                    bgcolor: isCompleted ? "#2E90FA" : "grey.300",
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

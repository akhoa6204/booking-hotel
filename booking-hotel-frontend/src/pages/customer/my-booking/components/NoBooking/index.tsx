import { NoBookingImg } from "@assets/images";
import { Box, Stack, Typography } from "@mui/material";

const NoBooking = ({ step }: { step: string }) => {
  const messages: Record<string, string> = {
    upcoming: "Bạn chưa có lịch đặt phòng sắp tới",
    done: "Bạn chưa có lịch sử đặt phòng",
    cancelled: "Bạn chưa có phòng đã hủy",
  };

  const title = messages[step] || "Bạn chưa có dữ liệu";

  return (
    <Box sx={{ backgroundColor: "#F5F8F7", py: 7 }}>
      <Stack alignItems="center">
        <Box
          component="img"
          src={NoBookingImg}
          sx={{ width: 140, objectFit: "cover", mb: 1 }}
        />
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">
          Khám phá, đặt phòng và tận hưởng chuyến đi theo cách của bạn.
        </Typography>
      </Stack>
    </Box>
  );
};

export default NoBooking;

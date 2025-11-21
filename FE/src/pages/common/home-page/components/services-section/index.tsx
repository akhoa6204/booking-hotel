import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import LocalParkingRoundedIcon from "@mui/icons-material/LocalParkingRounded";
import FreeBreakfastRoundedIcon from "@mui/icons-material/FreeBreakfastRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";
import PoolRoundedIcon from "@mui/icons-material/PoolRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

type Service = { title: string; icon: React.ReactNode };

const services: Service[] = [
  {
    title: "Không gian làm việc",
    icon: <ComputerRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Bãi đỗ xe tiện ích",
    icon: <LocalParkingRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Bữa sáng miễn phí",
    icon: <FreeBreakfastRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Wifi tốc độ cao",
    icon: <WifiRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Điện nước miễn phí",
    icon: <FlashOnRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Hồ bơi ngoài trời",
    icon: <PoolRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Phòng tập thể dục",
    icon: <FitnessCenterRoundedIcon fontSize="large" color="primary" />,
  },
  {
    title: "Các dịch vụ khác",
    icon: <MoreHorizRoundedIcon fontSize="large" color="primary" />,
  },
];

const ServicesSection = () => {
  return (
    <Box mb={"100px"}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography
            sx={{ fontWeight: 600, mb: "20px", fontSize: 40 }}
            color="text.primary"
          >
            Skyline cung cấp dịch vụ bạn cần
          </Typography>
          <Typography color="text.secondary" sx={{ mb: { xs: 2, lg: "76px" } }}>
            Chúng tôi tin rằng kỳ nghỉ đẹp bắt đầu từ những điều nhỏ bé.
          </Typography>
          {/* <Button variant="contained" size="large">
            Liên hệ ngay
          </Button> */}
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            {services.map((s, i) => (
              <Grid size={{ xs: 12, sm: 4, lg: 3 }} key={i}>
                <Paper
                  elevation={1}
                  sx={{
                    px: 1,
                    py: 4.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "#BBE5D2",
                  }}
                >
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                    sx={{ height: 1, textAlign: "center" }}
                  >
                    {s.icon}
                    <Typography color="textSecondary">{s.title}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServicesSection;

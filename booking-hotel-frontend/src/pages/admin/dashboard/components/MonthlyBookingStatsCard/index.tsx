// components/dashboard/MonthlyBookingStatsCard.tsx
import { MonthlyBookingStats } from "@constant/types";
import {
  Paper,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

type Props = {
  data?: MonthlyBookingStats;
  loading?: boolean;
};

const StatRow = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    border="1px solid #24AB70"
    borderRadius={2.5}
    px={2}
    py={2}
  >
    <Typography
      variant="body2"
      color="text.primary"
      fontWeight={600}
      fontSize={16}
    >
      {label}
    </Typography>
    <Typography
      variant="subtitle1"
      fontWeight={600}
      color={color || "text.primary"}
    >
      {value}
    </Typography>
  </Box>
);

const MonthlyBookingStatsCard = ({ data, loading }: Props) => {
  if (loading)
    return (
      <Paper
        variant="outlined"
        sx={{ p: 3, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress size={28} />
      </Paper>
    );

  if (!data)
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu
        </Typography>
      </Paper>
    );

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: "100%" }}>
      <Box>
        <Typography variant="body2" fontWeight={600} mb={2} fontSize={20}>
          Thống kê booking
        </Typography>
        <Box mb={2}>
          <StatRow label="Tổng booking" value={data.total ?? 0} />
        </Box>
        <Box mb={2}>
          <StatRow
            label="Booking thành công"
            value={data.success ?? 0}
            color="primary"
          />
        </Box>
        <Box mb={2}>
          <StatRow
            label="Booking bị hủy"
            value={data.cancelled ?? 0}
            color="error.main"
          />{" "}
        </Box>
        <Box>
          <StatRow label="Tỷ lệ hủy" value={`${data.cancelRate ?? 0}%`} />
        </Box>
      </Box>
    </Paper>
  );
};

export default MonthlyBookingStatsCard;

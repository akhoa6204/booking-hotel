import { Paper, Typography, Stack } from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import { formatMoneyShort } from "@utils/format";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number | string | null;
  deltaText?: string;
  suffix?: string;
  loading?: boolean;
  isMoney?: boolean;
}

export default function StatCard({
  label,
  value,
  delta,
  deltaText = "",
  suffix = "%",
  loading = false,
  isMoney = false,
}: StatCardProps) {
  const num = typeof delta === "string" ? Number(delta) : Number(delta ?? 0);
  const isUp = num > 0;
  const isDown = num < 0;
  const color = isUp ? "#24AB70" : isDown ? "error.main" : "text.secondary";

  if (loading) return null;

  const shownValue =
    typeof value === "number" && isMoney ? formatMoneyShort(value) : value;

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2.5,
        borderColor: "#24AB70",
      }}
      variant="outlined"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5" fontWeight={700}>
          {shownValue}
        </Typography>
        <AssignmentTurnedInOutlinedIcon sx={{ color: "#42a5f5" }} />
      </Stack>

      {delta !== undefined && delta !== null ? (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mt: 0.5 }}
        >
          {isUp && <TrendingUpOutlinedIcon fontSize="small" sx={{ color }} />}
          {isDown && (
            <TrendingDownOutlinedIcon fontSize="small" sx={{ color }} />
          )}
          <Typography variant="caption" sx={{ color }}>
            {isUp ? `+${num}${suffix}` : `${num}${suffix}`} {deltaText}
          </Typography>
        </Stack>
      ) : (
        <Typography variant="caption" sx={{ color }}>
          Chưa có dữ liệu tháng trước
        </Typography>
      )}
    </Paper>
  );
}

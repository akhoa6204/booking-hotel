import { Customer } from "@assets/images";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  Rating,
} from "@mui/material";

type ReviewItem = {
  id: number;
  overall: number;
  amenities?: number | null;
  cleanliness?: number | null;
  comfort?: number | null;
  locationScore?: number | null;
  valueForMoney?: number | null;
  hygiene?: number | null;
  comment?: string | null;
  createdAt: string;
  displayName: string;
};

type ReviewStats = {
  total: number;
  average: {
    overall: number | null;
    amenities: number | null;
    cleanliness: number | null;
    comfort: number | null;
    locationScore: number | null;
    valueForMoney: number | null;
    hygiene: number | null;
  };
};

type Props = {
  stats?: ReviewStats;
  reviews: ReviewItem[];

};

const metricDefs: {
  key: keyof ReviewStats["average"];
  label: string;
}[] = [
  { key: "amenities", label: "Tiện nghi" },
  { key: "locationScore", label: "Địa điểm" },
  { key: "cleanliness", label: "Vệ sinh" },
  { key: "valueForMoney", label: "Đáng giá tiền" },
  { key: "comfort", label: "Thoải mái" },
  { key: "hygiene", label: "Sạch sẽ" },
];

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  const score = value ?? 0;
  const percent = (score / 5) * 100;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography variant="body2" sx={{ minWidth: 90 }}>
        {label}
      </Typography>
      <Box flex={1}>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{ height: 6, borderRadius: 999 }}
        />
      </Box>
      <Typography variant="body2" fontWeight={500} sx={{ minWidth: 32 }}>
        {score.toFixed(1)}
      </Typography>
    </Stack>
  );
}

export default function ReviewSection({
  stats,
  reviews,
}: Props) {
  const overall = stats?.average.overall ?? 0;

  return (
    <Box mt={4}>
      {/* Header + overall score */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h6" fontWeight={700}>
          Đánh giá
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {overall.toFixed(1)}
        </Typography>
        <Rating value={overall} max={5} precision={0.5} readOnly size="small" />
        {stats && (
          <Typography variant="body2" color="text.secondary">
            ({stats.total} đánh giá)
          </Typography>
        )}
      </Stack>

      {/* Metrics */}
      {stats && (
        <Grid container spacing={3} mb={4}>
          {metricDefs.map((m) => (
            <Grid size={{ xs: 12, md: 4 }} key={m.key}>
              <Stack spacing={1.5}>
                <MetricRow
                  key={m.key}
                  label={m.label}
                  value={stats.average[m.key]}
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Reviews list */}
      <Grid container spacing={4}>
        {reviews.map((r) => {
          const date = new Date(r.createdAt);
          const dateStr = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return (
            <Grid size={{ xs: 12, md: 4 }} key={r.id}>
              <Stack spacing={1.5}>
                {/* header */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 40, height: 40 }} src={Customer} />
                  <Box>
                    <Typography fontWeight={600}>
                      {r.displayName || "Khách"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dateStr}
                    </Typography>
                  </Box>
                </Stack>

                {/* comment */}
                <Typography variant="body2" color="text.primary">
                  {r.comment || "Khách không để lại nhận xét."}
                </Typography>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

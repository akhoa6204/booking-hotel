import { Box, Grid, Paper, Rating, Typography } from "@mui/material";
import { RatingField, ReviewForm } from "../../useReviewDetail";
import type { SyntheticEvent } from "react";

const DETAIL_FIELDS: { key: RatingField; label: string }[] = [
  { key: "amenities", label: "Tiện nghi" },
  { key: "cleanliness", label: "Vệ sinh" },
  { key: "comfort", label: "Thoải mái" },
  { key: "locationScore", label: "Địa điểm" },
  { key: "valueForMoney", label: "Đánh giá tiền" },
  { key: "hygiene", label: "Sạch sẽ" },
];

type Props = {
  values: Pick<ReviewForm, RatingField>; // chỉ lấy các field rating
  canEdit?: boolean;
  onChangeField?: (field: RatingField, value: number) => void;
};

const ReviewDetailSection = ({
  values,
  canEdit = true,
  onChangeField,
}: Props) => {
  const handleRatingChange =
    (field: RatingField) => (_: SyntheticEvent, value: number | null) => {
      if (!canEdit || !onChangeField || value == null) return;
      onChangeField(field, value);
    };

  return (
    <Paper sx={{ mb: 1.5, p: 2.5 }} elevation={0}>
      <Typography variant="h6" fontWeight={600}>
        Đánh giá chi tiết
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Đánh giá các tiêu chí cụ thể về dịch vụ
      </Typography>

      <Box sx={{ bgcolor: "#F5F8F7", borderRadius: 2, p: 2 }}>
        <Grid container rowSpacing={2} columnSpacing={16}>
          {DETAIL_FIELDS.map((f) => (
            <Grid size={{ xs: 12, sm: 6 }} key={f.key}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography>{f.label}</Typography>
                <Rating
                  value={values[f.key] ?? 0}
                  readOnly={!canEdit}
                  onChange={handleRatingChange(f.key)}
                  sx={{ "& .MuiRating-icon": { fontSize: 28 } }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default ReviewDetailSection;

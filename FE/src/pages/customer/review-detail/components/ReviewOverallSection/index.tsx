import { Box, Divider, Paper, Rating, Typography } from "@mui/material";
import React from "react";

interface Props {
  overall: number;
  canEdit?: boolean;
  onChange?: (value: number) => void;
}

const ReviewOverallSection: React.FC<Props> = ({
  overall,
  canEdit = false,
  onChange,
}) => {
  return (
    <Paper elevation={0} sx={{ mb: 1.5 }}>
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Đánh giá tổng quan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bạn đánh giá như thế nào về tổng thể
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ px: 2.5, py: 2, textAlign: "center" }}>
        <Rating
          value={overall}
          readOnly={!canEdit}
          onChange={(_, value) => {
            if (!canEdit) return;
            if (onChange && value != null) onChange(value);
          }}
          sx={{
            "& .MuiRating-icon": {
              fontSize: 32,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default ReviewOverallSection;

import {
  Paper,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Stack,
} from "@mui/material";
import dayjs from "dayjs";
import { Review } from "@constant/types";

type Props = {
  review: Review;
  onToggleStatus: (id: number, next: "PUBLISHED" | "HIDDEN") => void;
};

const ReviewCard: React.FC<Props> = ({ review, onToggleStatus }) => {
  const isPublished = review.status === "PUBLISHED";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        borderColor: "#E0E0E0",
        mb: 1.5,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight={600}>{review.displayName}</Typography>
          <Chip
            size="small"
            label={isPublished ? "Hiển thị" : "Đã ẩn"}
            color={isPublished ? "primary" : "error"}
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Phòng {review.room?.name} •{" "}
          {dayjs(review.createdAt).format("DD/MM/YYYY")}
        </Typography>

        <Typography variant="body2" mt={1}>
          {review.comment}
        </Typography>

        <Button
          size="small"
          variant="outlined"
          sx={{
            mt: 1,
            textTransform: "none",
            borderColor: isPublished ? "#d32f2f" : "#24AB70",
            color: isPublished ? "#d32f2f" : "#24AB70",
            borderRadius: 2,
            py:0.5,
            "&:hover": {
              backgroundColor: isPublished ? "rgba(211,47,47,0.08)" : "#b9e4c7",
              borderColor: isPublished ? "#d32f2f" : "#24AB70",
            },
          }}
          onClick={() =>
            onToggleStatus(review.id, isPublished ? "HIDDEN" : "PUBLISHED")
          }
        >
          {isPublished ? "Ẩn đánh giá" : "Hiển thị đánh giá"}
        </Button>
      </Box>

      <Rating
        value={review.overall}
        precision={0.1}
        readOnly
        sx={{ color: "#FFD700" }}
      />
    </Paper>
  );
};

export default ReviewCard;

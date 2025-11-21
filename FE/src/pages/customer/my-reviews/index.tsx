import { Box, Paper, Stack, Typography } from "@mui/material";
import useMyReview from "./useMyReview";
import Pager from "@components/pager";
import ReviewCard from "./components/review-card";
import ReviewCardSkeleton from "./components/ReviewCardSkeleton";

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN");
};

const MyReviewPage = () => {
  const {
    reviews,
    loading,
    totalPages,
    fetching,
    page,
    onChangePage,
    onClickReviewCard,
  } = useMyReview();

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
          p: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Đánh giá của tôi
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <ReviewCardSkeleton key={idx} />
            ))}
          </Stack>
        ) : (
          <>
            {reviews.length === 0 ? (
              <Typography color="text.secondary">
                Bạn chưa có đánh giá nào.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    image={
                      r.room.roomType.images?.[0]?.url ||
                      "/images/placeholder-room.jpg"
                    }
                    roomName={r.room.name}
                    roomType={r.room.roomType.name}
                    fromDate={formatDate(r.booking.checkIn)}
                    toDate={formatDate(r.booking.checkOut)}
                    comment={r.comment}
                    rating={r.overall}
                    onClick={() => onClickReviewCard(r.id)}
                  />
                ))}
              </Stack>
            )}

            {totalPages > 1 && (
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Pager
                  page={page}
                  totalPages={totalPages}
                  onChange={onChangePage}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </>
  );
};

export default MyReviewPage;

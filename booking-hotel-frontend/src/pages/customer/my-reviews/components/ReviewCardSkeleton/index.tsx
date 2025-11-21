// src/pages/my-reviews/components/ReviewCardSkeleton.tsx
import { Box, Skeleton, Stack } from "@mui/material";

const ReviewCardSkeleton = () => {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e5e5e5",
        bgcolor: "#F5F8F7",
      }}
    >
      {/* Image */}
      <Skeleton
        variant="rectangular"
        width={220}
        height={150}
        sx={{ borderRadius: 2, flexShrink: 0 }}
      />

      <Box sx={{ flex: 1, display: "flex" }}>
        <Stack spacing={1.5} sx={{ flex: 1, height: "100%" }}>
          <Box>
            {/* Room name */}
            <Skeleton variant="text" width={160} height={28} />
            {/* Room type */}
            <Skeleton variant="text" width={120} height={20} />
          </Box>

          {/* Rating */}
          <Skeleton variant="rounded" width={100} height={24} />

          {/* Date */}
          <Skeleton variant="text" width={140} height={20} />
          
          <Box>
            {/* Comment (2 lines) */}
            <Skeleton variant="text" width="95%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>

          {/* Button */}
          <Box textAlign="right">
            <Skeleton
              variant="rounded"
              width={120}
              height={36}
              sx={{ borderRadius: 1, display: "inline-block" }}
            />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};

export default ReviewCardSkeleton;

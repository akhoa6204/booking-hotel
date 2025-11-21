// src/pages/.../components/ReviewSectionSkeleton.tsx
import { Box, Grid, Skeleton, Stack, Typography } from "@mui/material";

const ReviewSectionSkeleton = () => {
  return (
    <Box mt={4}>
      {/* Header + overall score */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Skeleton variant="text" width={120} height={32} />
        <Skeleton variant="rectangular" width={48} height={32} />
        <Skeleton variant="rectangular" width={120} height={24} />
      </Stack>

      {/* Metrics skeleton */}
      <Grid container spacing={3} mb={4}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Grid size={{ xs: 12, md: 4 }} key={idx}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Skeleton variant="text" width={90} height={20} />
                <Skeleton
                  variant="rectangular"
                  height={6}
                  sx={{ flex: 1, borderRadius: 999 }}
                />
                <Skeleton variant="text" width={32} height={20} />
              </Stack>
            </Stack>
          </Grid>
        ))}
      </Grid>

      {/* Reviews list skeleton */}
      <Grid container spacing={4}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <Grid size={{ xs: 12, md: 4 }} key={idx}>
            <Stack spacing={1.5}>
              {/* header */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <Box>
                  <Skeleton variant="text" width={100} height={20} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
              </Stack>

              {/* comment */}
              <Skeleton variant="text" width="100%" height={18} />
              <Skeleton variant="text" width="90%" height={18} />
              <Skeleton variant="text" width="70%" height={18} />
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReviewSectionSkeleton;

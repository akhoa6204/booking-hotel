import { Box, Paper, Skeleton, Stack } from "@mui/material";

const RoomCardSkeleton = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #E0E0E0",
        mb: 2.5,
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={180} />

      <Box
        sx={{
          borderTop: "1px solid #E0E0E0",
          p: 2.5,
          mb: 3,
        }}
      >
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />

        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width="30%" height={20} />
        </Stack>
      </Box>
    </Paper>
  );
};

export default RoomCardSkeleton;

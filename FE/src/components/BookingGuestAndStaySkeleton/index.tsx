import { Box, Divider, Skeleton, Stack, Typography } from "@mui/material";

const BookingGuestAndStaySkeleton = () => {
  return (
    <Box sx={{ mb: 1.5, bgcolor: "white" }}>
      {/* Title */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Skeleton variant="text" width={180} height={28} />
      </Box>
      <Divider />

      <Stack direction="row" spacing={3} px={2.5} py={2}>
        {/* Guest info */}
        <Box sx={{ minWidth: 260 }}>
          <Skeleton variant="text" width={160} height={22} sx={{ mb: 1 }} />
          <Stack spacing={0.8}>
            <Skeleton variant="text" width={200} height={18} />
            <Skeleton variant="text" width={200} height={18} />
          </Stack>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Stay info card */}
        <Box
          sx={{
            flex: 1,
            borderRadius: 2,
            bgcolor: "#F5F8F7",
            p: 2.5,
            width: "100%",
          }}
        >
          <Stack direction="row" justifyContent="space-between" mb={1}>
            {/* Check-in */}
            <Box>
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={90} height={16} />
            </Box>

            {/* Nights icon */}
            <Stack spacing={0.5} alignItems="center" justifyContent="center">
              <Skeleton variant="text" width={50} height={16} />
              <Skeleton variant="circular" width={24} height={24} />
            </Stack>

            {/* Check-out */}
            <Box>
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={90} height={16} />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default BookingGuestAndStaySkeleton;

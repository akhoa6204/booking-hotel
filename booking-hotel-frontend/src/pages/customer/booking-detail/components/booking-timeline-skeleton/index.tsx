import { Box, Stack, Skeleton, Divider, Button } from "@mui/material";

const BookingTimelineSkeleton = () => {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        mb: 1.5,
        bgcolor: "white",
      }}
    >
      {/* Timeline skeleton */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={3}
        px={5}
        py={4}
      >
        {Array.from({ length: 4 }).map((_, idx) => {
          const isLast = idx === 3;
          return (
            <Stack
              key={idx}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ flex: isLast ? "0 auto" : 1 }}
            >
              <Stack alignItems="center" spacing={1}>
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  sx={{ borderRadius: "50%" }}
                />
                <Skeleton variant="text" width={80} height={16} />
              </Stack>

              {!isLast && (
                <Skeleton
                  variant="rectangular"
                  sx={{ flex: 1, height: 2, borderRadius: 1 }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>

      <Divider />

      {/* Action buttons */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        px={2.5}
        py={2}
      >
        <Skeleton
          variant="rectangular"
          width={100}
          height={36}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          width={80}
          height={36}
          sx={{ borderRadius: 1 }}
        />
      </Stack>
    </Box>
  );
};

export default BookingTimelineSkeleton;

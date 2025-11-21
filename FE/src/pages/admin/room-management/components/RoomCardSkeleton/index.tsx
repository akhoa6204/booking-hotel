import { Card, CardContent, Skeleton, Stack, Box } from "@mui/material";

const RoomCardSkeleton = () => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ảnh giả */}
      <Skeleton variant="rectangular" width="100%" height={208} />

      {/* Nội dung giả */}
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Skeleton variant="text" width="40%" height={28} />
          <Skeleton variant="rounded" width={70} height={24} />
        </Stack>

        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="50%" height={24} sx={{ mt: 1.5 }} />

        <Box mt={2}>
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="rounded" width={60} height={32} />
            <Skeleton variant="rounded" width={60} height={32} />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomCardSkeleton;

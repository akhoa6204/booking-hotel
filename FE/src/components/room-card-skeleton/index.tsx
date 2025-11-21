import { Card, CardContent, Skeleton, Stack, Divider } from "@mui/material";

const RoomCardSkeleton = () => {
  return (
    <Card sx={{ borderRadius: 3, bgcolor: "#FAFAFA" }}>
      <Skeleton
        variant="rectangular"
        height={336}
        width="100%"
        sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
      />

      <CardContent>
        <Skeleton variant="text" width="60%" height={28} />

        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mt={2}
        >
          <Skeleton variant="text" width={100} height={28} />
          <Skeleton
            variant="rectangular"
            width={100}
            height={36}
            sx={{ borderRadius: 2 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RoomCardSkeleton;

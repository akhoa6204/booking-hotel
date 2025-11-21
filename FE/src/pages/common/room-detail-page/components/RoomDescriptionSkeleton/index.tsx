import { Box, Grid, Stack, Skeleton, Card } from "@mui/material";

export default function RoomDescriptionSkeleton() {
  return (
    <Box mt={6}>
      <Grid container spacing={3}>
        {/* Left */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="text" width={240} height={40} />
          <Skeleton
            variant="rectangular"
            height={28}
            width={120}
            sx={{ mb: 3 }}
          />

          {/* Tiện nghi */}
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #eee",
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Mô tả */}
          <Box sx={{ borderRadius: 2, border: "1px solid #eee", p: 2.5 }}>
            <Skeleton variant="text" width={180} height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="95%" />
            <Skeleton variant="text" height={20} width="90%" />
            <Skeleton variant="text" height={20} width="80%" />
          </Box>
        </Grid>

        {/* Right – Price box */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Skeleton variant="text" width={140} height={20} />
            <Stack direction="row" justifyContent={"center"}>
              <Skeleton variant="text" width={200} height={32} />
            </Stack>
            <Skeleton variant="text" width={140} height={20} />

            <Skeleton
              variant="rectangular"
              height={40}
              sx={{ borderRadius: 999 }}
            />
            <Skeleton
              variant="rectangular"
              height={40}
              sx={{ borderRadius: 999 }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

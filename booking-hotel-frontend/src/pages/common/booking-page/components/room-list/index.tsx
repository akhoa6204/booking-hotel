import { RoomCard, RoomCardSkeleton } from "@components";
import { Room, RoomTypeGuest } from "@constant/types";
import { Box, Button, Grid, Stack, Typography, Skeleton } from "@mui/material";

interface Props {
  rooms: RoomTypeGuest[];
  loading: boolean;
  onBooking: (id: number) => void;
}

const RoomList: React.FC<Props> = ({ rooms, loading, onBooking }) => {
  const fallbackImg =
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop";
  return (
    <Box mb={5}>
      {loading ? (
        <>
          <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2, md: 0 }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            mb={4}
          >
            <Skeleton variant="text" width={400} height={24} />
            <Skeleton
              variant="rectangular"
              width={120}
              height={36}
              sx={{ borderRadius: 2 }}
            />
          </Stack>

          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <RoomCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <>
          <Grid container spacing={3}>
            {rooms.map((room) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                <RoomCard
                  id={room.id}
                  name={room.name}
                  type={room.name || "Hạng phòng"}
                  price={Number(room.basePrice)}
                  capacity={room.capacity}
                  image={room.image || fallbackImg}
                  onBooking={() => onBooking(room.id)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default RoomList;

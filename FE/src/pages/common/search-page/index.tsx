import {
  Box,
  Container,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import SearchResultsHeader from "./components/result-header";
import useSearch from "./useSearch";
import RoomCardSkeleton from "@components/room-card-skeleton";
import RoomCard from "@components/room-card";
import { MatchNotFound } from "@assets/images";
import GlobalSnackbar from "@components/GlobalSnackbar";
import { BookingStepper, SearchBar, SearchBarMobile } from "@components";

const SearchPage = () => {
  const {
    formSearch,
    onChangeFormSearch,
    onSubmitSearch,

    onBooking,

    rooms,
    loadingRooms,
    meta,
    sort,
    handleSort,

    alert,
    closeSnackbar,

    isMobile,
  } = useSearch();
  return (
    <>
      <Container>
        <BookingStepper activeStep={1} />
      </Container>

      {!isMobile ? (
        <Stack
          sx={{
            bgcolor: "#2E90FA0d",
            py: "44px",
            justifyContent: "center",
          }}
        >
          <SearchBar
            form={formSearch}
            onChange={onChangeFormSearch}
            onSubmit={onSubmitSearch}
          />
        </Stack>
      ) : (
        <Container>
          <SearchBarMobile
            form={formSearch}
            onChange={onChangeFormSearch}
            onSubmit={onSubmitSearch}
          />
        </Container>
      )}

      <Container>
        {loadingRooms ? (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              py={2.5}
            >
              <Skeleton
                variant="text"
                width={200}
                height={32}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width={160}
                height={40}
                sx={{ borderRadius: 2 }}
              />
            </Stack>

            <Skeleton variant="rectangular" height={2} sx={{ mb: 4.5 }} />

            <Grid container spacing={3} mb={2.5}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                  <RoomCardSkeleton />
                </Grid>
              ))}
            </Grid>
          </>
        ) : rooms.length > 0 ? (
          <>
            <SearchResultsHeader
              total={meta?.total}
              sort={sort}
              onSortChange={handleSort}
            />
            <Grid container spacing={3} mb={2.5}>
              {rooms.map((room) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                  <RoomCard
                    id={room.id}
                    name={room.name}
                    type={room.name || "Hạng phòng"}
                    discount={Number(room.discount)}
                    price={Number(room.basePrice)}
                    capacity={room.capacity}
                    image={room.image}
                    onBooking={() => {
                      onBooking(room.roomId);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Stack
            sx={{ height: 620, py: 2.5 }}
            alignItems="center"
            justifyContent="center"
          >
            <Box
              component="img"
              src={MatchNotFound}
              alt="Không tìm thấy"
              sx={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
                mx: "auto",
                mb: 4.5,
              }}
            />
            <Typography
              color="textPrimary"
              fontSize={32}
              fontWeight={600}
              mb={1}
              textAlign="center"
            >
              Không tìm thấy kết quả
            </Typography>
            <Typography color="textSecondary" textAlign="center">
              Thử thay đổi ngày nhận phòng, trả phòng hoặc số lượng khách.
            </Typography>
          </Stack>
        )}
      </Container>

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};
export default SearchPage;

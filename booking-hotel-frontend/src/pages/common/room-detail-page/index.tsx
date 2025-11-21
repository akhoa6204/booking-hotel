import { Box, Container } from "@mui/material";
import useRoomDetail from "./useRoomDetail";

import ImageGallery from "./components/image-gallery";
import RoomDescription from "./components/room-description";
import ReviewSection from "./components/review-section";

// Skeletons

import Pager from "@components/pager";
import ImageGallerySkeleton from "./components/ImageGallerySkeleton";
import RoomDescriptionSkeleton from "./components/RoomDescriptionSkeleton";
import ReviewSectionSkeleton from "./components/ReviewSectionSkeleton";

const RoomDetail = () => {
  const {
    room,
    reviews,
    reviewStats,
    reviewPage,
    totalReviewPages,
    handleChangePage,

    // loading tách riêng
    loadingRoom,
    loadingReviews,
    loadingStats,
    fetchingReviews,

    handleBookingRoom,
  } = useRoomDetail();

  const loadingRoomBlock = loadingRoom && !room;
  const loadingReviewBlock =
    (loadingReviews || loadingStats) && !reviews.length;

  return (
    <Container sx={{ py: 4 }}>
      {/* ===== ẢNH PHÒNG ===== */}
      {loadingRoomBlock ? (
        <ImageGallerySkeleton />
      ) : (
        <ImageGallery images={room?.images ?? []} />
      )}

      {/* ===== MÔ TẢ / TIỆN NGHI / GIÁ ===== */}
      <Box mt={4}>
        {loadingRoomBlock || !room ? (
          <RoomDescriptionSkeleton />
        ) : (
          <RoomDescription
            name={room.name}
            description={room.description}
            capacity={room.capacity}
            basePrice={room.basePrice}
            amenities={room.amenities}
            rating={reviewStats?.average.overall ?? 0}
            handleBookingRoom={handleBookingRoom}
          />
        )}
      </Box>

      {/* ===== REVIEW ===== */}
      <Box mt={4}>
        {loadingReviewBlock ? (
          <ReviewSectionSkeleton />
        ) : reviews.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              color: "text.secondary",
              fontSize: 16,
            }}
          >
            Chưa có đánh giá cho loại phòng này.
          </Box>
        ) : (
          <>
            <ReviewSection stats={reviewStats} reviews={reviews} />

            {totalReviewPages > 1 && (
              <Box mt={4} display="flex" justifyContent="center">
                <Pager
                  page={reviewPage}
                  totalPages={totalReviewPages}
                  onChange={handleChangePage}
                  siblingCount={1}
                  boundaryCount={1}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default RoomDetail;

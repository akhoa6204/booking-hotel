import RoomTypeService from "@services/RoomTypeService";
import { useQuery } from "@tanstack/react-query";
import { buildDefaultSearchParams } from "@utils/dateRange";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const fakeDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const useRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reviewPage, setReviewPage] = useState(1);
  const reviewLimit = 6;

  useEffect(() => {
    if (!id) navigate("/");
  }, [id, navigate]);

  /** ===== 1. Chi tiết loại phòng ===== */
  const {
    data: room,
    isLoading: loadingRoom,
    isFetching: fetchingRoom,
  } = useQuery({
    queryKey: ["room-detail", id],
    queryFn: async () => {
      await fakeDelay(1000); // FAKE LOADING 1s
      return RoomTypeService.getByIdForGuest(Number(id));
    },
    enabled: !!id,
  });

  /** ===== 2. Danh sách review + phân trang ===== */
  const {
    data: reviewData,
    isLoading: loadingReviews,
    isFetching: fetchingReviews,
  } = useQuery({
    queryKey: ["room-reviews", id, reviewPage, reviewLimit],
    queryFn: async () => {
      await fakeDelay(1000); // FAKE LOADING 1s
      return RoomTypeService.getReviewsForGuest({
        id: Number(id),
        page: reviewPage,
        limit: reviewLimit,
      });
    },
    enabled: !!id,
  });

  /** ===== 3. Stats review ===== */
  const {
    data: reviewStats,
    isLoading: loadingStats,
    isFetching: fetchingStats,
  } = useQuery({
    queryKey: ["room-review-stats", id],
    queryFn: async () => {
      await fakeDelay(1000); // FAKE LOADING 1s
      return RoomTypeService.getReviewStatsForGuest(Number(id));
    },
    enabled: !!id,
  });

  const reviews = reviewData?.items ?? [];
  const meta = reviewData?.meta;

  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const handleChangePage = (page: number) => setReviewPage(page);

  const handleBookingRoom = () => {
    const dateRange = buildDefaultSearchParams(room.capacity);
    navigate("/booking", {
      state: { ...dateRange },
    });
  };

  return {
    /** Data */
    room,
    reviews,
    reviewStats,
    reviewMeta: meta,
    totalReviewPages: totalPages,
    reviewPage,

    /** Loading tách riêng */
    loadingRoom,
    loadingReviews,
    loadingStats,
    fetchingRoom,
    fetchingReviews,
    fetchingStats,

    /** Handlers */
    handleChangePage,
    handleBookingRoom,
  };
};

export default useRoomDetail;

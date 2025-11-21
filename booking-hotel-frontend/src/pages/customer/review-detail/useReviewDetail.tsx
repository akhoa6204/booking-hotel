import ReviewService from "@services/ReviewService";
import BookingService from "@services/BookingService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { sleep } from "@utils/sleep";

export type RatingField =
  | "overall"
  | "amenities"
  | "cleanliness"
  | "comfort"
  | "locationScore"
  | "valueForMoney"
  | "hygiene";

export interface ReviewForm {
  overall: number;
  amenities: number;
  cleanliness: number;
  comfort: number;
  locationScore: number;
  valueForMoney: number;
  hygiene: number;
  comment: string;
}

type Mode = "view" | "add";

const EMPTY_FORM: ReviewForm = {
  overall: 0,
  amenities: 0,
  cleanliness: 0,
  comfort: 0,
  locationScore: 0,
  valueForMoney: 0,
  hygiene: 0,
  comment: "",
};

const useReviewDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const location = useLocation();
  const bookingId = (location.state as { bookingId?: number } | undefined)
    ?.bookingId;

  const [mode, setMode] = useState<Mode>("add");
  const [form, setForm] = useState<ReviewForm | null>(null);

  // xác định mode theo URL
  useEffect(() => {
    if (!id) {
      navigate("/account/reviews");
      return;
    }

    if (id === "create") {
      // tạo mới review phải có bookingId
      if (!bookingId) {
        navigate("/account/reviews");
        return;
      }
      setMode("add");
      setForm(EMPTY_FORM);
    } else {
      setMode("view");
    }
  }, [id, bookingId, navigate]);

  const isViewMode = mode === "view" && !!id && id !== "create";

  // ===== BOOKING (dùng cho cả add + view) =====
  const {
    data: booking,
    isLoading: bookingLoading,
    isFetching: bookingFetching,
  } = useQuery({
    queryKey: ["booking-detail", bookingId],
    queryFn: async () => {
      await sleep(1000); // fake loading 1s
      return BookingService.getById(Number(bookingId));
    },
    enabled: !!bookingId,
  });

  // ===== REVIEW DETAIL (view mode) =====
  const {
    data: review,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["review-detail", id],
    queryFn: async () => {
      await sleep(1000); // fake loading 1s
      return ReviewService.getById(Number(id));
    },
    enabled: isViewMode,
  });

  // fill form ở view mode
  useEffect(() => {
    if (review && isViewMode) {
      setForm({
        overall: review.overall ?? 0,
        amenities: review.amenities ?? 0,
        cleanliness: review.cleanliness ?? 0,
        comfort: review.comfort ?? 0,
        locationScore: review.locationScore ?? 0,
        valueForMoney: review.valueForMoney ?? 0,
        hygiene: review.hygiene ?? 0,
        comment: review.comment ?? "",
      });
    }
  }, [review, isViewMode]);

  const handleRatingChange = (field: RatingField, value: number) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleCommentChange = (value: string) => {
    setForm((prev) => (prev ? { ...prev, comment: value } : prev));
  };

  // ===== SUBMIT (tạo mới review) =====
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!form) return;

      if (mode === "add") {
        if (!bookingId) throw new Error("Thiếu bookingId");
        // fake loading 1s khi submit nếu muốn cảm giác mượt hơn
        await sleep(1000);
        return ReviewService.create({
          bookingId,
          ...form,
        });
      }
    },
    onSuccess: () => {
      navigate("/account/reviews", { replace: true });
    },
  });

  const handleSubmit = () => {
    if (!form) return;
    submitMutation.mutate();
  };

  const canEdit = mode === "add";

  const onBack = () =>
    mode === "add"
      ? navigate(`/account/bookings/${bookingId}`)
      : navigate("/account/reviews");

  return {
    mode,
    review,
    booking,
    form,
    canEdit,
    handleRatingChange,
    handleCommentChange,
    handleSubmit,
    onBack,
    // tổng loading: booking + review
    isLoading: isLoading || isFetching || bookingLoading || bookingFetching,
    isSubmitting: submitMutation.isPending,
  };
};

export default useReviewDetail;

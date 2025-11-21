// src/pages/review-detail/index.tsx
import { Fragment } from "react";
import { CircularProgress, Box } from "@mui/material";
import BookingHeader from "@components/BookingHeader";
import BookingGuestAndStay from "@components/BookingGuestAndStay";

import useReviewDetail from "./useReviewDetail";
import ReviewOverallSection from "./components/ReviewOverallSection";
import ReviewDetailSection from "./components/ReviewDetailSection";
import ReviewCommentSection from "./components/ReviewCommentSection";
import { useNavigate } from "react-router-dom";

const ReviewDetailPage = () => {
  const navigate = useNavigate();
  const {
    mode,
    review,
    booking,
    form,
    canEdit,
    handleRatingChange,
    handleCommentChange,
    handleSubmit,
    isLoading,
    isSubmitting,
    onBack,
  } = useReviewDetail();

  const targetBooking = review?.booking ?? booking;
  const targetCustomer = review?.customer ?? booking?.customer;

  if (isLoading && !targetBooking) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form || !targetBooking) return null;

  return (
    <Fragment>
      {/* Header: dùng info từ booking */}
      <BookingHeader
        id={targetBooking.id}
        status={targetBooking.status}
        onBack={onBack}
      />

      {/* Thông tin khách + thời gian lưu trú */}
      <BookingGuestAndStay
        title="Đánh giá trải nghiệm của bạn"
        booking={targetBooking}
        customer={targetCustomer}
      />

      {/* Đánh giá tổng quan */}
      <ReviewOverallSection
        overall={form.overall}
        canEdit={canEdit}
        onChange={(v) => handleRatingChange("overall", v)}
      />

      {/* Đánh giá chi tiết từng tiêu chí */}
      <ReviewDetailSection
        values={form}
        canEdit={canEdit}
        onChangeField={handleRatingChange}
      />

      {/* Nhận xét */}
      <ReviewCommentSection
        comment={form.comment}
        canEdit={canEdit}
        onChange={handleCommentChange}
        onCancel={() => navigate("/account/reviews")}
        onSubmit={handleSubmit}
        submitting={isSubmitting}
      />
    </Fragment>
  );
};

export default ReviewDetailPage;

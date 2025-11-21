import { Review } from "@constant/types";
import ReviewService from "@services/ReviewService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sleep } from "@utils/sleep";

const PAGE_SIZE = 5;

const useMyReview = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["my-reviews", page],
    queryFn: async () => {
      await sleep(1000); // fake loading 1s
      return ReviewService.listMy({
        page,
        limit: PAGE_SIZE,
      });
    },
  });

  const reviews: Review[] = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;

  const onChangePage = (page: number) => setPage(page);
  const onClickReviewCard = (id: number) => navigate(`/account/reviews/${id}`);

  return {
    reviews,
    totalPages,
    page,
    onChangePage,
    loading: isLoading,
    fetching: isFetching,
    onClickReviewCard,
  };
};

export default useMyReview;

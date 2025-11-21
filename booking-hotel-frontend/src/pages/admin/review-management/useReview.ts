import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginatedResponse } from "@constant/response/paginated";
import { Review, ReviewStats, ReviewStatus } from "@constant/types";
import ReviewService from "@services/ReviewService";

type Filters = {
  hotelId: number;
  roomId?: number;
  status: ReviewStatus;
  q?: string;
  page: number;
  limit: number;
};

const initialFilters: Filters = {
  hotelId: 1,
  status: "PUBLISHED",
  q: "",
  page: 1,
  limit: 5,
};

const useReviewManagement = () => {
  const qc = useQueryClient();

  /* =================== FILTERS =================== */
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const handleSearch = (keyword: string) =>
    setFilters((s) => ({ ...s, q: keyword, page: 1 }));

  const handleChangePage = (page: number) =>
    setFilters((s) => ({ ...s, page }));

  const handleChangeFilter = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => setFilters((s) => ({ ...s, [key]: value, page: 1 }));

  /* =================== LIST =================== */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reviews:list", filters],
    queryFn: () =>
      ReviewService.list({
        page: filters.page,
        limit: filters.limit,
        roomId: filters.roomId ? Number(filters.roomId) : undefined,
        q: filters.q?.trim() || undefined,
      }),
  });

  const rows: Review[] = (data?.items ?? []) as Review[];
  const meta = data?.meta as PaginatedResponse<Review>["meta"];
  console.log("meta:", meta);

  const totalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil((meta?.total ?? 0) / (meta?.limit ?? filters.limit))
      ),
    [meta?.total, meta?.limit, filters.limit]
  );
  const currentPage = meta?.page ?? filters.page;

  /* =================== STATS =================== */
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: [
      "reviews:stats",
      { roomId: filters.roomId, hotelId: filters.hotelId },
    ],
    queryFn: () =>
      ReviewService.getStats({
        roomId: filters.roomId ? Number(filters.roomId) : undefined,
        hotelId: filters.hotelId,
      }),
    staleTime: 30_000,
  });
  const stats: ReviewStats = statsRes;

  /* =================== ACTIONS =================== */
  const updateStatusMutation = useMutation({
    mutationFn: (payload: {
      id: number;
      status: ReviewStatus;
      reason?: string;
    }) =>
      ReviewService.updateStatus(payload.id, {
        status: payload.status,
        reason: payload.reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews:list"] });
      qc.invalidateQueries({ queryKey: ["reviews:stats"] });
    },
  });

  const onPublish = (id: number) =>
    updateStatusMutation.mutate({ id, status: "PUBLISHED" });

  const onHide = (id: number, reason?: string) =>
    updateStatusMutation.mutate({ id, status: "HIDDEN", reason });

  return {
    // table
    rows,
    isLoading,
    isError,
    totalPages,
    currentPage,

    // filters
    filters,
    handleSearch,
    handleChangePage,
    handleChangeFilter,

    // stats
    stats,
    statsLoading,

    // actions
    onPublish,
    onHide,

    // page
    meta,
  };
};

export default useReviewManagement;

import useSnackbar from "@hooks/useSnackbar";
import RoomTypeService from "@services/RoomTypeService";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BookingForm, FormData, GuestType, SortKey } from "./interface";
import { SearchState } from "@constant/types";
import useForm from "@hooks/useForm";

const useSearch = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: Partial<SearchState> };

  const { alert, showError, closeSnackbar } = useSnackbar();

  const initForm: FormData = {
    from: state?.from ?? "",
    to: state?.to ?? "",
    capacity: Number(state?.capacity ?? 1),
    sort: "price-asc",
  };

  const {
    form: formSearch,
    errors,
    onChange: onChangeFormSearch,
    onSubmit: onSubmitSearch,
  } = useForm<FormData>(initForm, undefined, (f) => {
    setFilters((p) => ({
      ...p,
      from: f.from,
      to: f.to,
      capacity: Number(f.capacity),
      page: 1,
    }));
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    q: "",
    from: initForm.from,
    to: initForm.to,
    capacity: initForm.capacity,
    sort: initForm.sort,
  });

  const enabled = useMemo(
    () => Boolean(filters.from && filters.to && filters.capacity >= 1),
    [filters.from, filters.to, filters.capacity],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rooms.search", filters],
    queryFn: async () => {
      return RoomTypeService.listGuest({
        page: filters.page,
        limit: filters.limit,
        q: filters.q,
        capacity: filters.capacity,
        checkIn: filters.from,
        checkOut: filters.to,
        sort: filters.sort,
      });
    },
    enabled,
  });

  const rooms = data?.items ?? [];
  const meta = data?.meta;

  const handleSort = (s: SortKey) =>
    setFilters((p) => ({ ...p, sort: s, page: 1 }));

  const handleRoomType = (value: string | undefined) =>
    setFilters((p) => ({ ...p, roomType: value, page: 1 }));

  const onBooking = (id: number) => {
    if (!filters.from || !filters.to) {
      showError("Điền đủ thông tin ngày bắt đầu - ngày kết thúc");
      return;
    }
    console.log(id);
    navigate(`/booking`, {
      state: { roomId: id, checkIn: filters.from, checkOut: filters.to },
    });
  };

  const loadingRooms = isLoading || isFetching;

  return {
    formSearch,
    errors,
    onChangeFormSearch,
    onSubmitSearch,

    filters,

    rooms,
    loadingRooms,
    meta,
    sort: filters.sort,
    handleSort,
    handleRoomType,
    setPage: (page: number) => setFilters((p) => ({ ...p, page })),
    setLimit: (limit: number) => setFilters((p) => ({ ...p, limit })),

    alert,
    closeSnackbar,

    onBooking,
  };
};

export default useSearch;

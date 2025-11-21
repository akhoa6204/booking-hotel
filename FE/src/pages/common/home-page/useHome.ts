import { useEffect, useState } from "react";
import { FormBooking, RoomTypeGuest } from "@constant/types";
import { useLocation, useNavigate } from "react-router-dom";
import useForm from "@hooks/useForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RoomTypeService from "@services/RoomTypeService";
import { useMediaQuery, useTheme } from "@mui/material";
import { buildDefaultSearchParams } from "@utils/dateRange";
import useSnackbar from "@hooks/useSnackbar";
import { sleep } from "@utils/sleep";

const initForm: FormBooking = {
  from: "",
  to: "",
  capacity: 1,
};

const useHome = () => {
  const qc = useQueryClient();

  const [filters, setFilters] = useState({
    hotelId: 1,
    q: "",
    page: 1,
    limit: 3,
  });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { alert, showError, closeSnackbar, showSuccess } = useSnackbar();

  const { form, errors, onChange, onSubmit } = useForm<FormBooking>(
    initForm,

    (f) => {
      const errors: any = {};

      if (!f.from) errors.from = "Vui lòng chọn ngày nhận phòng";
      if (!f.to) errors.to = "Vui lòng chọn ngày trả phòng";

      if (Object.keys(errors).length > 0) {
        showError("Vui lòng chọn ngày nhận phòng và ngày trả phòng");
      }

      return errors;
    },

    (form) => {
      navigate("/booking", {
        state: {
          from: form.from,
          to: form.to,
          capacity: form.capacity,
        },
      });
    }
  );
  const { data, isLoading: loading } = useQuery({
    queryKey: ["roomTypes", filters],
    queryFn: async () => {
      await sleep(500);
      return RoomTypeService.listGuest({
        hotelId: filters.hotelId,
        page: filters.page,
        limit: filters.limit,
        q: filters.q,
      });
    },
  });

  const roomTypes: RoomTypeGuest[] = data?.items ?? [];
  const meta = data?.meta;

  const onClickSeeAll = () => {
    const dateRange = buildDefaultSearchParams();
    navigate("/booking", {
      state: {
        ...dateRange,
      },
    });
  };
  const onClickRoomCard = (capacity: number) => {
    const dateRange = buildDefaultSearchParams(capacity);
    navigate("/booking", {
      state: {
        ...dateRange,
      },
    });
  };

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get("result");

    if (result === "true" || result === "success") {
      showSuccess("Đặt phòng thành công");

      const newParams = new URLSearchParams(location.search);
      newParams.delete("result");

      navigate(
        {
          pathname: location.pathname,
          search: newParams.toString() ? `?${newParams.toString()}` : "",
        },
        { replace: true }
      );
    }
  }, []);

  return {
    loading,
    rooms: roomTypes,
    form,
    onChange,
    onSubmit,
    errors,
    isMobile,
    onClickSeeAll,
    alert,
    closeSnackbar,
    onClickRoomCard,
  };
};

export default useHome;

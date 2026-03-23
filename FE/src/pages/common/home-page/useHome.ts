import { FormBooking, RoomTypeGuest } from "@constant/types";
import { useNavigate } from "react-router-dom";
import useForm from "@hooks/useForm";
import { useQuery } from "@tanstack/react-query";
import RoomTypeService from "@services/RoomTypeService";
import { useMediaQuery, useTheme } from "@mui/material";
import { buildDefaultSearchParams } from "@utils/dateRange";
import useSnackbar from "@hooks/useSnackbar";
import { sleep } from "@utils/sleep";
import { formatDateInput } from "@utils/format";

const useHome = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { alert, showError, closeSnackbar } = useSnackbar();

  const { form, errors, onChangeField, onSubmit } = useForm<FormBooking>(
    {
      from: formatDateInput(today.toISOString()),
      to: formatDateInput(tomorrow.toISOString()),
      capacity: 1,
    },

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
      navigate("/search", {
        state: {
          from: form.from,
          to: form.to,
          capacity: form.capacity,
        },
      });
    },
  );
  const { data, isLoading: loading } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: async () => {
      await sleep(500);
      return RoomTypeService.listGuest({
        page: 1,
        limit: 3,
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
    navigate("/search", {
      state: {
        ...dateRange,
      },
    });
  };

  return {
    loading,
    rooms: roomTypes,
    form,
    onChange: onChangeField,
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

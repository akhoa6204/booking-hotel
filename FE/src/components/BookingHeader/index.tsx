import { ArrowBack } from "@mui/icons-material";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import type { Booking, BookingStatus } from "@constant/types";

const statusLabelMap: Record<BookingStatus, string> = {
  PENDING: "Đang chờ",
  CONFIRMED: "Sắp nhận phòng",
  CHECKED_IN: "Đã check-in",
  CHECKED_OUT: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusColorMap: Record<BookingStatus, string> = {
  PENDING: "text.secondary",
  CONFIRMED: "#E37531",
  CHECKED_IN: "warning.main",
  CHECKED_OUT: "primary.main",
  CANCELLED: "error.main",
};

type Props = {
  id: number;
  status: BookingStatus;
  onBack?: () => void;
};

const BookingHeader = ({ id, status, onBack }: Props) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mb={1.5}
      bgcolor="white"
      px={2.5}
      py={2}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="body1" fontWeight={500}>
          Trở lại
        </Typography>
      </Stack>
      <Stack direction={"row"} spacing={1.5}>
        <Typography>
          MÃ ĐẶT PHÒNG: <strong>{id}</strong>
        </Typography>

        <Divider orientation="vertical" flexItem />

        <Typography fontWeight={600} color={statusColorMap[status]}>
          {statusLabelMap[status]}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default BookingHeader;

import { Box, Paper, Stack, Typography, Divider } from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { diffNights, formatDate } from "@utils/format";

type BookingDetailCardProps = {
  checkIn: string;
  checkOut: string;
  guests: number;
  timeRange?: string;
  nonRefundText?: string;
};

const BookingDetailCard: React.FC<BookingDetailCardProps> = ({
  checkIn,
  checkOut,
  guests,
  timeRange = "14:00 - 22:00",
  nonRefundText = "Đặt phòng này không được hoàn tiền",
}) => {
  const nights = diffNights(checkIn, checkOut);
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E0E0E0",
        p: 2.5,
        mb: 2.5,
      }}
    >
      {/* Title */}
      <Typography variant="h6" fontWeight={600} mb={2}>
        Chi tiết đặt phòng
      </Typography>

      {/* Box ngày nhận / trả phòng */}
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: "#F5F8F7",
          p: 2,
          mb: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Nhận phòng */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              mb={0.5}
              fontWeight={500}
            >
              Nhận phòng
            </Typography>
            <Typography fontWeight={700}>{formatDate(checkIn)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {timeRange}
            </Typography>
          </Box>

          {/* Số đêm + mũi tên */}
          <Stack alignItems="center" spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {nights} đêm
            </Typography>
            <ArrowForwardIosRoundedIcon fontSize="small" />
          </Stack>

          {/* Trả phòng */}
          <Box textAlign="right">
            <Typography
              variant="body2"
              color="text.secondary"
              mb={0.5}
              fontWeight={500}
            >
              Trả phòng
            </Typography>
            <Typography fontWeight={700}>{formatDate(checkOut)}</Typography>
            <Typography variant="body2" color="text.secondary">
              7:00 - 12:00
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Dòng số khách */}
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <PersonOutlineRoundedIcon fontSize="small" />
        <Typography variant="body2">{guests} khách</Typography>
      </Stack>

      {/* Dòng không hoàn tiền */}
      <Stack direction="row" spacing={1} alignItems="center">
        <BlockRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary">
          {nonRefundText}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default BookingDetailCard;

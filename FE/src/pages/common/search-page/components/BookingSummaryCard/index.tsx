import { Box, Paper, Typography, Divider, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BlockIcon from "@mui/icons-material/Block";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { diffNights, formatDate } from "@utils/format";

type Props = {
  roomName: string;
  checkIn: string;
  checkOut: string;
  capacity: number;
  nonRefundableText?: string;

  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
};

const BookingSummaryCard: React.FC<Props> = ({
  roomName,
  checkIn,
  checkOut,
  capacity,
  nonRefundableText = "Đặt phòng này không được hoàn tiền",
  guestName,
  guestPhone,
  guestEmail,
}) => {
  const nights = diffNights(checkIn, checkOut);
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
      variant="outlined"
    >
      {/* Header */}
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ py: 2, px: 2.5, bgcolor: "#F5F8F7" }}
      >
        Chi tiết đặt phòng
      </Typography>

      <Divider />
      <Box sx={{ py: 2, px: 2.5 }}>
        {/* Tên KS */}
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Phòng {roomName}
        </Typography>

        {/* Ngày */}
        <Box
          sx={{
            borderRadius: 2,
            bgcolor: "#F5F8F7",
            p: 2,
            mb: 1.5,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Nhận phòng */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Nhận phòng
              </Typography>
              <Typography fontWeight={600}>{formatDate(checkIn)}</Typography>
              <Typography variant="caption" color="text.secondary">
                14:00 - 22:00
              </Typography>
            </Box>

            {/* Số đêm */}
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary">
                {nights} đêm
              </Typography>
              <Typography variant="h6">→</Typography>
            </Box>

            {/* Trả phòng */}
            <Box textAlign="right">
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Trả phòng
              </Typography>
              <Typography fontWeight={600}>{formatDate(checkOut)}</Typography>
              <Typography variant="caption" color="text.secondary">
                7:00 - 12:00
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Số khách + chính sách */}
        <Stack spacing={0.5} mb={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <PersonIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{capacity} khách</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.75}>
            <BlockIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              {nonRefundableText}
            </Typography>
          </Stack>
        </Stack>

        {/* Info Khách hàng */}
        <Typography variant="subtitle2" fontWeight={700} mb={0.75}>
          Thông tin khách hàng
        </Typography>

        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <PersonIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{guestName}</Typography>
          </Stack>

          {guestPhone && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <PhoneIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">{guestPhone}</Typography>
            </Stack>
          )}

          {guestEmail && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <EmailIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">{guestEmail}</Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default BookingSummaryCard;

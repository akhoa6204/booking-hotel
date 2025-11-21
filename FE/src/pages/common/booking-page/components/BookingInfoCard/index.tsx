// BookingInfoCard.tsx
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { BookingForm, GuestType } from "../../useBooking";

type Props = {
  value: BookingForm;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChangeGuestType: (v: GuestType) => void;
};

const BookingInfoCard = ({ value, onChange, onChangeGuestType }: Props) => {
  const handleGuestTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeGuestType(e.target.value as GuestType);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        mb: 3,
      }}
      variant="outlined"
    >
      <Box mb={2}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Thông tin đặt phòng
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng kiểm tra thông tin đặt phòng.
        </Typography>
      </Box>

      {/* Họ tên */}
      <Box mb={2.5}>
        <Typography fontWeight={600} mb={1} color="#555555" fontSize={14}>
          Họ tên
        </Typography>
        <TextField
          fullWidth
          value={value.fullName}
          name="fullName"
          onChange={onChange}
          placeholder="Nhập họ tên"
        />
      </Box>

      {/* SĐT + Email */}
      <Grid container spacing={2.5} mb={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography fontWeight={600} mb={1} color="#555555" fontSize={14}>
            Số điện thoại
          </Typography>
          <TextField
            fullWidth
            value={value.phone}
            name="phone"
            onChange={onChange}
            placeholder="+84..."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography fontWeight={600} mb={1} color="#555555" fontSize={14}>
            Email
          </Typography>
          <TextField
            fullWidth
            value={value.email}
            name="email"
            onChange={onChange}
            placeholder="email@example.com"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Bạn đặt phòng cho ai? */}
      <Box>
        <Typography fontWeight={600} mb={0.5}>
          Bạn đặt phòng cho ai?{" "}
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            fontWeight={400}
          >
            (không bắt buộc)
          </Typography>
        </Typography>

        <RadioGroup
          sx={{ mt: 1 }}
          value={value.guestType}
          onChange={handleGuestTypeChange}
        >
          <FormControlLabel
            value="SELF"
            control={<Radio />}
            label="Tôi là khách lưu trú"
          />
          <FormControlLabel
            value="OTHER"
            control={<Radio />}
            label="Đặt phòng này là cho người khác"
          />
        </RadioGroup>
      </Box>
    </Paper>
  );
};

export default BookingInfoCard;

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  Typography,
  Grid,
  Box,
  Stack,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
  InputLabel,
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import dayjs from "dayjs";
import { BookingForm } from "../../useBookingManagement";

type RoomTypeLite = {
  id?: number;
  name: string;
  basePrice?: number;
  capacity?: number;
};
type RoomLite = { id: number; name: string };

type Props = {
  open: boolean;
  values: BookingForm;
  roomTypes: RoomTypeLite[];
  rooms: RoomLite[];
  nights?: number;
  pricing?: {
    unitPrice: number;
    totalBefore: number;
    discount: number;
    totalAfter: number;
    promoApplied?: { code: string } | null;
  };
  loadingRooms?: boolean;
  submitting?: boolean;
  onChange: (field: string, value: any) => void;
  onCheckRooms: () => void;
  onApplyPromo: () => void;
  onSubmit: () => void;
  onClose: () => void;
  quoting?: boolean;
};

export default function BookingCreateDialog({
  open,
  values,
  roomTypes,
  rooms,
  nights,
  pricing,
  loadingRooms,
  submitting,
  quoting,
  onChange,
  onCheckRooms,
  onApplyPromo,
  onSubmit,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>Tạo đặt phòng</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Paper variant="outlined" sx={{ py: 2, px: 1.5, borderRadius: 2 }}>
            <Typography fontWeight={600} pb={1.5}>
              Thông tin khách hàng
            </Typography>

            <Grid container spacing={2}>
              <Grid size={6}>
                <InputLabel shrink>Tên khách hàng</InputLabel>
                <TextField
                  type="text"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: dayjs().format("YYYY-MM-DD") }}
                  value={values.fullname}
                  onChange={(e) => onChange("fullname", e.target.value)}
                />
              </Grid>
              <Grid size={6}>
                <InputLabel shrink>Số điện thoại</InputLabel>
                <TextField
                  type="tel"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: values.checkIn }}
                  value={values.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ py: 2, px: 1.5, borderRadius: 2 }}>
            <Typography fontWeight={600} pb={1.5}>
              Thông tin đặt phòng
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid size={4}>
                <InputLabel shrink>Ngày đến</InputLabel>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: dayjs().format("YYYY-MM-DD") }}
                  value={values.checkIn}
                  onChange={(e) => onChange("checkIn", e.target.value)}
                />
              </Grid>
              <Grid size={4}>
                <InputLabel shrink>Ngày đi</InputLabel>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: values.checkIn }}
                  value={values.checkOut}
                  onChange={(e) => onChange("checkOut", e.target.value)}
                />
              </Grid>
              <Grid size={4}>
                <InputLabel shrink>Phương thức thanh toán</InputLabel>
                <Select
                  fullWidth
                  size="small"
                  value={values.paymentMethod}
                  onChange={(e) => onChange("paymentMethod", e.target.value)}
                >
                  <MenuItem value="CASH">Tiền mặt</MenuItem>
                  <MenuItem value="CARD">Thanh toán online</MenuItem>
                </Select>
              </Grid>
            </Grid>
            <Grid container mb={2} spacing={2}>
              <Grid size={10}>
                <InputLabel shrink>Loại phòng</InputLabel>
                <Select
                  fullWidth
                  size="small"
                  value={values.roomTypeId}
                  displayEmpty
                  renderValue={(v) => {
                    if (!v || v === undefined) return "Toàn bộ loại phòng";
                    const t = roomTypes.find((rt) => rt.id === v);
                    return t?.name ?? "";
                  }}
                  onChange={(e) => {
                    const value = e.target.value as string | number;
                    onChange("roomTypeId", value === "" ? "" : Number(value));
                  }}
                >
                  <MenuItem value="">Toàn bộ loại phòng</MenuItem>
                  {roomTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id!}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid size={2} display={"flex"} alignItems={"flex-end"}>
                <Button
                  variant="outlined"
                  startIcon={<Search />}
                  onClick={onCheckRooms}
                  disabled={!values.checkIn || !values.checkOut || loadingRooms}
                  fullWidth
                >
                  Kiểm tra
                </Button>
              </Grid>
            </Grid>

            {rooms.length > 0 && (
              <Grid container spacing={1}>
                <Grid size={5}>
                  <InputLabel shrink>Chọn phòng</InputLabel>
                  <Select
                    fullWidth
                    size="small"
                    value={values.roomId}
                    displayEmpty
                    renderValue={(v) => {
                      if (!v) return "Chọn phòng trống";
                      const r = rooms.find((r) => r.id === v);
                      return r?.name ?? "";
                    }}
                    onChange={(e) => {
                      const value = e.target.value as string | number;
                      onChange("roomId", value === "" ? "" : Number(value));
                    }}
                  >
                    <MenuItem value="">Chọn phòng trống</MenuItem>
                    {rooms.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={5}>
                  <InputLabel shrink>Mã khuyến mãi</InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nhập mã khuyến mãi"
                    value={values.promoCode}
                    onChange={(e) => onChange("promoCode", e.target.value)}
                    InputProps={{
                      endAdornment: values.promoCode && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => onChange("promoCode", "")}>
                            <Close fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={2} display={"flex"} alignItems={"flex-end"}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={onApplyPromo}
                    disabled={!values.roomId}
                  >
                    Áp dụng
                  </Button>
                </Grid>
              </Grid>
            )}
          </Paper>

          {pricing && (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Grid container spacing={0.5}>
                <Grid size={6}></Grid>
                <Grid size={6} container>
                  <Grid size={6}>
                    <Typography>Đơn giá:</Typography>
                  </Grid>
                  <Grid size={6} textAlign="right">
                    <Typography>
                      {pricing.unitPrice.toLocaleString()} VND/đêm
                    </Typography>
                  </Grid>

                  <Grid size={6}>
                    <Typography>Số đêm:</Typography>
                  </Grid>
                  <Grid size={6} textAlign="right">
                    <Typography>{nights}</Typography>
                  </Grid>

                  <Grid size={6}>
                    <Typography>Tạm tính:</Typography>
                  </Grid>
                  <Grid size={6} textAlign="right">
                    <Typography>
                      {pricing.totalBefore.toLocaleString()} VND
                    </Typography>
                  </Grid>

                  <Grid size={6}>
                    <Typography>Giảm giá:</Typography>
                  </Grid>
                  <Grid size={6} textAlign="right">
                    <Typography>
                      −{pricing.discount.toLocaleString()} VND
                    </Typography>
                  </Grid>

                  <Grid size={6}>
                    <Typography fontWeight={700}>Tổng cộng:</Typography>
                  </Grid>
                  <Grid size={6} textAlign="right">
                    <Typography fontWeight={700}>
                      {pricing.totalAfter.toLocaleString()} VND
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!values.roomId || submitting}
        >
          Tạo đặt phòng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

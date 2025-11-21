import { Booking, PaymentMethod } from "@constant/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useMemo } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onConfirm?: () => void;
  loading?: boolean;
};

const CheckInPaymentDialog: React.FC<Props> = ({
  open,
  onClose,
  booking,
  paymentMethod,
  onPaymentMethodChange,
  onConfirm,
  loading,
}) => {
  const nights = useMemo(() => {
    const a = dayjs(booking.checkIn);
    const b = dayjs(booking.checkOut);
    const d = b.diff(a, "day");
    return Math.max(1, Number.isFinite(d) ? d : 1);
  }, [booking.checkIn, booking.checkOut]);

  const unitPrice = booking.room.roomType.basePrice;
  const totalBefore = booking.totalPrice;
  const discount = booking.discountAmount || 0;
  const totalAfter = booking.finalPrice;
  const deposit = booking.amountPaid || 0;
  const remaining = Math.max(0, totalAfter - deposit);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Xác nhận nhận phòng</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Paper variant="outlined" sx={{ py: 2, px: 1.5, borderRadius: 2 }}>
            <Typography fontWeight={600} pb={1.5}>
              Thông tin đặt phòng
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography>
                  Khách hàng: {booking.customer?.fullName}
                </Typography>
                <Typography>Email: {booking.customer?.email || "-"}</Typography>
                <Typography>
                  Số điện thoại: {booking.customer?.phone || "-"}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography>
                  Phòng: {booking.room.name} - {booking.room.roomType.name}
                </Typography>
                <Typography>
                  Check-in: {dayjs(booking.checkIn).format("DD/M/YYYY")}
                </Typography>
                <Typography>
                  Check-out: {dayjs(booking.checkOut).format("DD/M/YYYY")}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ py: 2, px: 1.5, borderRadius: 2 }}>
            <Typography fontWeight={600} pb={1.5}>
              Thông tin thanh toán
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <InputLabel shrink>Phương thức thanh toán</InputLabel>
                <Select
                  value={paymentMethod}
                  fullWidth
                  size="small"
                  onChange={(e) =>
                    onPaymentMethodChange(e.target.value as PaymentMethod)
                  }
                >
                  <MenuItem value="CASH">Tiền mặt</MenuItem>
                  <MenuItem value="CARD">Thanh toán online</MenuItem>
                </Select>
              </Grid>

              <Grid size={6} container>
                <Grid size={6}>
                  <Typography>Đơn giá:</Typography>
                </Grid>
                <Grid size={6} textAlign="right">
                  <Typography>{unitPrice.toLocaleString()} VND/đêm</Typography>
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
                  <Typography>{totalBefore.toLocaleString()} VND</Typography>
                </Grid>

                <Grid size={6}>
                  <Typography>Giảm giá:</Typography>
                </Grid>
                <Grid size={6} textAlign="right">
                  <Typography>−{discount.toLocaleString()} VND</Typography>
                </Grid>

                <Grid size={6}>
                  <Typography>Tổng cộng:</Typography>
                </Grid>
                <Grid size={6} textAlign="right">
                  <Typography>{totalAfter.toLocaleString()} VND</Typography>
                </Grid>

                <Grid size={6}>
                  <Typography>Đã thanh toán:</Typography>
                </Grid>
                <Grid size={6} textAlign="right">
                  <Typography>{deposit.toLocaleString()} VND</Typography>
                </Grid>

                <Grid size={6}>
                  <Typography fontWeight={700}>Thanh toán Còn lại:</Typography>
                </Grid>
                <Grid size={6} textAlign="right">
                  <Typography fontWeight={700}>
                    {remaining.toLocaleString()} VND
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading}>
          Xác nhận thanh toán
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckInPaymentDialog;

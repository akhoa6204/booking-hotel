import EntityPickerField from "@components/entity-picker-field";
import { Booking, Invoice, Room } from "@constant/types";
import { Typography, Grid, Box, MenuItem } from "@mui/material";

type Props = {
  booking: Booking;
  onOpenPicker: () => void;
  isMoreOptions: boolean;
  rooms: Room[];
  onChangeRoom: (roomId: number) => void;
};

const getLabelStatus = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  CHECKED_IN: "Đang ở",
  CHECKED_OUT: "Đã trả phòng",
};

export default function BookingInfoTab({
  booking,
  onOpenPicker,
  isMoreOptions,
  rooms,
  onChangeRoom,
}: Props) {
  return (
    <Box minHeight={400}>
      <Grid container spacing={2}>
        <Grid size={6}>
          <Typography variant="body2">Khách</Typography>
          <Typography fontWeight={600}>{booking.fullName}</Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Điện thoại</Typography>
          <Typography fontWeight={600}>{booking.phone}</Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Phòng</Typography>
          {booking.status === "CANCELLED" ||
          booking.status === "CHECKED_OUT" ? (
            <Typography fontWeight={600}>
              {booking.room.name} - {booking.room.roomType.name}
            </Typography>
          ) : (
            <EntityPickerField
              name="roomId"
              value={booking.room.id}
              onChange={(field, value) => {
                if (value && value !== booking.room.id) {
                  onChangeRoom(Number(value));
                }
              }}
              onOpenPicker={onOpenPicker}
              isMoreOptions={isMoreOptions}
              placeholder="Chọn phòng trống"
              size="small"
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name} - {room.roomType.name}
                </MenuItem>
              ))}
            </EntityPickerField>
          )}
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Trạng thái</Typography>
          <Typography fontWeight={600}>
            {getLabelStatus[booking.status]}
          </Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Check-in</Typography>
          <Typography fontWeight={600}>
            {new Date(booking.checkIn).toLocaleDateString()}
          </Typography>
        </Grid>

        <Grid size={6}>
          <Typography variant="body2">Check-out</Typography>
          <Typography fontWeight={600}>
            {new Date(booking.checkOut).toLocaleDateString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

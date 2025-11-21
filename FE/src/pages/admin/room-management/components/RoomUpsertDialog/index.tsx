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
  Paper,
} from "@mui/material";
import type { Amenity, RoomType } from "@constant/types";

type FormValues = {
  name: string;
  roomTypeId: number | "";
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  roomTypes: RoomType[];
  values: FormValues;
  onChange: (field: keyof FormValues, value: any) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function RoomUpsertDialog({
  open,
  mode,
  roomTypes,
  values,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  const selectedType = roomTypes.find(
    (r) => r.id === Number(values.roomTypeId)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>
        {mode === "create" ? "Thêm phòng" : "Chi tiết phòng"}
      </DialogTitle>

      <DialogContent>
        {/* Tên phòng */}
        <TextField
          fullWidth
          placeholder="Nhập tên phòng"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          size="small"
        />

        {/* Loại phòng + thông tin tóm tắt */}
        <Paper variant="outlined" sx={{ mt: 1.5, p: 1.5, borderRadius: 2 }}>
          <Typography sx={{ mb: 0.5 }} fontWeight={600}>
            Loại phòng
          </Typography>
          <Select
            fullWidth
            size="small"
            value={values.roomTypeId}
            onChange={(e) =>
              onChange("roomTypeId", Number(e.target.value) || "")
            }
          >
            {roomTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>

          {selectedType && (
            <Grid
              container
              sx={{ mt: 1.5, bgcolor: "#F5F8F7", p: 1.5, borderRadius: 4 }}
            >
              <Grid size={4}>
                <Typography variant="caption" color="text.secondary">
                  Giá tiền
                </Typography>
                <Typography fontWeight={600}>
                  {Number(selectedType.basePrice).toLocaleString("vi-VN")} VND
                </Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="caption" color="text.secondary">
                  Số người
                </Typography>
                <Typography fontWeight={600}>
                  {selectedType.capacity}
                </Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="caption" color="text.secondary">
                  Dịch vụ
                </Typography>
                {selectedType.amenities?.map((amenity: Amenity) => (
                  <Typography key={amenity.label} variant="body2">
                    {amenity.label}
                  </Typography>
                ))}
              </Grid>
            </Grid>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="contained" color="primary" onClick={onSubmit}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

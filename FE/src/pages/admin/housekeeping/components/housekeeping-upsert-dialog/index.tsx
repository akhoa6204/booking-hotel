import EntityPickerField from "@components/entity-picker-field";
import { DialogMode, Room, Employee } from "@constant/types";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { TaskForm } from "../../useHouseKeeping";
import { formatDate, formatDateInput } from "@utils/format";

interface Props {
  open: boolean;
  mode: DialogMode;
  form: TaskForm;
  onChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  canEdit: boolean;
  optionsRoom: Room[];
  isMoreRoom: boolean;
  onOpenPickerRoom: () => void;
  optionsStaff: Employee[];
  isMoreStaff: boolean;
  onOpenPickerStaff: () => void;
  loadingTask: boolean;
  notHouseKeeping: boolean;
}
const HousekeepingUpsertDialog = ({
  open,
  mode,
  form,
  onChange,
  onSubmit,
  onClose,
  canEdit,
  optionsRoom,
  isMoreRoom,
  onOpenPickerRoom,
  optionsStaff,
  isMoreStaff,
  onOpenPickerStaff,
  loadingTask,
  notHouseKeeping,
}: Props) => {
  const title =
    mode === "create"
      ? "Tạo mới nhiệm vụ phòng"
      : "Xem chi tiết nhiệm vụ phòng";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography fontWeight={700}>{title}</Typography>
        <Box component={"form"} onSubmit={onSubmit}>
          <DialogContent>
            {loadingTask ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid size={6}>
                  <InputLabel shrink>Số phòng</InputLabel>
                  <EntityPickerField
                    name="roomId"
                    value={form.roomId}
                    onChange={(field, value) => {
                      onChange(field, value);
                    }}
                    onOpenPicker={onOpenPickerRoom}
                    isMoreOptions={isMoreRoom}
                    placeholder="Chọn phòng"
                    size="small"
                    disabled={!canEdit || !notHouseKeeping}
                  >
                    {optionsRoom.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.name} - {room.roomType.name}
                      </MenuItem>
                    ))}
                  </EntityPickerField>
                </Grid>
                <Grid size={6}>
                  <InputLabel shrink>Nhân viên</InputLabel>
                  <EntityPickerField
                    name="staffId"
                    value={form.staffId}
                    onChange={(field, value) => {
                      onChange(field, value);
                    }}
                    onOpenPicker={onOpenPickerStaff}
                    isMoreOptions={isMoreStaff}
                    placeholder="Chọn nhân viên"
                    size="small"
                    disabled={!canEdit || !notHouseKeeping}
                  >
                    {optionsStaff.map((staff) => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.fullName} - {staff.staff.position}
                      </MenuItem>
                    ))}
                  </EntityPickerField>
                </Grid>
                <Grid size={6}>
                  <InputLabel shrink>Loại nhiệm vụ</InputLabel>
                  <TextField
                    select
                    size="small"
                    value={form.type}
                    onChange={(e) => onChange("type", e.target.value)}
                    fullWidth
                    disabled={!canEdit || !notHouseKeeping}
                  >
                    <MenuItem value={"DEFAULT"} disabled>
                      Chọn loại nhiệm vụ
                    </MenuItem>
                    <MenuItem value={"CLEANING"}>Dọn phòng</MenuItem>
                    <MenuItem value={"INSPECTION"}>Kiểm tra phòng</MenuItem>
                  </TextField>
                </Grid>

                {mode !== "create" && (
                  <>
                    <Grid size={6}>
                      <InputLabel shrink>Trạng thái</InputLabel>
                      <TextField
                        select
                        size="small"
                        onChange={(e) => onChange("status", e.target.value)}
                        disabled={!canEdit}
                        value={form.status}
                        fullWidth
                      >
                        <MenuItem value="PENDING">Đang đợi</MenuItem>
                        <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                        <MenuItem value="DONE">Hoàn thành</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={6}>
                      <InputLabel shrink>Ngày tạo</InputLabel>
                      <TextField
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDateInput(form.updatedAt)}
                        disabled
                      />
                    </Grid>
                    <Grid size={12}>
                      <InputLabel shrink>Ghi chú buồng phòng</InputLabel>
                      <TextField
                        fullWidth
                        size="small"
                        value={form.note}
                        multiline
                        minRows={3}
                        placeholder="Nhập ghi chú buồng phòng..."
                        onChange={(e) => onChange("note", e.target.value)}
                        disabled={!canEdit}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Hủy
            </Button>
            {canEdit && (
              <Button variant="contained" type="submit">
                Lưu
              </Button>
            )}
          </DialogActions>
        </Box>
      </DialogTitle>
    </Dialog>
  );
};

export default HousekeepingUpsertDialog;

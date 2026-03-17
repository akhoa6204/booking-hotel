import EntityPickerField from "@components/entity-picker-field";
import { Employee } from "@constant/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Grid,
  InputLabel,
} from "@mui/material";
import { formatTime } from "@utils/format";

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  shifts: Shift[];
  workDate: string;
  staff: { id: number; fullName: string };
  shiftId: string | number;
  onChangeShift: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  options: any[];
  isMoreOptions: boolean;
  seeMore: () => void;
}

export default function CreateShiftDialog({
  open,
  onClose,
  shifts,
  staff,
  workDate,
  shiftId,
  onChangeShift,
  onSubmit,
  options,
  isMoreOptions,
  seeMore,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo lịch làm</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent className="flex flex-col gap-4 mt-2">
          <Grid container spacing={2}>
            <Grid size={6}>
              <InputLabel shrink>Nhân viên</InputLabel>
              {/* <TextField value={staff.fullName} fullWidth disabled /> */}
              <EntityPickerField
                name="staffId"
                value={staff.id}
                options={options}
                isMoreOptions={isMoreOptions}
                onChange={(name, value) => {
                  const employee = options.find((e) => e.id === value);

                  onChangeShift("staff", {
                    id: value,
                    fullName: employee?.fullName || employee?.name || "",
                  });
                }}
                onOpenPicker={seeMore}
                placeholder="Chọn nhân viên"
              />
            </Grid>
            <Grid size={6}>
              <InputLabel shrink>Ngày làm</InputLabel>
              <TextField
                value={workDate}
                fullWidth
                type="date"
                onChange={(e) => onChangeShift("workDate", e.target.value)}
              />
            </Grid>

            <Grid size={12}>
              <InputLabel shrink>Ca làm</InputLabel>
              <TextField
                select
                value={shiftId}
                onChange={(e) =>
                  onChangeShift("shiftId", Number(e.target.value))
                }
                fullWidth
              >
                {shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name} {formatTime(shift.startTime)} -{" "}
                    {formatTime(shift.endTime)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Ca làm */}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Huỷ
          </Button>
          <Button variant="contained" type="submit">
            Tạo lịch
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

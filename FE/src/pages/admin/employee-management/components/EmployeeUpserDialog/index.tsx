import { DialogMode, Employee } from "@constant/types";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  InputLabel,
} from "@mui/material";
import { EmployeeForm } from "../../useEmployee";

interface Props {
  open: boolean;
  mode: DialogMode;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: string, value: string | boolean) => void;
  employeeData: EmployeeForm;
}
const EmployeeUpserDialog = ({
  open,
  mode,
  onClose,
  onSave,
  onChange,
  employeeData,
}: Props) => {
  const isViewMode = mode === "edit";
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component={"form"} onSubmit={onSave}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {!isViewMode ? "Thêm nhân sự" : "Chi tiết nhân sự"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink>Họ và tên</InputLabel>
              <TextField
                fullWidth
                size="small"
                name="fullName"
                value={employeeData.fullName}
                onChange={(e) => onChange("fullName", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink>Số điện thoại</InputLabel>
              <TextField
                fullWidth
                size="small"
                name="phone"
                value={employeeData.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </Grid>

            <Grid size={12}>
              <InputLabel shrink>Email</InputLabel>
              <TextField
                fullWidth
                size="small"
                type="email"
                name="email"
                value={employeeData.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink>Chức vụ</InputLabel>
              <TextField
                select
                fullWidth
                size="small"
                value={employeeData.position}
                // onChange={(e) =>
                //   onChange("eligibleFor", e.target.value as CustomerEligibility)
                // }
                onChange={(e) => onChange("position", e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="MANAGER">Quản lý</option>
                <option value="RECEPTION">Lễ tân</option>
                <option value="HOUSEKEEPING">Dọn dẹp</option>
              </TextField>
            </Grid>
            {isViewMode && (
              <>
                <Grid size={{ xs: 6, md: 3 }}>
                  <InputLabel shrink>Quyền quản trị</InputLabel>
                  <Switch
                    name="isAdmin"
                    checked={employeeData.isAdmin}
                    disabled
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 3 }}>
                  <InputLabel shrink>Trạng thái</InputLabel>
                  <Switch
                    name="isActive"
                    checked={employeeData.isActive}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onChange("isActive", e.target.checked)}
                    disabled={employeeData.isAdmin}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Hủy
          </Button>

          <Button type="submit" variant="contained">
            {!isViewMode ? "Tạo nhân sự" : "Lưu"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
export default EmployeeUpserDialog;

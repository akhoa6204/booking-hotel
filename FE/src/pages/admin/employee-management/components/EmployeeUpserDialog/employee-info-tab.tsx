import { Grid, TextField, Switch, InputLabel } from "@mui/material";
import { EmployeeForm } from "../../useEmployee";

interface Props {
  employeeData: EmployeeForm;
  onChange: (field: string, value: string | boolean) => void;
  isViewMode: boolean;
}

const EmployeeInfoTab = ({ employeeData, onChange, isViewMode }: Props) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <InputLabel shrink>Họ và tên</InputLabel>
        <TextField
          fullWidth
          size="small"
          value={employeeData.fullName || ""}
          onChange={(e) => onChange("fullName", e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <InputLabel shrink>Số điện thoại</InputLabel>
        <TextField
          fullWidth
          size="small"
          value={employeeData.phone || ""}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </Grid>

      <Grid size={12}>
        <InputLabel shrink>Email</InputLabel>
        <TextField
          fullWidth
          size="small"
          type="email"
          value={employeeData.email || ""}
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
            <Switch checked={employeeData.isAdmin} disabled />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <InputLabel shrink>Trạng thái</InputLabel>
            <Switch
              checked={employeeData.isActive}
              onChange={(e) => onChange("isActive", e.target.checked)}
              disabled={employeeData.isAdmin}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default EmployeeInfoTab;

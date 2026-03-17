import { Grid, TextField, InputLabel } from "@mui/material";

interface Props {
  onChange: (field: string, value: string | boolean) => void;
}

const EmployeePasswordTab = ({ onChange }: Props) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <InputLabel shrink>Mật khẩu mới</InputLabel>
        <TextField
          fullWidth
          size="small"
          type="password"
          placeholder="Nhập mật khẩu mới để reset"
          onChange={(e) => onChange("newPassword", e.target.value)}
        />
      </Grid>
    </Grid>
  );
};

export default EmployeePasswordTab;

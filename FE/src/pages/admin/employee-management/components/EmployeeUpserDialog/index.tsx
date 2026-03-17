import { DialogMode, Employee } from "@constant/types";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  InputLabel,
} from "@mui/material";
import { EmployeeForm } from "../../useEmployee";
import EmployeeInfoTab from "./employee-info-tab";
import EmployeePasswordTab from "./employee-password-tab";

interface Props {
  open: boolean;
  mode: DialogMode;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: string, value: string | boolean) => void;
  employeeData: EmployeeForm;
  tab?: "info" | "password";
  onTabChange?: (tab: "info" | "password") => void;
}
const EmployeeUpserDialog = ({
  open,
  mode,
  onClose,
  onSave,
  onChange,
  employeeData,
  tab = "password",
  onTabChange,
}: Props) => {
  const isViewMode = mode === "edit";
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component={"form"} onSubmit={onSave}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {!isViewMode ? "Thêm nhân sự" : "Chi tiết nhân sự"}
        </DialogTitle>
        {isViewMode && (
          <Tabs value={tab} onChange={(_, value) => onTabChange(value)}>
            <Tab label="Thông tin" value="info" />
            <Tab label="Mật khẩu" value="password" />
          </Tabs>
        )}
        <DialogContent>
          {tab === "info" && (
            <EmployeeInfoTab
              employeeData={employeeData}
              onChange={onChange}
              isViewMode={isViewMode}
            />
          )}

          {tab === "password" && <EmployeePasswordTab onChange={onChange} />}
        </DialogContent>
        <DialogActions>
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

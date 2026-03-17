import { Search } from "@mui/icons-material";
import { Box, InputAdornment, Stack, TextField } from "@mui/material";
import useEmployee from "./useEmployee";
import EmployeeTable from "./components/EmployeeTable";
import {
  Pager,
  GlobalSnackbar,
  EntityPickerDialog,
  TitlePageAdmin,
} from "@components";
import EmployeeUpserDialog from "./components/EmployeeUpserDialog";

const EmployeeManagement = () => {
  const {
    employees,
    isLoading,
    filters,
    onChangeFilters,
    meta,
    onEdit,
    onToggle,
    employeeForm,
    isLoadingEmployee,
    onCloseDialog,
    onOpenDialog,
    alert,
    closeSnackbar,
    dialogState,
    onChangeEmployeeForm,
    onSubmitEmployeeForm,
    tab,
    onChangeTab,
  } = useEmployee();
  return (
    <Box>
      <TitlePageAdmin
        title="Quản lý nhân sự"
        subTitle="Xem và quản lý nhân sự khách sạn"
        onAdd={() => onOpenDialog("create")}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo tên, email, số điện thoại…"
          value={filters.q}
          onChange={(e) => onChangeFilters("q", e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <EmployeeTable
        rows={employees}
        isLoading={isLoading}
        onEdit={onEdit}
        onToggle={onToggle}
      />
      <EmployeeUpserDialog
        open={dialogState.open}
        mode={dialogState.mode}
        onClose={onCloseDialog}
        onSave={onSubmitEmployeeForm}
        onChange={onChangeEmployeeForm}
        employeeData={employeeForm}
        tab={tab}
        onTabChange={onChangeTab}
      />

      {meta?.totalPages > 1 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pager
            page={meta.page}
            totalPages={meta.totalPages}
            onChange={(page) => onChangeFilters("page", page)}
          />
        </Box>
      )}
      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </Box>
  );
};

export default EmployeeManagement;

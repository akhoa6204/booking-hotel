import Title from "@components/Title";
import useShift from "./useShift";
import WeeklyScheduleCalendar from "./components/weekly-schedule-calendar";
import { GlobalSnackbar, EntityPickerDialog } from "@components";
import CreateShiftDialog from "./components/create-shift-dialog";
import {
  Box,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, ArrowForward, Search } from "@mui/icons-material";
import dayjs from "dayjs";

const ShiftManagement = () => {
  const {
    shifts,
    shiftDefinitions,
    nextWeek,
    prevWeek,
    start,
    end,
    onRemove,
    canEdit,
    alert,
    closeSnackbar,

    form,
    openDialog,
    closeDialog,
    onSubmit,
    open,
    onChangeForm,
    filters,
    setFilters,

    options,
    meta,

    selectedId,

    openEntityPickerDialog,
    openPicker,
    closePicker,
    select,

    onChangePage,
    onSearchEmployee,
    filtersEmployee,
    isLoadingEmployees,
  } = useShift();
  return (
    <>
      <Title
        title="Quản lý lịch phân ca nhân viên"
        subTitle="Theo dõi và sắp xếp ca làm việc theo tuần"
        onAdd={() => openDialog(null)}
      />
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        alignItems="center"
        justifyContent={"center"}
      >
        {canEdit && (
          <>
            <TextField
              fullWidth
              size="small"
              sx={{ flex: 1, minWidth: 240 }}
              value={filters.q}
              onChange={(e) =>
                setFilters((pre) => ({ ...pre, q: e.target.value }))
              }
              placeholder="Tìm theo tên nhân viên…"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              defaultValue="ALL"
              sx={{ width: 160 }}
              value={filters.position}
              onChange={(e) =>
                setFilters((pre) => ({ ...pre, position: e.target.value }))
              }
            >
              <MenuItem value="ALL">Tất cả vị trí</MenuItem>
              <MenuItem value="RECEPTION">Lễ tân</MenuItem>
              <MenuItem value="HOUSEKEEPING">Buồng phòng</MenuItem>
              <MenuItem value="MANAGER">Quản lý</MenuItem>
            </TextField>
          </>
        )}

        <Box display="flex" justifyContent="center" sx={{ flexShrink: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 3,
              borderRadius: "999px",
              border: "2px solid #24AB70",
            }}
          >
            <IconButton size="small" onClick={prevWeek} color="primary">
              <ArrowBack fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 15,
              }}
              color="primary"
            >
              {dayjs(start).format("DD/MM/YYYY")} -{" "}
              {dayjs(end).format("DD/MM/YYYY")}
            </Typography>

            <IconButton size="small" onClick={nextWeek} color="primary">
              <ArrowForward fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Stack>
      <WeeklyScheduleCalendar
        shifts={shifts}
        start={start}
        onRemove={onRemove}
        onAdd={openDialog}
        canEdit={canEdit}
      />
      <CreateShiftDialog
        shifts={shiftDefinitions}
        open={open}
        onClose={closeDialog}
        workDate={form.workDate}
        shiftId={form.shiftId}
        onChangeShift={onChangeForm}
        staff={form.staff}
        onSubmit={onSubmit}
        options={options}
        isMoreOptions={meta?.totalPages > 1}
        seeMore={openPicker}
      />

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />

      <EntityPickerDialog
        open={openEntityPickerDialog}
        data={options}
        selectedId={selectedId}
        onClose={closePicker}
        title="Danh sách nhân viên"
        columns={[
          { label: "Họ và tên", name: "fullName" },
          { label: "Số điện thoại", name: "phone" },
          { label: "Email", name: "email" },
          { label: "Vị trí", name: "staff.position" },
        ]}
        onSelect={(row) => {
          select(row);
          onChangeForm("staff", row);
        }}
        onPageChange={onChangePage}
        totalPages={meta?.totalPages}
        page={meta?.page}
        onSearch={onSearchEmployee}
        q={filtersEmployee.q}
        loading={isLoadingEmployees}
      />
    </>
  );
};

export default ShiftManagement;

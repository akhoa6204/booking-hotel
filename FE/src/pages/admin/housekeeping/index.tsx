import Title from "@components/Title";
import useHouseKeeping from "./useHouseKeeping";
import HousekeepingTaskTable from "./components/housekeeping-task-table";
import { EntityPickerDialog, GlobalSnackbar, Pager } from "@components";
import {
  Box,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { TaskStatus } from "@constant/types";
import HousekeepingUpsertDialog from "./components/housekeeping-upsert-dialog";

const HouseKeeping = () => {
  const {
    tasks,
    meta,
    notHouseKeeping,
    filters,
    onChangeFilter,
    handleChangePage,
    handleUpdateTask,

    alert,
    closeSnackbar,

    open,
    mode,
    onOpen,
    form,
    onChange,
    onSubmit,
    onClose,
    canEditForm,
    optionsRoom,
    isMoreRoom,
    openPickerRoom,
    optionsStaff,
    isMoreStaff,
    openPickerStaff,
    loadingTask,

    rooms,
    openEntityPickerRoomDialog,
    onClosePickerRoom,
    selectedIdRoom,
    filtersRoom,
    onSearchRoom,
    metaRooms,
    onPageChangeRoom,
    selectRoom,
    loadingRooms,

    staffs,
    openEntityPickerStaffDialog,
    onClosePickerStaff,
    selectedIdStaff,
    filtersStaff,
    onSearchStaff,
    metaStaffs,
    onPageChangeStaff,
    selectStaff,
    loadingStaffs,
  } = useHouseKeeping();

  return (
    <>
      <Title
        title="Quản lý buồng phòng"
        subTitle="Tình trạng phòng & lịch dọn phòng"
        onAdd={notHouseKeeping ? () => onOpen("create") : undefined}
      />
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid size={9}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm theo số phòng, người thực hiện,..."
            value={filters.q ?? ""}
            onChange={(e) => onChangeFilter("q", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={3}>
          <TextField
            select
            size="small"
            value={filters.status}
            onChange={(e) =>
              onChangeFilter("status", e.target.value as TaskStatus | "ALL")
            }
            fullWidth
          >
            <MenuItem value={"ALL"}>Tất cả</MenuItem>
            <MenuItem value={"PENDING"}>Chưa thực hiện</MenuItem>
            <MenuItem value={"IN_PROGRESS"}>Đang thực hiện</MenuItem>
            <MenuItem value={"DONE"}>Đã xong</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <HousekeepingTaskTable
        tasks={tasks}
        onStatusChange={handleUpdateTask}
        onRowClick={onOpen}
      />
      {meta?.totalPages > 1 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pager
            page={meta?.page || 1}
            totalPages={meta?.totalPages || 1}
            onChange={handleChangePage}
          />
        </Box>
      )}
      <HousekeepingUpsertDialog
        open={open}
        mode={mode}
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        onClose={onClose}
        canEdit={canEditForm}
        optionsRoom={optionsRoom}
        isMoreRoom={isMoreRoom}
        onOpenPickerRoom={openPickerRoom}
        optionsStaff={optionsStaff}
        isMoreStaff={isMoreStaff}
        onOpenPickerStaff={openPickerStaff}
        loadingTask={loadingTask}
        notHouseKeeping={notHouseKeeping}
      />

      <EntityPickerDialog
        data={rooms}
        onClose={onClosePickerRoom}
        open={openEntityPickerRoomDialog}
        selectedId={selectedIdRoom}
        title={"Xem danh sách phòng"}
        columns={[
          { label: "Tên phòng", name: "name" },
          { label: "Loại phòng", name: "roomType.name" },
          { label: "Sức chứa", name: "roomType.capacity" },
        ]}
        q={filtersRoom.q}
        onSearch={onSearchRoom}
        page={metaRooms?.page}
        totalPages={metaRooms?.totalPages}
        onPageChange={onPageChangeRoom}
        onSelect={(row) => {
          selectRoom(row);
          onChange("roomId", row.id);
        }}
        loading={loadingRooms}
      />

      <EntityPickerDialog
        data={staffs}
        onClose={onClosePickerStaff}
        open={openEntityPickerStaffDialog}
        selectedId={selectedIdStaff}
        title="Danh sách nhân viên"
        columns={[
          { label: "Họ và tên", name: "fullName" },
          { label: "Số điện thoại", name: "phone" },
          { label: "Email", name: "email" },
          { label: "Vị trí", name: "staff.position" },
        ]}
        onSelect={(row) => {
          selectStaff(row);
          onChange("staffId", row.id);
        }}
        q={filtersStaff.q}
        onSearch={onSearchStaff}
        page={metaStaffs?.page}
        totalPages={metaStaffs?.totalPages}
        onPageChange={onPageChangeStaff}
        loading={loadingStaffs}
      />

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default HouseKeeping;

import { TitlePageAdmin as Title } from "@components";
import { Search } from "@mui/icons-material";
import {
  Alert,
  Box,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import RoomTypeTable from "./components/room-type-table";
import Pager from "@components/pager";
import useRoomTypesManagement from "./useRoomTypesManagement";
import RoomTypeUpsertView from "./components/RoomTypeUpsertView";

const RoomTypeManagement = () => {
  const {
    roomTypes,
    isLoading,
    meta,
    filters,
    handleSearch,
    handleChangePage,

    // dialog / form từ hook
    dialogState,
    form,
    onChange,
    onCreateDialog,
    onEditDialog,
    onClose,
    onSubmit,
    handleDeleteRoomType,

    // amenities master
    amenityOptions,

    // image handlers (đã thêm trong hook)
    onPickFiles,
    onRemoveImage,
    alert,
    closeSnackbar,
  } = useRoomTypesManagement();

  const totalPages = Math.max(
    1,
    Math.ceil((meta?.total ?? 0) / (meta?.limit ?? filters.limit))
  );
  const currentPage = meta?.page ?? filters.page;

  return (
    <Box>
      <Title
        title="Quản lý loại phòng"
        subTitle="Quản lý danh sách loại phòng và trạng thái"
        onAdd={onCreateDialog}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm loại phòng…"
          value={filters.q}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <RoomTypeTable
        rows={roomTypes}
        loading={isLoading}
        onEdit={(id) => onEditDialog(id)}
        onDelete={handleDeleteRoomType}
      />

      {totalPages > 1 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pager
            page={currentPage}
            totalPages={totalPages}
            onChange={handleChangePage}
          />
        </Box>
      )}

      <RoomTypeUpsertView
        open={dialogState.open}
        mode={dialogState.mode ?? "create"}
        values={form}
        onChange={onChange}
        amenityOptions={amenityOptions}
        onPickFiles={onPickFiles}
        onRemoveImage={onRemoveImage}
        onClose={onClose}
        onSubmit={onSubmit}
      />
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity as any}
          onClose={closeSnackbar}
          variant="filled"
          sx={{
            backgroundColor:
              alert.severity === "success" ? "#24AB70" : "#D32F2F",
            color: "#fff",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoomTypeManagement;

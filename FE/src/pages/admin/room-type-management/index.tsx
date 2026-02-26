import { GlobalSnackbar, TitlePageAdmin as Title } from "@components";
import { Search } from "@mui/icons-material";
import { Box, InputAdornment, Stack, TextField } from "@mui/material";
import RoomTypeTable from "./components/room-type-table";
import Pager from "@components/pager";
import useRoomTypesManagement from "./useRoomTypesManagement";
import RoomTypeUpsertView from "./components/RoomTypeUpsertView";

const RoomTypeManagement = () => {
  const {
    showAddButton,

    roomTypes,
    isLoading,
    meta,
    filters,
    handleSearch,
    handleChangePage,

    dialogState,
    form,
    onChange,
    onCreateDialog,
    onEditDialog,
    onClose,
    onSubmit,
    handleDeleteRoomType,

    amenityOptions,

    onPickFiles,
    onRemoveImage,
    alert,
    closeSnackbar,
  } = useRoomTypesManagement();

  const totalPages = Math.max(
    1,
    Math.ceil((meta?.total ?? 0) / (meta?.limit ?? filters.limit)),
  );
  const currentPage = meta?.page ?? filters.page;

  return (
    <>
      <Box>
        <Title
          title="Quản lý loại phòng"
          subTitle="Quản lý danh sách loại phòng và trạng thái"
          onAdd={onCreateDialog}
          showAddButton={showAddButton}
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
          mode={dialogState.mode}
          values={form}
          onChange={onChange}
          amenityOptions={amenityOptions}
          onPickFiles={onPickFiles}
          onRemoveImage={onRemoveImage}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </Box>

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default RoomTypeManagement;

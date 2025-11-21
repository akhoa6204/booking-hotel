import {
  Box,
  Grid,
  TextField,
  Typography,
  Stack,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { TitlePageAdmin as Title } from "@components";
import RoomTabs from "./components/RoomTabs";
import RoomUpsertDialog from "./components/RoomUpsertDialog";
import RoomCard from "./components/RoomCard";
import RoomCardSkeleton from "@components/room-card-skeleton";
import Pager from "@components/pager";
import useRoomManagement from "./useRoomManagement";

export default function RoomManagement() {
  const {
    rooms,
    isRoomLoading,
    paginationMetadata,
    roomTypeLabels,
    activeTabValue,
    handleChangeTab,
    handleChangePage,
    filters,
    handleSearchByName,

    // dialog & form
    isDialogOpen,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    formValues,
    handleFormChange,
    submitUpsert,
    roomTypes,
    toggleActive,
  } = useRoomManagement();

  const totalPages = Math.max(
    1,
    Math.ceil(
      (paginationMetadata?.total ?? 0) / (paginationMetadata?.limit ?? 6)
    )
  );
  const currentPage = paginationMetadata?.page ?? 1;

  return (
    <Box>
      <Title
        onAdd={openCreateDialog}
        title="Quản lý phòng"
        subTitle="Quản lý danh sách phòng và trạng thái"
      />

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm phòng theo tên…"
          value={filters.searchKeyword ?? ""}
          onChange={(e) => handleSearchByName(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <RoomTabs
        types={roomTypeLabels}
        value={activeTabValue}
        onChange={handleChangeTab}
      />

      <Box my={3} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
        {isRoomLoading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={4}>
                <RoomCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : rooms.length === 0 ? (
          <Typography align="center" color="text.secondary">
            Không có phòng nào
          </Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {rooms.map((room) => (
                <Grid key={room.id} size={4}>
                  <RoomCard
                    room={room}
                    onEdit={() => openEditDialog(room.id)}
                    onToggleDelete={toggleActive}
                  />
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Box mt={2} display="flex" justifyContent="center">
                <Pager
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={handleChangePage}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      <RoomUpsertDialog
        open={isDialogOpen}
        // mode tạm dựa vào name: create khi form mới (name rỗng), edit khi đã load room
        mode={formValues && formValues.name ? "edit" : "create"}
        roomTypes={roomTypes}
        values={formValues}
        onChange={handleFormChange}
        onSubmit={submitUpsert}
        onClose={closeDialog}
      />
    </Box>
  );
}

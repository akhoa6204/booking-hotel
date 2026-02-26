import { Box, Stack, TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";
import { GlobalSnackbar, TitlePageAdmin as Title } from "@components";
import Pager from "@components/pager";
import PromotionsTable from "./components/PromotionsTable";
import usePromotionManagement from "./usePromotionManagement";
import PromotionUpsertDialog from "./components/PromotionUpsertDialog";

export default function PromotionManagement() {
  const {
    rows,
    totalPages,
    currentPage,
    isLoading,

    // query
    filters,
    handleSearch,
    handleChangePage,

    // dialog + form
    dialogState,
    form,
    onChangeField,
    onCreateDialog,
    onEditDialog,
    onClose,
    onSubmit,

    // optional
    handleDeletePromotion,
    roomTypes = [],

    alert,
    closeSnackbar,
  } = usePromotionManagement();

  return (
    <Box>
      <Title
        title="Quản lý khuyến mãi"
        subTitle="Quản lý mã khuyến mãi dịch vụ"
        onAdd={onCreateDialog}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo tên/mã khuyến mãi…"
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

      <PromotionsTable
        rows={rows}
        loading={isLoading}
        onEdit={(id) => onEditDialog(id)}
        onDelete={handleDeletePromotion}
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

      <PromotionUpsertDialog
        open={dialogState.open}
        mode={dialogState.mode}
        values={form}
        roomTypes={roomTypes}
        onChange={onChangeField}
        onClose={onClose}
        onSubmit={onSubmit}
      />
      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </Box>
  );
}

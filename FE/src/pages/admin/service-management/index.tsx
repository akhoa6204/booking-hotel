import { GlobalSnackbar, Pager, TitlePageAdmin } from "@components/index";
import { Box, InputAdornment, Stack, TextField } from "@mui/material";
import useService from "./useService";
import ServiceTable from "./components/service-table";
import ServiceDialog from "./components/service-dialog";
import { Search } from "@mui/icons-material";

const ServiceManagement = () => {
  const {
    services,
    meta,
    service,

    loadingServices,
    loadingServiceDetail,
    creatingService,
    updatingService,
    removingService,

    filters,
    onChangeFilter,

    dialog,
    openDialog,
    onEdit,
    closeDialog,
    selectedId,
    setSelectedId,

    form,
    onChangeField,
    onSubmit,

    createService,
    updateService,
    removeServiceHandler,

    alert,
    closeSnackbar,
  } = useService();

  return (
    <>
      <TitlePageAdmin
        title="Quản lý dịch vụ khách sạn"
        subTitle="Quản lý và theo dõi các dịch vụ được cung cấp cho khách lưu trú"
        onAdd={() => openDialog("create")}
      />
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo tên dịch vụ,.."
          value={filters.q}
          onChange={(e) => onChangeFilter("q", e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <ServiceTable
        data={services}
        loading={loadingServices}
        onDelete={removeServiceHandler}
        onRowClick={onEdit}
      />

      <ServiceDialog
        open={dialog.open}
        mode={dialog.mode}
        form={form}
        loading={loadingServiceDetail}
        onClose={closeDialog}
        onChange={onChangeField}
        onSubmit={onSubmit}
      />

      {meta?.totalPages > 1 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pager
            page={meta?.page}
            totalPages={meta?.totalPages}
            onChange={(page) => onChangeFilter("page", page)}
          />
        </Box>
      )}
      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default ServiceManagement;

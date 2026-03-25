import { Box, InputAdornment, Stack, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import Title from "@components/Title";
import BookingCreateDialog from "./components/booking-create-dialog";
import { EntityPickerDialog, Loading, Pager } from "@components";
import useBookingManagement from "./useBookingManagement";
import GlobalSnackbar from "@components/GlobalSnackbar";
import BookingTable from "./components/booking-table";
import BookingViewDialog from "./components/booking-view-dialog";
import CancelBookingDialog from "./components/CancelBookingDialog";

export default function BookingManagement() {
  const {
    dialog,
    openDialog,
    closeDialog,
    bookingForm,
    handleChangeBookingForm,
    availableRooms,
    nights,
    pricing,
    loadingRooms,
    quoting,
    creating,
    handleApplyPromo,
    handleCreateBooking,
    roomTypes,
    bookings,
    loadingBookingList,
    alert,
    closeSnackbar,
    pagination,
    handleSearchBooking,
    handleChangePage,
    selectedBookingId,
    bookingDetail,
    loadingCheckInDetail,
    handleCheckIn,
    handleCheckout,
    handleCancelled,
    showLoadingOverlay,
    services,
    onView,
    filterService,
    onChangePageService,
    onChangeTabService,
    metaServices,
    bookingViewTab,
    onChangeBookingViewTab,
    invoiceDetail,
    loadingInvoiceDetail,
    updateService,
    removeService,
    handleCreateTask,
    housekeepingDetail,
    loadingHousekeepingDetail,
    handleUpdateTask,
    formViewBooking,
    onChangeFormViewBooking,
    onSubmitFormViewBooking,

    openEntityPickerDialog,
    closePickerHandler,
    openPickerHandler,
    onChangePage,
    onSearch,
    selectedId,
    metaAvailabelRooms,
    select,
    filtersAvailableRooms,

    housekeepingList,
    loadingHousekeepingList,
    onSelectTask,
    selectedTaskId,
    onChangePageHousekeeping,
    metaHousekeepingList,

    cancelOpen,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    cancelReason,
    setCancelReason,
  } = useBookingManagement();

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const currentPage = pagination?.page ?? 1;
  return (
    <Box>
      <Title
        title="Quản lý đặt phòng"
        subTitle="Quản lý danh sách đặt phòng và trạng thái khách hàng"
        onAdd={() => openDialog("CREATE")}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo mã đặt phòng, tên khách hàng"
          onChange={handleSearchBooking}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <BookingTable
        items={bookings}
        isLoading={loadingBookingList}
        onView={onView}
      />

      {totalPages > 1 && (
        <Box mt={1.5} display="flex" justifyContent="center">
          <Pager
            page={currentPage}
            totalPages={totalPages}
            onChange={handleChangePage}
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}

      <BookingCreateDialog
        open={dialog.type === "CREATE" && dialog.open}
        onClose={closeDialog}
        values={bookingForm}
        onChange={handleChangeBookingForm}
        roomTypes={roomTypes}
        rooms={availableRooms}
        nights={nights}
        pricing={pricing}
        loadingRooms={loadingRooms}
        quoting={quoting}
        submitting={creating}
        onApplyPromo={handleApplyPromo}
        onSubmit={handleCreateBooking}
        onOpenPicker={openPickerHandler}
        isMoreOptions={metaAvailabelRooms?.totalPages > 1}
      />
      {selectedBookingId && !loadingCheckInDetail ? (
        <BookingViewDialog
          booking={bookingDetail}
          open={dialog.type === "VIEW" && dialog.open}
          services={services}
          onClose={closeDialog}
          filterService={filterService}
          onChangePageService={onChangePageService}
          onChangeTabService={onChangeTabService}
          metaServices={metaServices}
          bookingViewTab={bookingViewTab}
          onChangeBookingViewTab={onChangeBookingViewTab}
          invoice={invoiceDetail}
          loadingInvoiceDetail={loadingInvoiceDetail}
          updateService={updateService}
          removeService={removeService}
          onCheckIn={handleCheckIn}
          onOpenCancelDialog={openCancelDialog}
          onCheckOut={handleCheckout}
          onCreateTask={handleCreateTask}
          housekeepingDetail={housekeepingDetail}
          loadingHousekeepingDetail={loadingHousekeepingDetail}
          onUpdateTask={handleUpdateTask}
          formViewBooking={formViewBooking}
          onChangeFormViewBooking={onChangeFormViewBooking}
          onSubmitFormViewBooking={onSubmitFormViewBooking}
          housekeepingList={housekeepingList}
          loadingHousekeepingList={loadingHousekeepingList}
          onSelectTask={onSelectTask}
          selectedTaskId={selectedTaskId}
          onChangePageHousekeeping={onChangePageHousekeeping}
          metaHousekeepingList={metaHousekeepingList}
        />
      ) : null}

      {showLoadingOverlay ? (
        <Loading content="Đang xử lý thanh toán, vui lòng chờ..." />
      ) : null}

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />

      <EntityPickerDialog
        open={openEntityPickerDialog}
        data={availableRooms}
        selectedId={selectedId}
        onClose={closePickerHandler}
        title="Danh sách phòng trống"
        columns={[
          { label: "Tên phòng", name: "name" },
          { label: "Loại phòng", name: "roomType.name" },
          { label: "Sức chứa", name: "roomType.capacity" },
        ]}
        onSelect={(row) => {
          select(row);
          handleChangeBookingForm("roomId", row.id);
        }}
        onPageChange={onChangePage}
        totalPages={metaAvailabelRooms?.totalPages}
        page={metaAvailabelRooms?.page}
        onSearch={onSearch}
        q={filtersAvailableRooms.q}
        loading={loadingRooms}
      />

      {cancelOpen && (
        <CancelBookingDialog
          open={cancelOpen}
          onClose={closeCancelDialog}
          onConfirm={confirmCancel}
          reason={cancelReason}
          onChangeReason={setCancelReason}
        />
      )}
    </Box>
  );
}

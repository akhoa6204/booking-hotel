import {
  Booking,
  HouseKeepingTask,
  Invoice,
  PaymentMethod,
  Service,
  ServiceType,
  TaskStatus,
  TaskType,
} from "@constant/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { useMemo } from "react";
import { ServiceFilter } from "../../useBookingManagement";
import { Meta } from "@constant/response/paginated";
import dayjs from "dayjs";
import BookingInfoTab from "./booking-info-tab";
import BookingServiceTab from "./booking-service-tab";
import BookingPaymentTab from "./booking-payment-tab";
import HousekeepingTab from "./housekeeping-tab";
type Props = {
  open: boolean;
  booking: Booking;
  invoice: Invoice;
  services: Service[];
  onClose: () => void;
  onCheckIn?: (id: number, remain: number) => void;
  onCheckOut?: (id: number, remain: number) => void;
  onCancel: (bookingId: number) => void;
  filterService: ServiceFilter;
  onChangePageService: (page: number) => void;
  onChangeTabService: (tab: ServiceType) => void;
  metaServices?: Meta;
  bookingViewTab: "info" | "service" | "payment" | "housekeeping";
  onChangeBookingViewTab: (value: "info" | "service" | "payment") => void;
  loadingInvoiceDetail: boolean;
  updateService: (
    id: number,
    services: { serviceId: number; quantity: number }[],
  ) => void;
  removeService: (id: number, removeItemIds: number[]) => void;
  onCreateTask: (bookingId: number, roomId: number, type: TaskType) => void;
  housekeepingList: HouseKeepingTask[];
  housekeepingDetail: HouseKeepingTask;
  loadingHousekeepingDetail: boolean;
  loadingHousekeepingList: boolean;
  selectedTaskId?: number;
  onSelectTask: (id: number) => void;
  onUpdateTask: (id: number, status?: TaskStatus, note?: string) => void;
  formViewBooking: { method: PaymentMethod };
  onChangeFormViewBooking: (field: "method", value: PaymentMethod) => void;
  onSubmitFormViewBooking: (e: React.FormEvent<HTMLFormElement>) => void;
  onChangePageHousekeeping: (page: number) => void;
  metaHousekeepingList: Meta;
};

function TabPanel({
  children,
  value,
  tab,
}: {
  children: React.ReactNode;
  value: string;
  tab: string;
}) {
  if (value !== tab) return null;

  return <Box>{children}</Box>;
}

export default function BookingViewDialog({
  open,
  booking,
  invoice,
  services,
  onClose,
  onCheckIn,
  onCheckOut,
  onCancel,
  filterService,
  onChangePageService,
  onChangeTabService,
  metaServices,
  bookingViewTab,
  onChangeBookingViewTab,
  loadingInvoiceDetail,
  updateService,
  removeService,
  onCreateTask,
  housekeepingDetail,
  loadingHousekeepingDetail,
  selectedTaskId,
  housekeepingList,
  loadingHousekeepingList,
  onSelectTask,
  onUpdateTask,
  formViewBooking,
  onChangeFormViewBooking,
  onSubmitFormViewBooking,
  onChangePageHousekeeping,
  metaHousekeepingList,
}: Props) {
  const showServiceTab = !["CONFIRMED", "PENDING", "CANCELLED"].includes(
    booking.status,
  );

  const renderActionButton = () => {
    const now = dayjs();
    const checkInTime = dayjs(booking.checkIn).hour(14).minute(0).second(0); // 14:00
    const checkOutTime = dayjs(booking.checkOut).hour(12).minute(0).second(0); // 12:00

    const inWindow = !now.isBefore(checkInTime) && now.isBefore(checkOutTime); // [14:00, 12:00)
    const beforeCheckIn = now.isBefore(checkInTime);
    const afterCheckOut = !now.isBefore(checkOutTime); // now >= 12:00

    if (booking.status === "CONFIRMED" && inWindow) {
      return (
        <Stack direction={"row"} gap={1}>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onCancel(booking.id)}
            sx={{
              borderRadius: 1.5,
              py: 1,
              px: 2,
            }}
          >
            Hủy phòng
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() =>
              booking.id &&
              invoice &&
              onCheckIn(booking.id, invoiceSummary.remain)
            }
            sx={{
              borderRadius: 1.5,
              py: 1,
              px: 2,
            }}
          >
            Check-in
          </Button>
        </Stack>
      );
    }

    if (booking.status === "CONFIRMED" && beforeCheckIn) {
      return (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onCancel(booking.id)}
            sx={{
              borderRadius: 1.5,
              py: 1,
              px: 2,
            }}
          >
            Hủy phòng
          </Button>

          <Button
            size="small"
            variant="outlined"
            disabled
            sx={{
              color: "#888",
              borderColor: "#ccc",
              bgcolor: "#f5f5f5",
              borderRadius: 1.5,
              py: 1,
              px: 2,
              "&.Mui-disabled": {
                color: "#aaa",
                borderColor: "#ddd",
                bgcolor: "#fafafa",
              },
            }}
          >
            Chưa đến giờ
          </Button>
        </Box>
      );
    }

    if (booking.status === "CONFIRMED" && afterCheckOut) {
      return (
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled
          sx={{
            borderRadius: 1.5,
            py: 1,
            px: 2,
          }}
        >
          Quá hạn
        </Button>
      );
    }

    if (booking.status === "CHECKED_IN") {
      // Đã tạo task kiểm tra nhưng chưa hoàn tất
      if (!booking.inspected && booking.inspectionTaskId) {
        return (
          <Button
            size="small"
            variant="outlined"
            color="info"
            disabled
            sx={{
              borderRadius: 1.5,
              py: 1,
              px: 2,
            }}
          >
            Phòng đang được kiểm tra
          </Button>
        );
      }

      // Chưa có task kiểm tra -> cho phép tạo
      if (!booking.inspected && !booking.inspectionTaskId) {
        return (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() =>
              booking.id &&
              booking.room.id &&
              onCreateTask(booking.id, booking.room.id, "INSPECTION")
            }
            sx={{
              borderRadius: 1.5,
              py: 1,
              px: 2,
            }}
          >
            Kiểm tra phòng
          </Button>
        );
      }

      return (
        <Button
          size="small"
          variant="outlined"
          color="warning"
          onClick={() => onCheckOut(booking.id, invoiceSummary.remain)}
          sx={{
            borderRadius: 1.5,
            py: 1,
            px: 2,
          }}
        >
          Check-out
        </Button>
      );
    }

    if (booking.status === "CHECKED_OUT") {
      return (
        <Button
          size="small"
          variant="outlined"
          color="success"
          sx={{ pointerEvents: "none", borderRadius: 1.5, py: 1, px: 2 }}
        >
          Hoàn tất
        </Button>
      );
    }

    if (booking.status === "CANCELLED") {
      return (
        <Button
          size="small"
          variant="outlined"
          color="error"
          sx={{ pointerEvents: "none", borderRadius: 1.5, py: 1, px: 2 }}
        >
          Đã hủy phòng
        </Button>
      );
    }

    return null;
  };

  const invoiceSummary = useMemo(() => {
    if (!invoice) return;

    const subtotal = Number(invoice.subtotal || 0);
    const discount = Number(invoice.discount || 0);
    const tax = Number(invoice?.tax || 0);
    const total = subtotal - discount + tax;
    const paid = Number(invoice.paidAmount || 0);
    const remain = total - paid;

    const roomAmount = Array.isArray(invoice.items)
      ? invoice.items
          .filter((i: any) => i.type === "ROOM")
          .reduce(
            (sum: number, i: any) =>
              sum + Number(i.unitPrice || 0) * Number(i.quantity || 1),
            0,
          )
      : 0;

    const serviceAmount = Array.isArray(invoice.items)
      ? invoice.items
          .filter((i: any) => i.type !== "ROOM")
          .reduce(
            (sum: number, i: any) =>
              sum + Number(i.unitPrice || 0) * Number(i.quantity || 1),
            0,
          )
      : 0;

    return {
      subtotal,
      discount,
      tax,
      roomAmount,
      serviceAmount,
      total,
      paid,
      remain,
    };
  }, [invoice]);
  const disablePay = useMemo(() => {
    const now = dayjs();
    const checkOutTime = dayjs(booking.checkOut).hour(12).minute(0).second(0);

    const isOverdue =
      booking.status !== "CHECKED_IN" &&
      booking.status !== "CHECKED_OUT" &&
      !now.isBefore(checkOutTime);

    return (
      booking.status === "CANCELLED" ||
      (invoiceSummary?.remain ?? 0) <= 0 ||
      isOverdue
    );
  }, [booking.status, booking.checkOut, invoiceSummary]);
  const canEdit = useMemo(() => {
    const now = dayjs();
    const checkOutTime = dayjs(booking.checkOut).hour(12).minute(0).second(0);

    const isOverdue =
      booking.status !== "CHECKED_IN" &&
      booking.status !== "CHECKED_OUT" &&
      !now.isBefore(checkOutTime);

    if (booking.status !== "CHECKED_IN") return false;
    if (isOverdue) return false;

    return true;
  }, [booking.status, booking.checkOut]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Xem chi tiết BK{booking.id.toString().padStart(4, "0")}
      </DialogTitle>

      <Tabs
        value={bookingViewTab}
        onChange={(_, v) => onChangeBookingViewTab(v)}
      >
        <Tab label="Thông tin" value="info" />
        <Tab label="Dịch vụ" value="service" />
        <Tab label="Buồng phòng" value="housekeeping" />
        <Tab label="Thanh toán" value="payment" />
      </Tabs>
      <DialogContent dividers>
        {/* Thông tin */}
        <TabPanel value={bookingViewTab} tab="info">
          <BookingInfoTab booking={booking} />
        </TabPanel>
        {/* Dịch vụ */}
        <TabPanel value={bookingViewTab} tab="service">
          <BookingServiceTab
            services={services}
            invoice={invoice}
            filterService={filterService}
            metaServices={metaServices}
            loadingInvoiceDetail={loadingInvoiceDetail}
            onChangePageService={onChangePageService}
            onChangeTabService={onChangeTabService}
            updateService={updateService}
            removeService={removeService}
            canEdit={canEdit}
          />
        </TabPanel>

        <TabPanel value={bookingViewTab} tab="housekeeping">
          <HousekeepingTab
            tasks={housekeepingList}
            selectedTask={housekeepingDetail}
            selectedTaskId={selectedTaskId}
            loadingDetail={loadingHousekeepingDetail}
            loadingList={loadingHousekeepingList}
            onSelectTask={onSelectTask}
            onUpdateTask={onUpdateTask}
            canEdit={canEdit}
            onChangePageHousekeeping={onChangePageHousekeeping}
            metaHousekeepingList={metaHousekeepingList}
            onCreateTask={() =>
              onCreateTask(booking.id, booking.room.id, "CLEANING")
            }
          />
        </TabPanel>

        <TabPanel value={bookingViewTab} tab="payment">
          <BookingPaymentTab
            invoice={invoice}
            invoiceSummary={invoiceSummary}
            loadingInvoiceDetail={loadingInvoiceDetail}
            formViewBooking={formViewBooking}
            onChangeFormViewBooking={onChangeFormViewBooking}
            onSubmitFormViewBooking={onSubmitFormViewBooking}
            disablePay={disablePay}
          />
        </TabPanel>
      </DialogContent>

      <DialogActions>{renderActionButton()}</DialogActions>
    </Dialog>
  );
}

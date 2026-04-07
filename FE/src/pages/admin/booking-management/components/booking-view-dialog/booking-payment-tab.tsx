import {
  Invoice,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from "@constant/types";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  TextField,
  MenuItem,
} from "@mui/material";
import { fmtVND, formatDate } from "@utils/format";
import dayjs from "dayjs";

type Props = {
  invoice: Invoice;
  invoiceSummary: any;
  loadingInvoiceDetail: boolean;
  formViewBooking: { method: PaymentMethod };
  onChangeFormViewBooking: (field: "method", value: PaymentMethod) => void;
  onSubmitFormViewBooking: (e: React.FormEvent<HTMLFormElement>) => void;
  disablePay?: boolean;
};
const getLabelStatus: Partial<Record<PaymentStatus, string>> = {
  PAID: "Thành công",
  FAILED: "Thất bại",
};
const getLabelMethod: Record<PaymentMethod, string> = {
  CASH: "Tiền mặt",
  CARD: "Thẻ",
  TRANSFER: "Chuyển khoản",
};
const getLabelType: Record<PaymentType, string> = {
  DEPOSIT: "Đặt cọc",
  ROOM: "Thanh toán tiền phòng",
  SERVICE: "Thanh toán dịch vụ",
};
export default function BookingPaymentTab({
  invoice,
  invoiceSummary,
  loadingInvoiceDetail,
  formViewBooking,
  onChangeFormViewBooking,
  onSubmitFormViewBooking,
  disablePay = true,
}: Props) {
  return (
    <>
      {loadingInvoiceDetail || !invoiceSummary ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          minHeight={300}
          spacing={2}
        >
          <CircularProgress size={28} />
          <Typography variant="body2">
            Đang tải thông tin thanh toán...
          </Typography>
        </Stack>
      ) : (
        <Box display="flex" gap={3}>
          {/* Payment history */}
          <Paper sx={{ flex: 2, p: 1.5 }}>
            <Typography fontWeight={600} mb={2}>
              Lịch sử thanh toán
            </Typography>

            <List>
              {invoice?.payments?.map((p) => (
                <ListItem
                  key={p.id}
                  divider
                  sx={{
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "#f7f7f7",
                    },
                  }}
                >
                  <Box
                    width="100%"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {/* Left */}
                    <Box>
                      <Typography fontWeight={600}>
                        {getLabelMethod[p.method]}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {getLabelType[p.type]}{" "}
                        {p.paidAt &&
                          `• ${formatDate(p.paidAt, { withTime: true, withWeekday: true })}`}
                      </Typography>
                    </Box>

                    {/* Right */}
                    <Box textAlign="right">
                      <Typography fontWeight={700} fontSize={15}>
                        {fmtVND(p.amount)}đ
                      </Typography>

                      <Box
                        sx={{
                          mt: 0.5,
                          px: 1.2,
                          py: 0.3,
                          borderRadius: 1,
                          fontSize: 12,
                          fontWeight: 600,
                          display: "inline-block",
                          bgcolor: p.status === "PAID" ? "#2E90FA0d" : "#FFF4E5",
                          color: p.status === "PAID" ? "#2E90FA" : "#ED6C02",
                        }}
                      >
                        {getLabelStatus[p.status]}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Payment summary */}
          <Paper
            sx={{ flex: 1, p: 1.5 }}
            component={"form"}
            onSubmit={onSubmitFormViewBooking}
          >
            <Typography fontWeight={600} mb={2}>
              Tổng thanh toán
            </Typography>

            <Stack spacing={1}>
              <Row label="Tiền phòng" value={invoiceSummary.roomAmount} />
              <Row label="Dịch vụ" value={invoiceSummary.serviceAmount} />

              <Divider sx={{ my: 1 }} />

              <Row label="Tạm tính" value={invoiceSummary.subtotal} />

              <Row
                label="Giảm giá"
                value={-invoiceSummary.discount}
                color="error.main"
              />

              <Row label="Thuế" value={invoiceSummary.tax} />

              <Divider sx={{ my: 1 }} />

              <Row
                label="Tổng cộng"
                value={invoiceSummary.total}
                fontWeight={700}
              />

              <Row
                label="Đã thanh toán"
                value={invoiceSummary.paid}
                color="success.main"
              />

              <Row
                label="Còn lại"
                value={invoiceSummary.remain}
                color="warning.main"
                fontWeight={700}
              />
            </Stack>

            <Box mt={1}>
              <Typography variant="body2" mb={0.5}>
                Phương thức thanh toán
              </Typography>

              <TextField
                select
                size="small"
                value={formViewBooking.method}
                onChange={(e) =>
                  onChangeFormViewBooking(
                    "method",
                    e.target.value as PaymentMethod,
                  )
                }
                fullWidth
              >
                <MenuItem value={"CASH"}>Tiền mặt</MenuItem>
                <MenuItem value={"TRANSFER"}>Thanh toán online</MenuItem>
              </TextField>
            </Box>
            <Button
              fullWidth
              variant="contained"
              disabled={disablePay}
              sx={{
                mt: 1,
                bgcolor: "#2E90FA",
                "&:hover": { bgcolor: "#1e8f5c" },
              }}
              type="submit"
            >
              Thanh toán
            </Button>
          </Paper>
        </Box>
      )}
    </>
  );
}

function Row({
  label,
  value,
  color,
  fontWeight,
}: {
  label: string;
  value: number;
  color?: string;
  fontWeight?: number;
}) {
  return (
    <Box display="flex" justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Typography color={color} fontWeight={fontWeight}>
        {fmtVND(value)}đ
      </Typography>
    </Box>
  );
}

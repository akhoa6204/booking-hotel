import { Box, Paper, Stack, Typography } from "@mui/material";

type PaymentSummaryCardProps = {
  total: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN") + " VND";

const PaymentSummaryCard = ({ total }: PaymentSummaryCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ py: 2, px: 2.5, bgcolor: "#F5F8F7" }}
      >
        Thanh toán
      </Typography>
      <Box sx={{ py: 2, px: 2.5 }}>
        {/* Hàng tổng cộng */}
        <Stack direction="row" justifyContent="space-between" mb={1.25}>
          <Typography>Tổng cộng</Typography>
          <Typography>{formatCurrency(total)}</Typography>
        </Stack>

        {/* Hàng thanh toán hôm nay */}
        <Stack direction="row" justifyContent="space-between" mb={0.75}>
          <Box>
            <Typography fontWeight={600}>Thanh toán hôm nay</Typography>
          </Box>
          <Typography fontWeight={600}>{formatCurrency(150000)}</Typography>
        </Stack>

        {/* Hàng thanh toán khi nhận phòng */}
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography fontWeight={600}>Thanh toán khi nhận phòng</Typography>
          </Box>
          <Typography fontWeight={600}>
            {formatCurrency(total - 150000)}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};

export default PaymentSummaryCard;

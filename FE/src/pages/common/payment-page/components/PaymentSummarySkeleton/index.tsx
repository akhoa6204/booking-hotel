import { Box, Paper, Stack, Skeleton } from "@mui/material";

const PaymentSummarySkeleton = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      {/* Title */}
      <Box sx={{ py: 2, px: 2.5, bgcolor: "#F5F8F7" }}>
        <Skeleton variant="text" width={120} height={28} />
      </Box>

      <Box sx={{ py: 2, px: 2.5 }}>
        {/* Tổng cộng */}
        <Stack direction="row" justifyContent="space-between" mb={1.25}>
          <Skeleton variant="text" width={90} height={24} />
          <Skeleton variant="text" width={120} height={24} />
        </Stack>

        {/* Thanh toán hôm nay */}
        <Stack direction="row" justifyContent="space-between" mb={0.75}>
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="text" width={100} height={24} />
        </Stack>

        {/* Thanh toán khi nhận phòng */}
        <Stack direction="row" justifyContent="space-between">
          <Skeleton variant="text" width={200} height={24} />
          <Skeleton variant="text" width={120} height={24} />
        </Stack>
      </Box>
    </Paper>
  );
};

export default PaymentSummarySkeleton;

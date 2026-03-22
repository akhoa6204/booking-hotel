import { Box, Paper, Stack, Typography, Divider } from "@mui/material";

interface PriceSummaryProps {
  originalPrice: number;
  discount: number;
  discountLabel?: string;
  discountNote?: string;
}

const formatVND = (n: number) => n.toLocaleString("vi-VN") + " VND";

const PriceSummaryCard: React.FC<PriceSummaryProps> = ({
  originalPrice,
  discount,
  discountLabel = "Ưu đãi",
  discountNote = "Hãy nhập mã giảm giá nếu bạn sỡ hữu",
}) => {
  const finalPrice = originalPrice - discount;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E0E0E0",
        mb: 2.5,
      }}
    >
      <Box py={3.5} px={2.5}>
        {/* Title */}
        <Typography variant="h6" fontWeight={700} mb={2}>
          Tóm tắt giá
        </Typography>

        {/* Giá gốc */}
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography>Giá gốc</Typography>
          <Typography>{formatVND(originalPrice)}</Typography>
        </Stack>

        {/* Discount */}
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography>{discountLabel}</Typography>
            <Typography variant="caption" color="text.secondary">
              {discountNote}
            </Typography>
          </Box>
          <Typography color="error">- {formatVND(discount)}</Typography>
        </Stack>
      </Box>

      {/* Divider */}
      <Divider />

      {/* Total */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ py: 1.5, px: 2.5, bgcolor: "#F5F8F7" }}
      >
        <Typography fontWeight={700} color="error" sx={{ fontSize: 18 }}>
          Tổng cộng
        </Typography>
        <Typography fontWeight={700} color="error" sx={{ fontSize: 18 }}>
          {formatVND(finalPrice)}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default PriceSummaryCard;

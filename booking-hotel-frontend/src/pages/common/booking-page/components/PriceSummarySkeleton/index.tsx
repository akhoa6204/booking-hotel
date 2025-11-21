import { Box, Paper, Stack, Skeleton, Divider } from "@mui/material";

const PriceSummarySkeleton = () => {
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
        <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />

        {/* Giá gốc */}
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="text" width={100} height={24} />
        </Stack>

        {/* Discount */}
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="text" width={150} height={18} />
          </Box>
          <Skeleton variant="text" width={80} height={24} />
        </Stack>
      </Box>

      <Divider />

      {/* Total */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ py: 1.5, px: 2.5, bgcolor: "#F5F8F7" }}
      >
        <Skeleton variant="text" width={100} height={28} />
        <Skeleton variant="text" width={120} height={28} />
      </Stack>
    </Paper>
  );
};

export default PriceSummarySkeleton;

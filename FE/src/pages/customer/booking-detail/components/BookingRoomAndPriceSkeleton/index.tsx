import { Box, Divider, Skeleton, Stack, Typography } from "@mui/material";

const BookingRoomAndPriceSkeleton = () => {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        p: 3,
        bgcolor: "white",
      }}
    >
      {/* Top: ảnh + info + tổng giá */}
      <Stack direction="row" spacing={3} mb={3}>
        {/* Ảnh phòng */}
        <Skeleton
          variant="rectangular"
          width={260}
          height={180}
          sx={{ borderRadius: 2, flexShrink: 0 }}
        />

        {/* Thông tin + giá */}
        <Stack sx={{ flex: 1 }} spacing={1} justifyContent="space-between">
          <Box flex={1}>
            {/* Tên phòng */}
            <Skeleton variant="text" width={200} height={24} />
            <Skeleton variant="text" width={160} height={20} sx={{ mb: 1 }} />

            {/* Ngày + khách */}
            <Stack spacing={0.8}>
              <Skeleton variant="text" width={220} height={18} />
              <Skeleton variant="text" width={180} height={18} />
            </Stack>
          </Box>

          {/* Tổng giá bên phải */}
          <Box textAlign="right" minWidth={200}>
            <Skeleton
              variant="text"
              width={80}
              height={18}
              sx={{ ml: "auto", mb: 0.5 }}
            />
            <Skeleton
              variant="text"
              width={140}
              height={28}
              sx={{ ml: "auto" }}
            />
          </Box>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Summary giá chi tiết */}
      <Stack spacing={1}>
        {/* Tổng tiền */}
        <Stack direction="row" justifyContent="space-between">
          <Skeleton variant="text" width={100} height={18} />
          <Skeleton variant="text" width={120} height={18} />
        </Stack>

        {/* Khuyến mãi */}
        <Stack direction="row" justifyContent="space-between">
          <Skeleton variant="text" width={90} height={18} />
          <Skeleton variant="text" width={120} height={18} />
        </Stack>

        {/* Đã thanh toán */}
        <Stack direction="row" justifyContent="space-between">
          <Skeleton variant="text" width={110} height={18} />
          <Skeleton variant="text" width={120} height={18} />
        </Stack>

        {/* Dòng trả phần còn lại (optional) */}
        <Stack direction="row" justifyContent="space-between" mt={1}>
          <Skeleton variant="text" width={180} height={20} />
          <Skeleton variant="text" width={130} height={20} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default BookingRoomAndPriceSkeleton;

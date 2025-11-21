import { Box, Skeleton, Stack } from "@mui/material";

const BookingCardSkeleton = () => {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e5e5e5",
        bgcolor: "#F5F8F7",
        alignItems: "stretch",
      }}
    >
      {/* Ảnh phòng */}
      <Skeleton
        variant="rectangular"
        sx={{
          width: 220,
          height: 150,
          flexShrink: 0,
          borderRadius: 2,
        }}
      />

      {/* Phần nội dung */}
      <Box sx={{ flex: 1, display: "flex" }}>
        <Stack
          spacing={2.5}
          justifyContent="space-between"
          sx={{ flex: 1, height: "100%" }}
        >
          {/* Tên phòng + info */}
          <Box>
            {/* Tên phòng */}
            <Skeleton variant="text" width={180} height={28} />
            {/* Loại phòng */}
            <Skeleton
              variant="text"
              width={140}
              height={22}
              sx={{ mt: 0.5, mb: 1.5 }}
            />

            {/* Ngày nhận/trả + số khách */}
            <Stack spacing={0.75}>
              <Skeleton variant="text" width={220} height={20} />
              <Skeleton variant="text" width={160} height={20} />
            </Stack>
          </Box>

          {/* Tổng giá + nút hành động */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Skeleton variant="text" width={60} height={18} />
              <Skeleton variant="text" width={140} height={26} />
            </Box>

            {/* Nút hành động (Hủy / Đánh giá / Đặt lại) */}
            <Skeleton
              variant="rectangular"
              width={120}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default BookingCardSkeleton;

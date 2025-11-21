import {
  Paper,
  Box,
  Typography,
  Divider,
  Stack,
  Skeleton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BlockIcon from "@mui/icons-material/Block";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const BookingSummaryCardSkeleton = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
      variant="outlined"
    >
      {/* Header */}
      <Box sx={{ py: 2, px: 2.5, bgcolor: "#F5F8F7" }}>
        <Skeleton variant="text" width={160} height={28} />
      </Box>

      <Divider />

      <Box sx={{ py: 2, px: 2.5 }}>
        {/* Tên phòng */}
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 1 }} />

        {/* Ngày nhận/trả phòng */}
        <Box
          sx={{
            borderRadius: 2,
            bgcolor: "#F5F8F7",
            p: 2,
            mb: 1.5,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Nhận phòng */}
            <Box>
              <Skeleton variant="text" width={70} height={18} />
              <Skeleton variant="text" width={120} height={22} />
              <Skeleton variant="text" width={100} height={16} />
            </Box>

            {/* Số đêm */}
            <Box textAlign="center">
              <Skeleton variant="text" width={60} height={18} />
              <Skeleton variant="text" width={24} height={24} />
            </Box>

            {/* Trả phòng */}
            <Box textAlign="right">
              <Skeleton variant="text" width={70} height={18} />
              <Skeleton variant="text" width={120} height={22} />
              <Skeleton variant="text" width={100} height={16} />
            </Box>
          </Stack>
        </Box>

        {/* Số khách + chính sách */}
        <Stack spacing={0.5} mb={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <PersonIcon sx={{ fontSize: 18, color: "action.disabled" }} />
            <Skeleton variant="text" width={80} height={18} />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.75}>
            <BlockIcon sx={{ fontSize: 18, color: "action.disabled" }} />
            <Skeleton variant="text" width={220} height={18} />
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default BookingSummaryCardSkeleton;

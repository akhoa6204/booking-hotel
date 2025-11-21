// DepositNoticeCard.tsx
import { Box, Paper, Typography, Stack } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { fmtVND } from "@utils/format";

const DepositNoticeCard = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        mb: 2,
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={0.75}>
        Bạn cần thanh toán số tiền cọc phòng
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={1.5}>
        Bạn cần thanh toán số tiền cọc phòng là{" "}
        <Box component="span" fontWeight={600}>
          {fmtVND(150000)} VND.
        </Box>{" "}
        Phần còn lại sẽ được thanh toán trực tiếp tại khách sạn.
      </Typography>

      <Stack direction="row" alignItems="center" spacing={1.25} mb={1}>
        <WarningAmberRoundedIcon sx={{ color: "#F6A800" }} />
        <Typography variant="subtitle2" fontWeight={600}>
          Lưu ý
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={0.5}>
        Bạn chỉ được phép huỷ trong vòng{" "}
        <Box component="span" fontWeight={600}>
          24h
        </Box>{" "}
        kể từ thời điểm thanh toán cọc phòng.
      </Typography>

      <Box component="ul" sx={{ pl: 3, m: 0, mt: 0.5 }}>
        <li>
          <Typography variant="body2" color="text.secondary">
            <Box component="span" fontWeight={600}>
              Huỷ trước 24h:
            </Box>{" "}
            hoàn lại 100% tiền cọc
          </Typography>
        </li>
        <li>
          <Typography variant="body2" color="text.secondary">
            <Box component="span" fontWeight={600}>
              Không đến nhận phòng:
            </Box>{" "}
            mất tiền cọc ({fmtVND(150000)} VND)
          </Typography>
        </li>
      </Box>
    </Paper>
  );
};

export default DepositNoticeCard;

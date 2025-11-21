import { CheckInImg } from "@assets/images";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { diffNights } from "@utils/format";
import dayjs from "dayjs";

const VacationCountdown = ({ checkIn }: { checkIn: string }) => {
  const countdown = diffNights(
    dayjs().toDate().toString(),
    dayjs(checkIn).toDate().toString()
  );

  return (
    <Paper elevation={0} sx={{ mb: 1.5 }}>
      <Stack
        sx={{ px: 2.5, py: 4 }}
        alignItems="center"
        justifyContent={"center"}
      >
        {countdown > 0 ? (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontSize: 24, textAlign: " center", mb: 2 }}
          >
            Còn{" "}
            <Typography
              color="primary"
              component="span"
              sx={{
                fontWeight: 600,
                fontSize: 24,
              }}
            >
              {countdown}
            </Typography>{" "}
            ngày nữa cho kỳ nghỉ sắp tới của bạn!
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 24 }}>
            Chúc bạn có kỳ nghỉ tuyệt vời!
          </Typography>
        )}

        <Box
          component="img"
          src={CheckInImg}
          sx={{ width: 100, mt: 3, objectFit: "cover" }}
        />
      </Stack>
      <Divider />
      <Box sx={{ px: 2, py: 2.5, textAlign: "right" }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ py: 0.5, px: 2, borderRadius: 1 }}
        >
          Hủy phòng
        </Button>
      </Box>
    </Paper>
  );
};

export default VacationCountdown;

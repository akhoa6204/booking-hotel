import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  onChangeReason: (value: string) => void;
};

const CancelBookingDialog = ({
  open,
  onClose,
  onConfirm,
  reason,
  onChangeReason,
}: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, p: 0, overflow: "visible" },
      }}
    >
      {/* nút X */}
      <IconButton
        size="small"
        onClick={onConfirm}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ pt: 5, pb: 3, px: 4 }}>
        {/* icon tròn đỏ */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "#FFE5E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ErrorOutlineIcon sx={{ color: "#E53935" }} />
          </Box>
        </Box>

        {/* tiêu đề + mô tả */}
        <Typography
          align="center"
          fontWeight={600}
          mb={0.5}
          variant="subtitle1"
        >
          Xác nhận hủy đặt phòng
        </Typography>
        <Typography
          align="center"
          variant="body2"
          color="text.secondary"
          mb={3}
        >
          Vui lòng cho chúng tôi biết lý do bạn muốn hủy đặt phòng này.
        </Typography>

        {/* lý do hủy */}
        <Stack spacing={1} mb={3}>
          <Typography variant="body2" fontWeight={500}>
            Lý do hủy phòng{" "}
            <Box component="span" sx={{ color: "error.main" }}>
              *
            </Box>
          </Typography>
          <TextField
            multiline
            minRows={3}
            fullWidth
            placeholder="Nhập lý do hủy phòng của bạn…"
            value={reason}
            onChange={(e) => onChangeReason(e.target.value)}
          />
        </Stack>

        {/* nút hành động */}
        <Stack spacing={1.2}>
          <Button
            variant="contained"
            fullWidth
            onClick={onConfirm}
            sx={{
              bgcolor: "#E53935",
              textTransform: "none",
              "&:hover": { bgcolor: "#C62828" },
            }}
          >
            Xác nhận hủy
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            sx={{
              textTransform: "none",
              bgcolor: "#fafafa",
            }}
          >
            Giữ đặt phòng
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingDialog;

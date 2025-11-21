import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  comment: string;
  canEdit?: boolean;
  onChange?: (value: string) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitting?: boolean;
};

const ReviewCommentSection = ({
  comment,
  canEdit = false,
  onChange,
  onCancel,
  onSubmit,
  submitting,
}: Props) => {
  return (
    <Paper sx={{ p: 2.5 }} elevation={0}>
      <Typography variant="h6" fontWeight={600} mb={1}>
        Nhận xét của bạn
      </Typography>

      <TextField
        multiline
        minRows={5}
        fullWidth
        placeholder="Hãy chia sẻ trải nghiệm của bạn tại khách sạn."
        value={comment}
        onChange={(e) => onChange?.(e.target.value)}
        InputProps={{
          readOnly: !canEdit,
        }}
      />

      <Box
        mt={1}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        {canEdit && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={submitting}
              sx={{ textTransform: "none" }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={onSubmit}
              sx={{ textTransform: "none" }}
            >
              Gửi đánh giá
            </Button>
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default ReviewCommentSection;

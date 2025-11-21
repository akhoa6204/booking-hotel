import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export interface EditableFieldProps {
  value: string | null;
  input: string;
  isEditing: boolean;
  saving?: boolean;
  onClickEdit: () => void;
  onChangeInput: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export interface InfoTabProps {
  name: EditableFieldProps;
  email: EditableFieldProps;
  phone: EditableFieldProps;
}

const labelBoxSx = {
  flexShrink: 0,
  minWidth: 140,
};

const EditableField = (
  label: string,
  field: EditableFieldProps,
  helperText?: string
) => {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={2} py={2}>
      <Box sx={labelBoxSx}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>

      <Box flex={1}>
        {!field.isEditing ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography fontWeight={500}>
                {field.value || "Chưa cập nhật"}
              </Typography>
              {helperText && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {helperText}
                </Typography>
              )}
            </Box>

            <Typography
              color="primary"
              fontWeight={600}
              fontSize={14}
              sx={{ cursor: "pointer" }}
              onClick={field.onClickEdit}
            >
              Chỉnh sửa
            </Typography>
          </Stack>
        ) : (
          <Box>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              {label} <small className="text-red-500">*</small>
            </Typography>

            <TextField
              size="small"
              fullWidth
              value={field.input}
              onChange={(e) => field.onChangeInput(e.target.value)}
            />

            {helperText && (
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {helperText}
              </Typography>
            )}

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              mt={2}
            >
              <Button
                variant="outlined"
                onClick={field.onCancel}
                disabled={field.saving}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={field.onSave}
                disabled={field.saving}
              >
                Lưu thay đổi
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Stack>
  );
};

const InfoTab = ({ name, email, phone }: InfoTabProps) => {
  return (
    <Box>
      {EditableField("Tên", name)}
      <Divider />

      {EditableField(
        "Địa chỉ email",
        email,
        "Email dùng để đăng nhập và nhận thông báo."
      )}
      <Divider />

      {EditableField(
        "Số điện thoại",
        phone,
        "Khách sạn sẽ liên hệ với bạn qua số này nếu cần."
      )}
    </Box>
  );
};

export default InfoTab;

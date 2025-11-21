import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export interface ChangePasswordTabProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  loading?: boolean;
  errorMessage?: string;

  onChangeField: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const labelSx = {
  flexShrink: 0,
  minWidth: 180,
};

const ChangePasswordTab = ({
  currentPassword,
  newPassword,
  confirmPassword,
  loading,
  errorMessage,
  onChangeField,
  onSubmit,
}: ChangePasswordTabProps) => {
  const fields = [
    {
      label: "Mật khẩu hiện tại",
      name: "currentPassword",
      value: currentPassword,
    },
    {
      label: "Mật khẩu mới",
      name: "newPassword",
      value: newPassword,
    },
    {
      label: "Nhập lại mật khẩu mới",
      name: "confirmPassword",
      value: confirmPassword,
    },
  ];

  return (
    <Box>
      {fields.map((f, idx) => (
        <Box key={f.name}>
          <Stack direction="row" spacing={2} alignItems="center" py={2.5}>
            <Box sx={labelSx}>
              <Typography variant="body2" color="text.secondary">
                {f.label}
              </Typography>
            </Box>

            <Box flex={1}>
              <TextField
                type="password"
                name={f.name}
                value={f.value}
                onChange={onChangeField}
                size="small"
                fullWidth
                autoComplete="new-password"
              />
            </Box>
          </Stack>

          {idx < fields.length - 1 && <Divider />}
        </Box>
      ))}

      {errorMessage && (
        <Typography variant="body2" color="error" mt={1}>
          {errorMessage}
        </Typography>
      )}

      <Box textAlign="right" mt={3}>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          Lưu thay đổi
        </Button>
      </Box>
    </Box>
  );
};

export default ChangePasswordTab;

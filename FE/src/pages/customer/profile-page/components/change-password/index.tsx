import {
  Box,
  Button,
  Divider,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Form } from "../../useAccountProfilePage";

export interface Props {
  form: Pick<Form, "password" | "newPassword" | "confirmPassword">;
  errors: Partial<
    Record<
      keyof Pick<Form, "password" | "newPassword" | "confirmPassword">,
      string
    >
  >;
  onChangeField: (
    field: keyof Pick<Form, "password" | "newPassword" | "confirmPassword">,
    value: any,
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ChangePasswordTab = ({
  form,
  onChangeField,
  onSubmit,
  errors,
}: Props) => {
  const fields = [
    {
      label: "Mật khẩu hiện tại",
      name: "password",
      value: form.password,
    },
    {
      label: "Mật khẩu mới",
      name: "newPassword",
      value: form.newPassword,
    },
    {
      label: "Nhập lại mật khẩu mới",
      name: "confirmPassword",
      value: form.confirmPassword,
    },
  ];

  return (
    <Box component={"form"} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {fields.map((f, idx) => (
          <Box key={f.name}>
            <InputLabel shrink>{f.label}</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="password"
              value={form[f.name as keyof typeof form] || ""}
              error={!!errors[f.name as keyof typeof errors]}
              helperText={errors[f.name as keyof typeof errors]}
              onChange={(e) =>
                onChangeField(
                  f.name as keyof Pick<
                    Form,
                    "password" | "newPassword" | "confirmPassword"
                  >,
                  e.target.value,
                )
              }
            />
          </Box>
        ))}
        <Divider />
        <Box textAlign="right" mt={3}>
          <Button variant="contained" type="submit">
            Lưu thay đổi
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ChangePasswordTab;

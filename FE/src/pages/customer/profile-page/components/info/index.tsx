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

type Props = {
  form: Pick<Form, "fullName" | "email" | "phone">;
  errors: Partial<
    Record<keyof Pick<Form, "fullName" | "email" | "phone">, string>
  >;
  onChange: (
    field: keyof Pick<Form, "fullName" | "email" | "phone">,
    value: any,
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};
const InfoTab = ({ form, errors, onChange, onSubmit }: Props) => {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Box>
          <InputLabel shrink>Họ và tên</InputLabel>
          <TextField
            fullWidth
            size="small"
            value={form.fullName || ""}
            onChange={(e) => onChange("fullName", e.target.value)}
            error={!!errors.fullName}
            helperText={errors.fullName}
          />
        </Box>

        <Box>
          <InputLabel shrink>Email</InputLabel>
          <TextField
            fullWidth
            size="small"
            value={form.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Box>

        <Box>
          <InputLabel shrink>Số điện thoại</InputLabel>
          <TextField
            fullWidth
            size="small"
            value={form.phone || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              onChange("phone", value);
            }}
            error={!!errors.phone}
            helperText={errors.phone}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          />
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="flex-end">
          <Button type="submit" variant="contained">
            Lưu thay đổi
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default InfoTab;

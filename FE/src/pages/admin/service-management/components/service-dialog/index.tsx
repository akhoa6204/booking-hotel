import { DialogMode } from "@constant/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Box,
  CircularProgress,
  Grid,
  InputLabel,
} from "@mui/material";
import { ServiceForm } from "../../useService";

type Props = {
  open: boolean;
  mode: DialogMode;
  form: ServiceForm;
  loading?: boolean;

  onClose: () => void;
  onChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const ServiceDialog = ({
  open,
  mode,
  form,
  loading,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const isEdit = mode === "edit";

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{isEdit ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ"}</DialogTitle>
      <Box component={"form"} onSubmit={onSubmit}>
        <>
          <DialogContent>
            {loading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid size={6}>
                  <InputLabel shrink>Tên dịch vụ</InputLabel>
                  <TextField
                    value={form.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={6}>
                  <InputLabel shrink>Giá tiền</InputLabel>
                  <TextField
                    value={form.price || ""}
                    onChange={(e) => onChange("price", e.target.value)}
                    fullWidth
                    type="number"
                  />
                </Grid>
                <Grid size={12}>
                  <InputLabel shrink>Mô tả dịch vụ</InputLabel>
                  <TextField
                    value={form.description || ""}
                    onChange={(e) => onChange("description", e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid size={6}>
                  <InputLabel shrink>Loại dịch vụ</InputLabel>
                  <TextField
                    select
                    value={form.type || "SERVICE"}
                    onChange={(e) => onChange("type", e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="SERVICE">Dịch vụ</MenuItem>
                    <MenuItem value="EXTRA_FEE">Phụ phí</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button variant="contained" type="submit" disabled={loading}>
              {isEdit ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogActions>
        </>
      </Box>
    </Dialog>
  );
};

export default ServiceDialog;

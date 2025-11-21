import {
  Card,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Grid,
} from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo } from "react";
import { FormBooking } from "@constant/types";

const pillInputSX = {
  borderRadius: 999,
  height: 48,
  px: 1.5,
  "& .MuiInputAdornment-root": { mr: 1 },
  "& input": { py: 1 },
};

interface Props {
  form: FormBooking;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const SearchBarMobile: React.FC<Props> = ({ form, onChange, onSubmit }) => {
  const { from, to, capacity } = form;
  const today = useMemo(() => fmtDate(new Date()), []);
  const minCheckout = from && from > today ? from : today;

  return (
    <Card
      component="form"
      onSubmit={onSubmit}
      sx={{ px: 2, py: 1, borderRadius: 3, border: "1px solid #24AB7066" }}
      elevation={1}
    >
      <Grid container spacing={2}>
        {/* Check-in */}
        <Grid size={6}>
          <Typography sx={{ mb: 1, fontWeight: 600, fontSize: 14 }}>
            Ngày nhận phòng
          </Typography>
          <TextField
            name="from"
            fullWidth
            type="date"
            value={from}
            onChange={onChange}
            variant="outlined"
            placeholder="Ngày nhận phòng"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayRoundedIcon color="primary" />
                  </InputAdornment>
                ),
                sx: pillInputSX,
                inputProps: { min: today },
              },
            }}
          />
        </Grid>

        {/* Check-out */}
        <Grid size={6}>
          <Typography sx={{ mb: 1, fontWeight: 600, fontSize: 14 }}>
            Ngày trả phòng
          </Typography>
          <TextField
            name="to"
            fullWidth
            type="date"
            value={to}
            onChange={onChange}
            variant="outlined"
            placeholder="Ngày trả phòng"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayRoundedIcon color="primary" />
                  </InputAdornment>
                ),
                sx: pillInputSX,
                inputProps: { min: minCheckout },
              },
            }}
          />
        </Grid>

        {/* Guests */}
        <Grid size={12}>
          <Typography sx={{ mb: 1, fontWeight: 600, fontSize: 14 }}>
            Số lượng khách
          </Typography>
          <TextField
            name="capacity"
            fullWidth
            type="number"
            value={capacity}
            onChange={onChange}
            variant="outlined"
            placeholder="Số lượng khách"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PeopleAltRoundedIcon color="primary" />
                  </InputAdornment>
                ),
                sx: pillInputSX,
                inputProps: { min: 1, step: 1 },
              },
            }}
          />
        </Grid>

        {/* Submit button */}
        <Grid size={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ borderRadius: 999, py: 2, fontWeight: 700, fontSize: 16 }}
          >
            Tìm kiếm
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default SearchBarMobile;

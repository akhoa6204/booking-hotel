import { Box, Divider, IconButton, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { FormBooking } from "@constant/types";

type Props = {
  form: FormBooking;
  onChange: (field: keyof FormBooking, value: any) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function SearchBar({ form, onSubmit, onChange }: Props) {
  const pickerTextField = {
    variant: "standard",
    placeholder: "DD/MM/YYYY",
    InputProps: { disableUnderline: true },
    InputLabelProps: { shrink: false, sx: { display: "none" } },
  } as const;

  const pickerSx = {
    "& .MuiInputBase-root": { width: 180, p: 0 },
    "& .MuiInputBase-input": { p: 0, fontWeight: 700 },
  } as const;

  const today = dayjs().startOf("day");

  const fromD: Dayjs | null = form.from ? dayjs(form.from) : null;
  const toD: Dayjs | null = form.to ? dayjs(form.to) : null;

  const minToDate = (fromD ?? today).add(1, "day");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: "flex",
          alignItems: "center",
          mx: "auto",
          border: "1px solid #24AB70",
          boxShadow: 2,
          borderRadius: "999px",
          bgcolor: "#fff",
          overflow: "hidden",
          width: "860px",
          p: "2px",
          gap: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", px: 2 }}>
          <CalendarTodayRoundedIcon color="primary" sx={{ mr: 1.5 }} />
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1 }}
            >
              Ngày nhận phòng
            </Typography>
            <DatePicker
              value={fromD}
              minDate={today}
              onChange={(d) => {
                if (!d) {
                  onChange("from", "");
                  return;
                }

                const normalized = d.startOf("day");

                onChange("from", normalized.format("YYYY-MM-DD"));

                if (toD && toD.isBefore(normalized.add(1, "day"), "day")) {
                  const newTo = normalized.add(1, "day");
                  onChange("to", newTo.format("YYYY-MM-DD"));
                }
              }}
              format="DD/MM/YYYY"
              slotProps={{ textField: pickerTextField }}
              sx={pickerSx}
            />
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Ngày trả phòng */}
        <Box sx={{ display: "flex", alignItems: "center", px: 2 }}>
          <CalendarTodayRoundedIcon color="primary" sx={{ mr: 1.5 }} />
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1 }}
            >
              Ngày trả phòng
            </Typography>
            <DatePicker
              value={toD}
              minDate={minToDate}
              onChange={(d) =>
                onChange("to", d ? d.startOf("day").format("YYYY-MM-DD") : "")
              }
              format="DD/MM/YYYY"
              slotProps={{ textField: pickerTextField }}
              sx={pickerSx}
            />
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Số lượng khách */}
        <Box
          sx={{ display: "flex", alignItems: "center", px: 2, minWidth: 170 }}
        >
          <PeopleAltRoundedIcon color="primary" sx={{ mr: 1.5 }} />
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1 }}
            >
              Số lượng khách
            </Typography>
            <TextField
              name="capacity"
              type="number"
              variant="standard"
              InputProps={{ disableUnderline: true }}
              inputProps={{ min: 1 }}
              value={form.capacity}
              onChange={(e) => onChange("capacity", e.target.value)}
              sx={{
                "& .MuiInputBase-input": { p: 0, fontWeight: 700, width: 60 },
              }}
            />
          </Box>
        </Box>

        <IconButton
          type="submit"
          sx={{
            ml: "auto",
            bgcolor: "primary.main",
            borderRadius: "50%",
            p: 2.2,
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <SearchIcon sx={{ color: "#fff" }} />
        </IconButton>
      </Box>
    </LocalizationProvider>
  );
}

import { Box, Divider, IconButton, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { SearchState } from "@constant/types";

type Props = {
  form: SearchState;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } }
  ) => void;
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

  // minDate cho ngày trả phòng: luôn >= (from + 1 ngày) hoặc ngày mai nếu chưa chọn from
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
          borderRadius: "999px",
          bgcolor: "#fff",
          overflow: "hidden",
          boxShadow: 2,
          width: "min(860px, 92vw)",
          p: "2px",
          gap: 0.5,
        }}
      >
        {/* Ngày nhận phòng */}
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
              minDate={today} // không cho chọn ngày quá khứ
              onChange={(d) => {
                if (!d) {
                  onChange({ target: { name: "from", value: "" } });
                  return;
                }

                const normalized = d.startOf("day");

                onChange({
                  target: {
                    name: "from",
                    value: normalized.format("YYYY-MM-DD"),
                  },
                });

                // nếu to < from + 1 ngày thì tự đẩy to lên from + 1
                if (toD && toD.isBefore(normalized.add(1, "day"), "day")) {
                  const newTo = normalized.add(1, "day");
                  onChange({
                    target: {
                      name: "to",
                      value: newTo.format("YYYY-MM-DD"),
                    },
                  });
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
                onChange({
                  target: {
                    name: "to",
                    value: d ? d.startOf("day").format("YYYY-MM-DD") : "",
                  },
                })
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
              onChange={onChange}
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

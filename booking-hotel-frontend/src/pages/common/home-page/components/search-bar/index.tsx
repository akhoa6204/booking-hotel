import React from "react";
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { FormBooking } from "@constant/types";

type Props = {
  form: FormBooking;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } }
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const pickerTextField = {
  variant: "standard",
  placeholder: "DD/MM/YYYY",
  InputProps: { disableUnderline: true },
  InputLabelProps: { shrink: false, sx: { display: "none" } },
} as const;

const pickerSx = {
  "& .MuiInputBase-root": { width: 170, p: 0 },
  "& .MuiInputBase-input": { p: 0, fontWeight: 700 },
} as const;

const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, children }) => (
  <Stack
    direction="row"
    alignItems="center"
    px={2}
    sx={{ minWidth: 0, flex: "0 1 auto", gap: 1.5 }}
  >
    {icon}
    <Stack sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ lineHeight: 1 }}
      >
        {label}
      </Typography>
      {children}
    </Stack>
  </Stack>
);

const SearchBar: React.FC<Props> = ({ form, onChange, onSubmit }) => {
  const today = dayjs().startOf("day");

  const fromD: Dayjs | null = form.from ? dayjs(form.from) : null;
  const toD: Dayjs | null = form.to ? dayjs(form.to) : null;

  // ngày tối thiểu cho "trả phòng" = from + 1 ngày, hoặc ngày mai nếu chưa chọn from
  const minToDate = (fromD ?? today).add(1, "day");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 0,
          p: "2px",
          borderRadius: 999,
          boxShadow: 1,
          bgcolor: "#fff",
          overflow: "hidden",
        }}
      >
        <Field
          label="Ngày nhận phòng"
          icon={
            <CalendarTodayRoundedIcon color="primary" sx={{ flexShrink: 0 }} />
          }
        >
          <DatePicker
            value={fromD}
            minDate={today} // không cho chọn trước hôm nay
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

              // nếu to < from+1 thì auto đẩy to lên from+1
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
        </Field>

        <Divider orientation="vertical" flexItem />

        <Field
          label="Ngày trả phòng"
          icon={
            <CalendarTodayRoundedIcon color="primary" sx={{ flexShrink: 0 }} />
          }
        >
          <DatePicker
            value={toD}
            minDate={minToDate} // luôn lớn hơn from ít nhất 1 ngày
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
        </Field>

        <Divider orientation="vertical" flexItem />

        <Field
          label="Số lượng khách"
          icon={<PeopleAltRoundedIcon color="primary" sx={{ flexShrink: 0 }} />}
        >
          <TextField
            name="capacity"
            type="number"
            variant="standard"
            InputProps={{ disableUnderline: true }}
            inputProps={{ min: 1, step: 1 }}
            value={form.capacity}
            onChange={onChange}
            sx={{
              "& .MuiInputBase-input": { p: 0, fontWeight: 700, width: 60 },
            }}
          />
        </Field>

        <Button
          type="submit"
          variant="contained"
          startIcon={<SearchIcon />}
          sx={{
            flexShrink: 0,
            borderRadius: "9999px",
            px: 3.5,
            py: 2.5,
            fontWeight: 700,
          }}
        >
          Tìm kiếm
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default SearchBar;
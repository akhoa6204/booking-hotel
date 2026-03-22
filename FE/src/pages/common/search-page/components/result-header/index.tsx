import {
  Box,
  FormControl,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { SortKey } from "../../interface";

interface Props {
  total: number;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
}

const SearchResultsHeader: React.FC<Props> = ({
  total,
  sort,
  onSortChange,
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems={"center"}
    spacing={2}
    mb={4.5}
    sx={{
      py: 2.5,
      borderBottom: "1px solid #ccc",
    }}
  >
    <Typography variant="body1">
      Có <b>{total}</b> kết quả tìm kiếm phù hợp
    </Typography>

    <FormControl size="small">
      <Select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        displayEmpty
        input={
          <OutlinedInput
            startAdornment={
              <InputAdornment
                position="start"
                sx={{ mr: 1, color: "text.primary" }}
              >
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            }
          />
        }
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: "999px" },
          "& .MuiOutlinedInput-notchedOutline": { borderRadius: "999px" },
          "& fieldset": { borderRadius: "999px" },
          "& .MuiSelect-icon": { mr: 0.5 },
        }}
      >
        <MenuItem value="price-asc">Giá tăng dần</MenuItem>
        <MenuItem value="price-desc">Giá giảm dần</MenuItem>
      </Select>
    </FormControl>
  </Stack>
);

export default SearchResultsHeader;

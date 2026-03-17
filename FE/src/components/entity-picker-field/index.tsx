import {
  Box,
  Divider,
  ListItemButton,
  MenuItem,
  TextField,
} from "@mui/material";
import React from "react";

export interface EntityOption {
  id: number | string;
  name?: string;
  fullName?: string;
}

interface Props {
  name: string;
  value?: number | string | null;
  options?: EntityOption[];
  onChange?: (name: string, value: number | string | boolean) => void;
  onOpenPicker?: () => void;
  isMoreOptions?: boolean;
  placeholder?: string;
  size?: "medium" | "small";
  disabled?: boolean;
}

const EntityPickerField: React.FC<Props> = ({
  name,
  value,
  options = [],
  onChange,
  onOpenPicker,
  isMoreOptions = false,
  placeholder,
  size = "medium",
  disabled,
}) => {
  return (
    <TextField
      name={name}
      select
      fullWidth
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.name, e.target.value)}
      size={size}
      SelectProps={{ displayEmpty: true }}
      disabled={disabled}
    >
      {placeholder && (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      )}

      {options.map((item) => (
        <MenuItem key={item.id} value={item.id}>
          {item.name || item.fullName}
        </MenuItem>
      ))}

      {isMoreOptions && <Divider />}

      {isMoreOptions && (
        <Box>
          <ListItemButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenPicker?.();
            }}
            sx={{ fontSize: 14 }}
          >
            Tìm hiểu thêm...
          </ListItemButton>
        </Box>
      )}
    </TextField>
  );
};

export default EntityPickerField;

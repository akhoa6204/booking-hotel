import {
  Box,
  Divider,
  ListItemButton,
  MenuItem,
  TextField,
} from "@mui/material";
import React from "react";

interface Props {
  name: string;
  value?: number | string | null;
  onChange?: (name: string, value: number | string | boolean) => void;
  onOpenPicker?: () => void;
  isMoreOptions?: boolean;
  placeholder?: string;
  size?: "medium" | "small";
  disabled?: boolean;
  children: React.ReactNode;
}

const EntityPickerField: React.FC<Props> = ({
  name,
  value,
  onChange,
  onOpenPicker,
  isMoreOptions = false,
  placeholder,
  size = "medium",
  disabled,
  children,
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

      {children}

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

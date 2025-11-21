import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  InputLabel,
  Grid,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import { Add, Close } from "@mui/icons-material";
import { UpsertFormRoomType } from "../../useRoomTypesManagement";
import { Amenity } from "@constant/types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  values: UpsertFormRoomType;
  onChange: (field: keyof UpsertFormRoomType, v: any) => void;
  amenityOptions: Amenity[];
  onPickFiles: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function RoomTypeUpsertView({
  open,
  mode,
  values,
  onChange,
  amenityOptions,
  onPickFiles,
  onRemoveImage,
  onClose,
  onSubmit,
}: Props) {
  const selectedAmenities = values.amenities || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {mode === "create"
          ? "Thêm loại phòng"
          : `Chi tiết loại phòng ${values.name}`}
      </DialogTitle>

      <DialogContent>
        {/*-------------- THÔNG TIN CHUNG ----------------*/}
        <Box
          sx={{
            px: 1.5,
            py: 2,
            borderRadius: 1,
            border: "1px solid #ccc",
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
            Thông tin chung
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={12}>
              <InputLabel shrink sx={{ fontWeight: 500 }}>
                Tên loại phòng
              </InputLabel>
              <TextField
                fullWidth
                size="small"
                value={values.name}
                onChange={(e) => onChange("name", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink sx={{ fontWeight: 500 }}>
                Số người
              </InputLabel>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={values.capacity}
                onChange={(e) =>
                  onChange("capacity", Number(e.target.value) || "")
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink sx={{ fontWeight: 500 }}>
                Giá tiền
              </InputLabel>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={values.basePrice}
                onChange={(e) =>
                  onChange("basePrice", Number(e.target.value) || "")
                }
              />
            </Grid>
            <Grid size={12}>
              <InputLabel shrink sx={{ fontWeight: 500 }}>
                Mô tả
              </InputLabel>
              <TextField
                fullWidth
                size="small"
                value={values.description}
                onChange={(e) => onChange("description", e.target.value)}
                multiline
                rows={5}
              />
            </Grid>
          </Grid>
        </Box>

        {/*-------------- AMENITIES ----------------*/}
        <Box
          sx={{
            px: 1.5,
            py: 2,
            borderRadius: 1,
            border: "1px solid #ccc",
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Dịch vụ</Typography>

          <Autocomplete
            multiple
            options={amenityOptions}
            value={selectedAmenities}
            onChange={(_, newValue) => onChange("amenities", newValue)}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField {...params} variant="standard" />
            )}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(selected as Amenity[]).map((option) => (
                  <Chip
                    key={option.id}
                    label={option.label}
                    sx={{ borderRadius: 999, bgcolor: "#e8e3e3" }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onDelete={() =>
                      onChange(
                        "amenities",
                        selectedAmenities.filter((a) => a.id !== option.id)
                      )
                    }
                  />
                ))}
              </Box>
            )}
          />
        </Box>

        {/*-------------- HÌNH ẢNH ----------------*/}
        <Box sx={{ mt: 1 }}>
          <Typography sx={{ mb: 0.5 }} fontWeight={600}>
            Hình ảnh
          </Typography>
          <Box
            sx={{
              border: "1px solid #C8CDD2",
              borderRadius: 2,
              p: 2,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1.5,
            }}
          >
            {values.images?.map((image, i) => (
              <Box key={image.url + i} sx={{ position: "relative" }}>
                <img
                  src={image.url}
                  alt=""
                  style={{
                    width: "100%",
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bgcolor: "rgba(0,0,0,0.4)",
                    "& svg": { color: "#fff" },
                    "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                  }}
                  size="small"
                  onClick={() => onRemoveImage(i)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ))}

            {values.images?.length < 8 && (
              <Box
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.accept = "image/*";
                  input.onchange = (e) =>
                    onPickFiles(
                      Array.from((e.target as HTMLInputElement).files || [])
                    );
                  input.click();
                }}
                sx={{
                  height: 80,
                  borderRadius: 1,
                  bgcolor: "#F6F7F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Add />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="contained" onClick={onSubmit}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

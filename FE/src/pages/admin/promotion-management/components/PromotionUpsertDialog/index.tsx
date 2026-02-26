import {
  CustomerEligibility,
  DialogMode,
  PromoScope,
  PromoType,
} from "@constant/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  InputLabel,
  Autocomplete,
  Chip,
} from "@mui/material";
import { PromotionForm } from "../../usePromotionManagement";

type Props = {
  open: boolean;
  mode: DialogMode;
  values: PromotionForm;
  roomTypes: { id: number; name: string }[];
  onChange: <K extends keyof PromotionForm>(
    field: K,
    v: PromotionForm[K],
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function PromotionUpsertDialog({
  open,
  mode,
  values,
  roomTypes,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === "create" ? "Tạo khuyến mãi" : "Xem khuyến mãi"}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* Loại khuyến mãi */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Loại khuyến mãi</InputLabel>
            <TextField
              select
              fullWidth
              size="small"
              value={values.autoApply ? "true" : "false"}
              onChange={(e) => onChange("autoApply", e.target.value === "true")}
              SelectProps={{ native: true }}
            >
              <option value="false">Mã khuyến mãi</option>
              <option value="true">Tự áp dụng</option>
            </TextField>
          </Grid>

          {/* Tên chương trình */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Tên chương trình</InputLabel>
            <TextField
              fullWidth
              size="small"
              placeholder={"Ví dụ: Khuyến mãi Cuối Tuần"}
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </Grid>
          {/* Mô tả */}
          <Grid size={12}>
            <InputLabel shrink>Mô tả</InputLabel>
            <TextField
              fullWidth
              size="small"
              value={values.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </Grid>

          {/* Mã khuyến mãi (chỉ CODE) */}
          {!values.autoApply && (
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink>Mã khuyến mãi</InputLabel>
              <TextField
                fullWidth
                size="small"
                value={values.code}
                onChange={(e) => onChange("code", e.target.value)}
              />
            </Grid>
          )}

          {/* Ưu tiên áp dụng */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Ưu tiên (số nhỏ ưu tiên cao)</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
              value={values.priority}
              onChange={(e) =>
                onChange("priority", Number(e.target.value) || 0)
              }
            />
          </Grid>

          {/* Khách hàng áp dụng */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Khách hàng áp dụng</InputLabel>

            <TextField
              select
              fullWidth
              size="small"
              value={values.eligibleFor}
              onChange={(e) =>
                onChange("eligibleFor", e.target.value as CustomerEligibility)
              }
              SelectProps={{ native: true }}
            >
              <option value="ALL">Toàn bộ</option>
              <option value="GUEST">Khách vãng lai</option>
              <option value="REGISTERED_MEMBER">Thành viên</option>
            </TextField>
          </Grid>

          {/* Loại giảm giá */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Loại giảm giá</InputLabel>
            <TextField
              select
              fullWidth
              size="small"
              value={values.type}
              onChange={(e) => onChange("type", e.target.value as PromoType)}
              SelectProps={{ native: true }}
            >
              <option value="PERCENT">Phần trăm (%)</option>
              <option value="FIXED">Số tiền (VND)</option>
            </TextField>
          </Grid>

          {/* Giá trị giảm */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Giá trị giảm</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
              value={values.value}
              onChange={(e) => onChange("value", Number(e.target.value) || 0)}
            />
          </Grid>

          {/* Trần giảm giá (chỉ khi %) */}
          {values.type === "PERCENT" && (
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink>Giảm tối đa (VND) (không bắt buộc)</InputLabel>
              <TextField
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                value={values.maxDiscountAmount}
                onChange={(e) =>
                  onChange("maxDiscountAmount", Number(e.target.value) || 0)
                }
              />
            </Grid>
          )}

          {/* Scope */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Phạm vi áp dụng</InputLabel>

            <TextField
              select
              fullWidth
              size="small"
              value={values.scope}
              onChange={(e) => onChange("scope", e.target.value as PromoScope)}
              SelectProps={{ native: true }}
            >
              <option value="GLOBAL">Toàn bộ</option>
              <option value="ROOM_TYPE">Loại phòng</option>
              <option value="MIN_TOTAL">Giá trị tối thiểu</option>
            </TextField>
          </Grid>

          {/* Min total */}
          {values.scope === "GLOBAL" ||
            (values.scope === "MIN_TOTAL" && (
              <Grid size={{ xs: 12, md: 6 }}>
                <InputLabel shrink>
                  {values.scope === "MIN_TOTAL"
                    ? "Giá trị đơn tối thiểu (VND)"
                    : "Giá trị đơn tối thiểu (VND) (không bắt buộc)"}
                </InputLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={values.minTotal ?? ""}
                  onChange={(e) =>
                    onChange("minTotal", Number(e.target.value) || 0)
                  }
                />
              </Grid>
            ))}

          {/* Room type */}
          {values.scope === "ROOM_TYPE" && (
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink>Loại phòng áp dụng </InputLabel>

              <Autocomplete
                multiple
                value={
                  roomTypes.filter((rt) => values.roomTypes?.includes(rt.id)) ||
                  []
                }
                onChange={(_, newValue) =>
                  onChange(
                    "roomTypes",
                    newValue.map((item) => item.id),
                  )
                }
                options={roomTypes}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.name} // Đảm bảo mỗi chip có key duy nhất
                      label={option.name}
                      {...getTagProps({ index })}
                      sx={{ margin: 0.5, backgroundColor: "#e8e3e3" }} // Style cho chip
                    />
                  ))
                }
                disableClearable
              />
            </Grid>
          )}

          {/* Số lượng mã giảm giá */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Số lượng mã giảm giá</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
              value={values.quotaTotal}
              onChange={(e) =>
                onChange("quotaTotal", Number(e.target.value) || 0)
              }
            />
          </Grid>

          {!values.autoApply && (
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink>Gộp khuyến mãi</InputLabel>
              <TextField
                select
                fullWidth
                size="small"
                value={values.isStackable ? "true" : "false"}
                onChange={(e) =>
                  onChange("isStackable", e.target.value === "true")
                }
                SelectProps={{ native: true }}
              >
                <option value="true">Cho phép</option>
                <option value="false">Không</option>
              </TextField>
            </Grid>
          )}

          {/* Ngày bắt đầu */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Ngày bắt đầu</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={values.startAt}
              onChange={(e) => onChange("startAt", e.target.value)}
            />
          </Grid>

          {/* Ngày kết thúc */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Ngày kết thúc</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={values.endAt}
              onChange={(e) => onChange("endAt", e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="contained" onClick={onSubmit}>
          {mode === "create" ? "Tạo mã khuyến mãi" : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

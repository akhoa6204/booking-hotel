import { PromoScope, PromoType } from "@constant/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  InputLabel,
} from "@mui/material";
import { PromotionForm } from "../../usePromotionManagement";

type DialogMode = "create" | "edit" | "view";

type Props = {
  open: boolean;
  mode: DialogMode;
  values: PromotionForm;
  roomTypes: { id: number; name: string }[];
  onChange: <K extends keyof PromotionForm>(
    field: K,
    v: PromotionForm[K]
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
  // ngày hôm nay và ngày mai (yyyy-MM-dd)
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
    today.getDate()
  )}`;
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  const tomorrowStr = `${tomorrow.getFullYear()}-${pad(
    tomorrow.getMonth() + 1
  )}-${pad(tomorrow.getDate())}`;

  // trạng thái thời gian của promotion
  const start = values.startDate ? new Date(values.startDate) : undefined;
  const end = values.endDate ? new Date(values.endDate) : undefined;
  const isActiveWindow = !!(start && end && today >= start && today <= end);
  const isExpired = !!(end && today > end);

  const effectiveMode =
    mode === "create"
      ? "create"
      : !values.active || isActiveWindow || isExpired
      ? "view"
      : "edit";
  const isView = effectiveMode === "view";

  // điều kiện hiển thị
  const showMinTotal =
    values.scope === "GLOBAL" || values.scope === "MIN_TOTAL";
  const showRoomType = values.scope === "ROOM_TYPE";

  // ràng buộc ngày
  const startMin = todayStr;
  const endMin =
    values.startDate && values.startDate > todayStr
      ? values.startDate
      : tomorrowStr;

  // mapping label cho view mode
  const typeLabel = (t: PromoType) =>
    t === "FIXED" ? "Số tiền (VND)" : "Phần trăm (%)";
  const scopeLabel = (s: PromoScope) =>
    s === "ROOM_TYPE"
      ? "Loại phòng"
      : s === "MIN_TOTAL"
      ? "Giá trị tối thiểu"
      : "Toàn bộ";
  const roomTypeName =
    roomTypes.find((r) => r.id === (values.roomTypeId as number))?.name ?? "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {effectiveMode === "create"
          ? "Tạo mã khuyến mãi"
          : effectiveMode === "edit"
          ? "Sửa mã khuyến mãi"
          : "Xem mã khuyến mãi"}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* Mã */}
          <Grid size={12}>
            <InputLabel shrink>Mã khuyến mãi</InputLabel>
            <TextField
              fullWidth
              size="small"
              value={values.code}
              onChange={(e) => onChange("code", e.target.value)}
              InputProps={isView ? { readOnly: true } : undefined}
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
              InputProps={isView ? { readOnly: true } : undefined}
            />
          </Grid>

          {/* Loại giảm */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Loại giảm giá</InputLabel>
            {isView ? (
              <TextField
                fullWidth
                size="small"
                value={typeLabel(values.discountType)}
                InputProps={{ readOnly: true }}
              />
            ) : (
              <TextField
                select
                fullWidth
                size="small"
                value={values.discountType}
                onChange={(e) =>
                  onChange("discountType", e.target.value as PromoType)
                }
                SelectProps={{ native: true }}
              >
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED">Số tiền (VND)</option>
              </TextField>
            )}
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
              InputProps={isView ? { readOnly: true } : undefined}
            />
          </Grid>

          {/* Scope */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Phạm vi áp dụng</InputLabel>
            {isView ? (
              <TextField
                fullWidth
                size="small"
                value={scopeLabel(values.scope)}
                InputProps={{ readOnly: true }}
              />
            ) : (
              <TextField
                select
                fullWidth
                size="small"
                value={values.scope}
                onChange={(e) =>
                  onChange("scope", e.target.value as PromoScope)
                }
                SelectProps={{ native: true }}
              >
                <option value="GLOBAL">Toàn bộ</option>
                <option value="ROOM_TYPE">Loại phòng</option>
                <option value="MIN_TOTAL">Giá trị tối thiểu</option>
              </TextField>
            )}
          </Grid>

          {/* Min total */}
          {showMinTotal && (
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
                  onChange(
                    "minTotal",
                    e.target.value === "" ? "" : Number(e.target.value) || 0
                  )
                }
                InputProps={isView ? { readOnly: true } : undefined}
              />
            </Grid>
          )}

          {/* Room type */}
          {showRoomType && (
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel shrink>Loại phòng áp dụng</InputLabel>
              {isView ? (
                <TextField
                  fullWidth
                  size="small"
                  value={roomTypeName}
                  InputProps={{ readOnly: true }}
                />
              ) : (
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={values.roomTypeId ?? ""}
                  onChange={(e) =>
                    onChange(
                      "roomTypeId",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  SelectProps={{ native: true }}
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </TextField>
              )}
            </Grid>
          )}

          {/* Ngày bắt đầu */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Ngày bắt đầu</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={values.startDate}
              onChange={(e) => onChange("startDate", e.target.value)}
              inputProps={!isView ? { min: startMin } : undefined}
              InputProps={isView ? { readOnly: true } : undefined}
            />
          </Grid>

          {/* Ngày kết thúc */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Ngày kết thúc</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={values.endDate}
              onChange={(e) => onChange("endDate", e.target.value)}
              inputProps={!isView ? { min: endMin } : undefined}
              InputProps={isView ? { readOnly: true } : undefined}
            />
          </Grid>

          {/* Tổng số code */}
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel shrink>Số lần sử dụng tối đa</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder="Để trống = không giới hạn"
              value={values.totalCodes ?? ""}
              onChange={(e) =>
                onChange(
                  "totalCodes",
                  e.target.value === "" ? "" : Number(e.target.value) || 0
                )
              }
              InputProps={isView ? { readOnly: true } : undefined}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          {isView ? "Đóng" : "Hủy"}
        </Button>
        {!isView && (
          <Button variant="contained" onClick={onSubmit}>
            {effectiveMode === "create" ? "Tạo mã khuyến mãi" : "Lưu"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

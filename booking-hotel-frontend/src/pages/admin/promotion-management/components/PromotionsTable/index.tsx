import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Chip,
  Stack,
  Skeleton,
} from "@mui/material";
import { Delete as DeleteIcon, Visibility } from "@mui/icons-material";
import { Promotion } from "@constant/types";
import { fmtDate } from "@utils/format";

export default function PromotionsTable({
  rows,
  loading = false,
  onEdit,
  onDelete,
}: {
  rows: Promotion[];
  loading?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}) {
  const renderSkeleton = (n = 6) =>
    Array.from({ length: n }).map((_, i) => (
      <TableRow key={`sk-${i}`}>
        {Array.from({ length: 7 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton width={j === 6 ? 80 : "70%"} />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <TableContainer
      component={Paper}
      elevation={1}
      sx={{ borderRadius: 2, border: "1px solid #E0E0E0", overflow: "hidden" }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "#F6FCF9" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Mã khuyến mãi</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Kiểu giảm</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Phạm vi</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">
              Hiệu lực
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">
              Đã dùng
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">
              Trạng thái
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            renderSkeleton()
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            rows.map((p) => {
              const scopeLabel =
                p.scope === "ROOM_TYPE"
                  ? "Loại phòng"
                  : p.scope === "MIN_TOTAL"
                  ? "Giá tối thiểu"
                  : "Toàn bộ";
              const discountTypeTransform =
                p.discountType === "FIXED" ? "Giá cố định" : "Phần trăm";
              const usedLabel =
                p.totalCodes == null
                  ? p.totalUsed ?? 0
                  : `${p.totalUsed ?? 0}/${p.totalCodes}`;
              return (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <strong>{p.code ?? "-"}</strong>
                  </TableCell>
                  <TableCell>{discountTypeTransform}</TableCell>
                  <TableCell>{scopeLabel}</TableCell>
                  <TableCell align="center">
                    {fmtDate(p.startDate)} - {fmtDate(p.endDate)}
                  </TableCell>
                  <TableCell align="right">{usedLabel}</TableCell>
                  <TableCell align="center">
                    {(() => {
                      const now = new Date();
                      const start = new Date(p.startDate);
                      const end = new Date(p.endDate);
                      let label = "";
                      let color: "default" | "primary" | "error" | "warning" =
                        "default";

                      if (!p.active) {
                        label = "Vô hiệu";
                        color = "default";
                      } else if (now < start) {
                        label = "Chưa bắt đầu";
                        color = "warning";
                      } else if (now > end) {
                        label = "Hết hạn";
                        color = "error";
                      } else {
                        label = "Đang hoạt động";
                        color = "primary";
                      }

                      return (
                        <Chip
                          size="small"
                          label={label}
                          color={color}
                          sx={
                            label === "Đang hoạt động"
                              ? {
                                  backgroundColor: "#24AB70",
                                  color: "#fff",
                                }
                              : undefined
                          }
                        />
                      );
                    })()}
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <IconButton size="small" onClick={() => onEdit?.(p.id)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                      {p.active &&
                      new Date(p.startDate) > new Date(p.endDate) ? (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete?.(p.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        ""
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

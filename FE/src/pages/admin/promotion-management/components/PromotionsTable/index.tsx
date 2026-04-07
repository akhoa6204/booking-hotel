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
import { getPromotionLabels } from "../../usePromotionManagement";
import { formatDate } from "@utils/format";

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
        {Array.from({ length: 8 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton width={j === 7 ? 80 : "70%"} />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <TableContainer
      component={Paper}
      elevation={1}
      sx={{
        borderRadius: 2,
        border: "1px solid #E0E0E0",
        overflow: "hidden",
        overflowX: "auto",
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "#2E90FA0d" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Tên/Mã khuyến mãi</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Loại khuyến mãi</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Kiểu giảm</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Phạm vi</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">
              Đã dùng
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">
              Hiệu lực
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
              <TableCell colSpan={8} align="center">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            rows.map((promotion) => {
              const {
                scopeLabel,
                discountTypeTransform,
                usedLabel,
                autoApplyLabel,
              } = getPromotionLabels(promotion);
              return (
                <TableRow key={promotion.id} hover>
                  <TableCell>
                    <strong>{promotion.code ?? promotion.name}</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={autoApplyLabel}
                      color={promotion.autoApply ? "info" : "default"}
                    />
                  </TableCell>
                  <TableCell>{discountTypeTransform}</TableCell>
                  <TableCell>{scopeLabel}</TableCell>
                  <TableCell align="right">{usedLabel}</TableCell>
                  <TableCell align="center">
                    {formatDate(promotion.startAt)} -{" "}
                    {formatDate(promotion.endAt)}
                  </TableCell>
                  <TableCell align="center">
                    {new Date() < new Date(promotion.endAt)
                      ? "Đang hoạt động"
                      : "Hết hạn  "}
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <IconButton
                        size="small"
                        onClick={() => onEdit?.(promotion.id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete?.(promotion.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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

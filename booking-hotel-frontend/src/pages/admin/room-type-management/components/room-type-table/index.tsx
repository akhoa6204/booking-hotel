import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Skeleton,
  Stack,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { RoomType } from "@constant/types";
import { fmtVND } from "@utils/format";

type Props = {
  rows: RoomType[];
  loading?: boolean;
  onView?: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function RoomTypeTable({
  rows,
  loading = false,
  onEdit,
  onDelete,
}: Props) {
  const renderSkeleton = (n = 6) =>
    Array.from({ length: n }).map((_, i) => (
      <TableRow key={`sk-${i}`}>
        <TableCell>
          <Skeleton width={80} />
        </TableCell>
        <TableCell>
          <Skeleton width="60%" />
        </TableCell>
        <TableCell align="right">
          <Skeleton width={40} />
        </TableCell>
        <TableCell align="right">
          <Skeleton width={100} />
        </TableCell>
        <TableCell align="center">
          <Skeleton width={120} />
        </TableCell>
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
            <TableCell sx={{ fontWeight: 600 }}>Mã loại phòng</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Tên loại phòng</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">
              Số người
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">
              Giá tiền
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
              <TableCell colSpan={5} align="center">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell align="right">{r.capacity}</TableCell>
                <TableCell align="center">{fmtVND(r.basePrice)} VND</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    aria-label="Sửa"
                    onClick={() => onEdit(r.id)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Xóa"
                    onClick={() => onDelete(r.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

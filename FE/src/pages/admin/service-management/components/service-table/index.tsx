import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  TableContainer,
  Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Service } from "@constant/types";
import { fmtVND } from "@utils/format";

type Props = {
  data: Service[];
  loading?: boolean;
  onRowClick?: (id: number) => void;
  onDelete?: (id: number) => void;
};
const getLabelType = {
  SERVICE: "Dịch vụ",
  EXTRA_FEE: "Phụ phí",
};
export default function ServiceTable({
  data,
  loading,
  onRowClick,
  onDelete,
}: Props) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        border: "1px solid #E0E0E0",
        overflow: "hidden",
        overflowX: "auto",
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "#F6FCF9" }}>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Giá</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell align="center">Hành động</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                </TableRow>
              ))
            : data.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => onRowClick?.(row.id)}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{fmtVND(row.price)} đ</TableCell>
                  <TableCell>{getLabelType[row.type]}</TableCell>

                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(row.id);
                      }}
                      sx={{ p: 0.25}}
                    >
                      <DeleteIcon sx={{ fontSize: 24 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

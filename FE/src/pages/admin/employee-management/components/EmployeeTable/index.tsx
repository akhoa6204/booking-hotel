import { Employee } from "@constant/types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  Switch,
} from "@mui/material";

interface Props {
  rows: Employee[];
  isLoading: boolean;
  onEdit?: (id: number) => void;
  onToggle?: (id: number, isActive: boolean) => void;
}

const SKELETON_ROWS = 5;

const EmployeeTable = ({ rows, isLoading, onEdit, onToggle }: Props) => {
  const renderSkeleton = () =>
    Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
      <TableRow key={`skeleton-${idx}`}>
        <TableCell>
          <Skeleton variant="text" width={140} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={120} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={180} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={120} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={120} />
        </TableCell>
      </TableRow>
    ));

  const renderRows = () =>
    rows.map((emp) => (
      <TableRow
        key={emp.id}
        hover
        onClick={() => onEdit?.(emp.id)}
        sx={{ cursor: onEdit ? "pointer" : "default" }}
      >
        <TableCell>
          <Typography fontWeight={500}>{emp.fullName}</Typography>
        </TableCell>
        <TableCell>{emp.phone}</TableCell>
        <TableCell>{emp.email}</TableCell>
        <TableCell>{emp.staff?.position ?? "-"}</TableCell>
        <TableCell>
          <Switch
            checked={emp.isActive}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggle?.(emp.id, !emp.isActive)}
            slotProps={{ input: { "aria-label": "controlled" } }}
            disabled={emp.staff.isAdmin}
          />
        </TableCell>
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
        <TableHead sx={{ backgroundColor: "#F6FCF9" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Họ tên</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Số điện thoại</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Vị trí</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? renderSkeleton() : renderRows()}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary">
                  No employees found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EmployeeTable;

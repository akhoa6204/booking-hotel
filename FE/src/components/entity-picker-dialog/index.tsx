import Pager from "@components/pager";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";

interface Props {
  loading: boolean;
  data: any[];
  onClose: () => void;
  open: boolean;
  selectedId?: number;
  title: string;
  columns: { label: string; name: string }[];

  onSelect?: (row: any) => void; // thêm dòng này

  q?: string;
  onSearch?: (value: string) => void;

  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const EntityPickerDialog = ({
  data,
  onClose,
  open,
  selectedId,
  title = "Xem thêm Phòng",
  columns = [],
  q,
  onSearch,
  page,
  totalPages,
  onPageChange,
  onSelect,
  loading = false,
}: Props) => {
  const getValueByPath = (obj: any, path: string) => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography>{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm..."
            value={q ?? ""}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell key={`${col.name}-${index}`}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Stack
                    alignItems={"center"}
                    justifyContent={"center"}
                    spacing={1}
                  >
                    <CircularProgress size={24} />
                    <Typography variant="body2">Đang tài dữ liệu...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography color="text.secondary">
                    Không có dữ liệu
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row: any) => {
                return (
                  <TableRow
                    key={row.id}
                    selected={row.id === selectedId}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => onSelect?.(row)}
                  >
                    {columns.map((col) => {
                      const value = getValueByPath(row, col.name);

                      return (
                        <TableCell key={`${row.id}-${col.name}`}>
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <Box mt={2} display="flex" justifyContent="center">
            <Pager
              page={page}
              totalPages={totalPages}
              onChange={onPageChange}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};
export default EntityPickerDialog;

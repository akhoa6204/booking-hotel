import { Booking, BookingStatus } from "@constant/types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Chip,
  Typography,
} from "@mui/material";
import { fmtVND } from "@utils/format";

type Props = {
  items: Booking[];
  isLoading?: boolean;
  onView: (id: number) => void;
};

const calcNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
const StatusChip = (status: BookingStatus) => {
  const map: Record<
    string,
    {
      label: string;
      color: "default" | "primary" | "warning" | "error" | "info" | "success";
    }
  > = {
    PENDING: { label: "Chờ xác nhận", color: "warning" },
    CONFIRMED: { label: "Đã xác nhận", color: "success" },
    CANCELLED: { label: "Đã hủy", color: "error" },
    CHECKED_IN: { label: "Đang ở", color: "primary" },
    CHECKED_OUT: { label: "Đã trả phòng", color: "default" },
  };
  const s = map[status] || map.PENDING;
  return (
    <Chip size="small" label={s.label} color={s.color} variant="outlined" />
  );
};
export default function BookingTable({ items, isLoading, onView }: Props) {
  const renderSkeleton = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 11 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        overflowX: "auto",
      }}
      elevation={1}
    >
      <Table sx={{ minWidth: 1100 }}>
        <TableHead sx={{ backgroundColor: "#2E90FA0d" }}>
          <TableRow>
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                background: "#fff",
                zIndex: 2,
                fontWeight: 600,
                backgroundColor: "#2E90FA0d",
              }}
            >
              Mã
            </TableCell>

            <TableCell>Khách</TableCell>
            <TableCell>Điện thoại</TableCell>
            <TableCell>Phòng</TableCell>
            <TableCell>Check-in</TableCell>
            <TableCell>Check-out</TableCell>
            <TableCell>Đêm</TableCell>
            <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            renderSkeleton()
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Không có booking nào
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const nights = calcNights(item.checkIn, item.checkOut);

              return (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => onView(item.id)}
                >
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      background: "#fff",
                      zIndex: 1,
                      fontWeight: 600,

                      ".MuiTableRow-root:hover &": {
                        backgroundColor: "rgba(0,0,0,0.004)",
                      },
                    }}
                  >
                    BK{item.id.toString().padStart(4, "0")}
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={500}>{item.fullName}</Typography>
                  </TableCell>

                  <TableCell>{item.phone}</TableCell>

                  <TableCell>
                    {item.room.name} – {item.room.roomType.name}
                  </TableCell>

                  <TableCell>
                    {new Date(item.checkIn).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    {new Date(item.checkOut).toLocaleDateString()}
                  </TableCell>

                  <TableCell>{nights}</TableCell>

                  <TableCell>{StatusChip(item.status)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

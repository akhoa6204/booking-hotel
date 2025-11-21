import {
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { Edit, Delete, PeopleAlt } from "@mui/icons-material";
import { Room } from "@constant/types";

type Props = {
  room: Room;
  onEdit?: (room: Room) => void;
  onToggleDelete?: (id: number) => void;
};

const STATUS_VIEW: Record<
  NonNullable<Room["status"]>,
  { label: string; color: "success" | "warning" | "default" }
> = {
  AVAILABLE: { label: "Còn trống", color: "success" },
  BOOKED: { label: "Đã đặt", color: "warning" },
  MAINTENANCE: { label: "Bảo trì", color: "default" },
};

const RoomCard: React.FC<Props> = ({ room, onEdit, onToggleDelete }) => {
  const image = room.image;
  ("https://via.placeholder.com/400x250?text=No+Image");

  const formatPrice = (price: number) =>
    Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const status = STATUS_VIEW[room.status || "AVAILABLE"];

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ảnh phòng */}
      <CardMedia
        component="img"
        image={image}
        alt={room.name}
        sx={{
          height: 208,
          width: "100%",
          objectFit: "cover",
        }}
      />

      {/* Nội dung */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6" fontWeight={600}>
            Phòng {room.name}
          </Typography>
          <Chip
            label={status.label}
            color={status.color}
            variant="outlined"
            size="small"
          />
        </Stack>

        {/* Loại phòng + sức chứa */}
        <Typography variant="body2" color="text.secondary">
          {room.roomType?.name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
          <PeopleAlt fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {room.roomType?.capacity || 0} người
          </Typography>
        </Stack>

        {/* Giá */}
        <Typography
          mt={1.5}
          fontWeight={600}
          color="success.main"
          variant="body1"
        >
          {formatPrice(room.roomType?.basePrice || 0)}/đêm
        </Typography>

        {/* Hành động */}
        <Stack direction="row" spacing={1.5} mt={2}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            size="small"
            onClick={() => onEdit?.(room)}
          >
            Sửa
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            size="small"
            onClick={() => onToggleDelete?.(room.id)}
          >
            {room.active ? "Xóa" : "Khôi phục"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RoomCard;

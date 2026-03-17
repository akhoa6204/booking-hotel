import {
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Chip,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit,
  Delete,
  PeopleAlt,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { Room, RoomStatus } from "@constant/types";

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  VACANT_CLEAN: "Trống - Sạch",
  VACANT_DIRTY: "Trống - Cần dọn",
  OCCUPIED_CLEAN: "Đang ở - Sạch",
  OCCUPIED_DIRTY: "Đang ở - Cần dọn",
  OUT_OF_SERVICE: "Bảo trì",
};

const STATUS_VIEW: Record<
  NonNullable<RoomStatus>,
  { label: string; color: "success" | "warning" | "error" | "default" }
> = {
  VACANT_CLEAN: { label: "Trống - Sạch", color: "success" },
  VACANT_DIRTY: { label: "Trống - Cần dọn", color: "warning" },
  OCCUPIED_CLEAN: { label: "Đang ở - Sạch", color: "success" },
  OCCUPIED_DIRTY: { label: "Đang ở - Cần dọn", color: "warning" },
  OUT_OF_SERVICE: { label: "Bảo trì", color: "error" },
};

type Props = {
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (id: number) => void;
  onEditStatus?: (id: number, status: NonNullable<RoomStatus>) => void;
};

const RoomCard: React.FC<Props> = ({
  room,
  onEdit,
  onDelete,
  onEditStatus,
}) => {
  const image =
    room.roomType?.images?.[0]?.url ||
    "https://via.placeholder.com/400x250?text=No+Image";

  const formatPrice = (price: number) =>
    Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const status = STATUS_VIEW[(room.status || "VACANT_CLEAN") as NonNullable<RoomStatus>];

  const currentStatus = (room.status || "VACANT_CLEAN") as NonNullable<RoomStatus>;

  const statusOptions: NonNullable<RoomStatus>[] =
    currentStatus === "OUT_OF_SERVICE"
      ? ["VACANT_CLEAN"] // nếu đang bảo trì thì chỉ cho chuyển về Trống - Sạch
      : [currentStatus, "OUT_OF_SERVICE"]; // trạng thái bình thường -> cho chuyển sang Bảo trì

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
          <Select
            size="small"
            variant="standard"
            IconComponent={KeyboardArrowDown}
            disableUnderline
            value={currentStatus}
            onChange={(e) =>
              onEditStatus?.(room.id, e.target.value as NonNullable<RoomStatus>)
            }
            sx={{
              minWidth: 160,
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                paddingRight: "28px !important",
              },
              "& .MuiSelect-icon": {
                right: 4,
              },
            }}
            renderValue={(selected) => {
              const config = STATUS_VIEW[selected as NonNullable<RoomStatus>];
              return (
                <Chip
                  label={config.label}
                  color={config.color}
                  size="small"
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
              );
            }}
          >
            {statusOptions.map((key) => {
              const config = STATUS_VIEW[key];
              return (
                <MenuItem key={key} value={key}>
                  <Chip
                    label={config.label}
                    color={config.color}
                    size="small"
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </MenuItem>
              );
            })}
          </Select>
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
            onClick={() => onDelete?.(room.id)}
          >
            Xóa
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RoomCard;

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  CardActionArea,
} from "@mui/material";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import { Link as RouterLink, useNavigate } from "react-router-dom";

interface Props {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  image: string;
  onBooking?: () => void;
}

const RoomCard = ({
  id,
  name,
  type,
  price,
  capacity,
  image,
  onBooking,
}: Props) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: "#FAFAFA",
        overflow: "hidden",
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/room-detail/${id}`}
        sx={{ textDecoration: "none", color: "inherit" }}
      >
        <CardMedia
          component="img"
          image={image}
          alt={name}
          sx={{
            width: "100%",
            height: 336,
            objectFit: "cover",
          }}
        />

        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {name}
          </Typography>

          <Stack direction="row" spacing={1}>
            <PeopleAltRoundedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {capacity} người
            </Typography>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <ApartmentRoundedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {type}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      <Stack
        direction="row"
        justifyContent={"space-between"}
        alignItems={"center"}
        p={2}
      >
        <Typography color="primary" fontWeight={700} fontSize={18}>
          {price.toLocaleString("vn-VN")} VND
        </Typography>
        <Button variant="contained" color="primary" onClick={onBooking}>
          Đặt phòng
        </Button>
      </Stack>
    </Card>
  );
};

export default RoomCard;

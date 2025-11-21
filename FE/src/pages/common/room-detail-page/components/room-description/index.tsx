import {
  Box,
  Grid,
  Typography,
  Stack,
  Button,
  Card,
  CardMedia,
  Chip,
  Rating,
} from "@mui/material";

import AcUnitIcon from "@mui/icons-material/AcUnit";
import AirIcon from "@mui/icons-material/Air";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import DeskIcon from "@mui/icons-material/Desk";
import WeekendIcon from "@mui/icons-material/Weekend";
import BalconyIcon from "@mui/icons-material/Balcony";
import WindowIcon from "@mui/icons-material/Window";
import TvIcon from "@mui/icons-material/Tv";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import MovieIcon from "@mui/icons-material/Movie";
import CableIcon from "@mui/icons-material/Cable";
import WifiIcon from "@mui/icons-material/Wifi";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import ShowerIcon from "@mui/icons-material/Shower";
import BathtubIcon from "@mui/icons-material/Bathtub";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import BathroomIcon from "@mui/icons-material/Bathroom";
import KitchenIcon from "@mui/icons-material/Kitchen";
import MicrowaveIcon from "@mui/icons-material/Microwave";
import KettleIcon from "@mui/icons-material/EmojiFoodBeverage";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import IronIcon from "@mui/icons-material/Iron";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalHotelIcon from "@mui/icons-material/LocalHotel";

import type { Amenity } from "@constant/types";
import { Call, CallRounded, Check, Person } from "@mui/icons-material";

type Props = {
  name: string;
  description?: string | null;
  capacity: number;
  basePrice: number;
  amenities?: Amenity[];
  rating: number;
  handleBookingRoom: () => void;
};

const iconColor = "#24AB70";

const amenityIconMap: Record<string, React.JSX.Element> = {
  AIR_CONDITIONER: <AcUnitIcon sx={{ color: iconColor }} />,
  FAN: <AirIcon sx={{ color: iconColor }} />,
  HEATER: <WhatshotIcon sx={{ color: iconColor }} />,
  WARDROBE: <CheckroomIcon sx={{ color: iconColor }} />,
  DESK: <DeskIcon sx={{ color: iconColor }} />,
  SOFA: <WeekendIcon sx={{ color: iconColor }} />,
  BALCONY: <BalconyIcon sx={{ color: iconColor }} />,
  WINDOW: <WindowIcon sx={{ color: iconColor }} />,

  TV: <TvIcon sx={{ color: iconColor }} />,
  SMART_TV: <SmartDisplayIcon sx={{ color: iconColor }} />,
  NETFLIX: <MovieIcon sx={{ color: iconColor }} />,
  CABLE_TV: <CableIcon sx={{ color: iconColor }} />,

  WIFI: <WifiIcon sx={{ color: iconColor }} />,
  HIGH_SPEED_INTERNET: <NetworkCheckIcon sx={{ color: iconColor }} />,

  SHOWER: <ShowerIcon sx={{ color: iconColor }} />,
  BATHTUB: <BathtubIcon sx={{ color: iconColor }} />,
  HAIR_DRYER: <LocalLaundryServiceIcon sx={{ color: iconColor }} />,
  TOWELS: <LocalLaundryServiceIcon sx={{ color: iconColor }} />,
  HOT_WATER: <WbTwilightIcon sx={{ color: iconColor }} />,
  TOILETRIES: <BathroomIcon sx={{ color: iconColor }} />,

  KITCHEN: <KitchenIcon sx={{ color: iconColor }} />,
  MICROWAVE: <MicrowaveIcon sx={{ color: iconColor }} />,
  KETTLE: <KettleIcon sx={{ color: iconColor }} />,
  FRIDGE: <KitchenOutlinedIcon sx={{ color: iconColor }} />,
  STOVE: <KitchenIcon sx={{ color: iconColor }} />,
  WASHER: <LocalLaundryServiceIcon sx={{ color: iconColor }} />,
  DRYER: <LocalLaundryServiceIcon sx={{ color: iconColor }} />,
  IRON: <IronIcon sx={{ color: iconColor }} />,

  FIRE_EXTINGUISHER: <LocalFireDepartmentIcon sx={{ color: iconColor }} />,
  SMOKE_DETECTOR: <LocalFireDepartmentIcon sx={{ color: iconColor }} />,
  FIRST_AID_KIT: <LocalHospitalIcon sx={{ color: iconColor }} />,
  ROOM_SERVICE: <RoomServiceIcon sx={{ color: iconColor }} />,
  DAILY_CLEANING: <CleaningServicesIcon sx={{ color: iconColor }} />,
};

function getAmenityIcon(code: string) {
  return amenityIconMap[code] ?? <CheckCircleOutlineIcon />;
}

const RoomDescription = ({
  name,
  description,
  capacity,
  basePrice,
  amenities,
  rating,
  handleBookingRoom,
}: Props) => {
  const safeAmenities = amenities?.slice(0, 6) ?? [];

  return (
    <Box mt={6}>
      {/* Header + ảnh + box giá */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box mb={2.5}>
            <Typography variant="h5" fontWeight={700} mb={1}>
              Phòng {name}
            </Typography>
            <Stack direction={"row"} alignContent={"center"} spacing={1}>
              <Chip
                icon={<Person />}
                label={`${capacity} người`}
                sx={{
                  p: 1,
                  bgcolor: "#E2F5EF",
                  color: "#219A65",
                  "& .MuiChip-icon": {
                    color: "#219A65",
                  },
                }}
                size="small"
              />
              <Rating value={rating} precision={0.1} readOnly />
            </Stack>
          </Box>
          {/* Tiện nghi */}
          {!!safeAmenities.length && (
            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid #eee",
                p: 2.5,
                mb: 2.5,
              }}
            >
              <Typography variant="h6" fontWeight={700} mb={2}>
                Tiện nghi được cung cấp
              </Typography>

              <Grid container spacing={2}>
                {safeAmenities.map((a) => (
                  <Grid key={a.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {getAmenityIcon(a.code)}
                      <Typography variant="body2">{a.label}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          {/* Mô tả */}
          {description && (
            <Box sx={{ borderRadius: 2, border: "1px solid #eee", p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={1}>
                Mô tả
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2.5,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography fontSize={14}>Giá/ phòng/ đêm từ</Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#F6781E"
              textAlign={"center"}
            >
              {basePrice?.toLocaleString("vi-VN")} VND
            </Typography>
            <Stack
              fontSize={12}
              direction={"row"}
              gap={0.5}
              alignContent={"center"}
            >
              <Check sx={{ color: iconColor }} fontSize="small" />
              Miễn phí huỷ phòng trước 1 ngày
            </Stack>

            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: 999 }}
              fullWidth
              onClick={handleBookingRoom}
            >
              Đặt phòng
            </Button>
            <Button
              variant="contained"
              // color="primary"
              sx={{ borderRadius: 999, bgcolor: "#F5F8F7", color: "#24AB70" }}
              fullWidth
            >
              <CallRounded sx={{ color: iconColor, mr: 1 }} fontSize="small" />
              Liên hệ ngay
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomDescription;

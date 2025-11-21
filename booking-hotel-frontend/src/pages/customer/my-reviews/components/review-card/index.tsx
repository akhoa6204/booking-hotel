import { Box, Button, Rating, Stack, Typography } from "@mui/material";
import { CalendarMonthRounded, LocationOnRounded } from "@mui/icons-material";
import { BookingStatus } from "@constant/types";

type ReviewCardProps = {
  image: string;
  roomName: string;
  roomType: string;
  fromDate: string;
  toDate: string;
  comment: string;
  rating: number;
  onClick?: () => void;
};

const ReviewCard = ({
  image,
  roomName,
  roomType,
  fromDate,
  toDate,
  rating,
  comment,
  onClick,
}: ReviewCardProps) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e5e5e5",
        bgcolor: "#F5F8F7",
        alignItems: "stretch",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <Box
        component="img"
        src={image}
        sx={{
          width: 220,
          height: 150,
          flexShrink: 0,
          borderRadius: 2,
          objectFit: "cover",
        }}
      />

      <Box sx={{ flex: 1, display: "flex" }}>
        <Stack
          spacing={2.5}
          justifyContent="space-between"
          sx={{ flex: 1, height: "100%" }}
        >
          <Box>
            <Typography fontSize={20} fontWeight={600}>
              Phòng {roomName}
            </Typography>

            <Typography color="text.secondary" mb={1.5} fontSize={14}>
              {roomType}
            </Typography>

            <Rating value={rating} precision={0.1} readOnly />

            <Typography color="text.secondary" fontSize={14} mb={1.5}>
              {fromDate} - {toDate}
            </Typography>

            <Typography
              color="text.secondary"
              mb={1.5}
              fontSize={14}
              className="line-clamp-2"
            >
              {comment}
            </Typography>
            <Box textAlign={"right"}>
              <Button
                variant="outlined"
                sx={{ px: 2, py: 0.5, borderRadius: 1 }}
              >
                Xem đánh giá
              </Button>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};

export default ReviewCard;

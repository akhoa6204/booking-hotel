import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

const BookingHeaderSkeleton = () => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mb={1.5}
      bgcolor="white"
      px={2.5}
      py={2}
    >
      {/* Back Button + label */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton disabled>
          <ArrowBack />
        </IconButton>
        <Skeleton variant="text" width={70} height={22} />
      </Stack>

      {/* Right info */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="text" width={130} height={22} />

        <Divider orientation="vertical" flexItem />

        <Skeleton variant="text" width={100} height={22} />
      </Stack>
    </Stack>
  );
};

export default BookingHeaderSkeleton;

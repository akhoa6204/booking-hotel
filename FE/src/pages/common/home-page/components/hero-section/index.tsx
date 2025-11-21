import { BgHome } from "@assets/images";
import { Box, Grid, Stack, Typography } from "@mui/material";
import RoomRoundedIcon from "@mui/icons-material/RoomRounded";

import SearchBar from "../search-bar";
import { Errors, FormBooking } from "@constant/types";
interface Props {
  form: FormBooking;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
const HeroSection: React.FC<Props> = (props) => {
  return (
    <Box position={"relative"} paddingY={"20px"} mb={"100px"}>
      <Grid
        container
        sx={{
          borderRadius: 8,
          overflow: "hidden",
          bgcolor: "rgba(36,171,112,0.05)",
        }}
      >
        <Grid
          size={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 4,
          }}
        >
          <Box sx={{ mb: 2.5 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 48,
              }}
            >
              Trải nghiệm cùng
            </Typography>
            <Typography
              color="primary"
              sx={{
                fontWeight: 700,
                fontSize: 48,
              }}
            >
              Skyline Đà Nẵng
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ fontSize: 16 }}
            color="text.secondary"
          >
            Chọn đúng nơi, tận hưởng đúng trải nghiệm.
          </Typography>
        </Grid>
        <Grid size={6} sx={{ position: "relative" }}>
          <Box
            component="img"
            src={BgHome}
            alt="Hotel background"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          <Box sx={{ position: "absolute", top: "30%", right: "10%" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "#fff",
                borderRadius: 9999,
                px: 2.5,
                py: 1.25,
                boxShadow: 3,
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RoomRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: 12 }}
                color="text.secondary"
              >
                71 Ngũ Hành Sơn, Đà Nẵng
              </Typography>
            </Box>

            <Box
              sx={{
                position: "absolute",
                top: "60%",
                left: -11,
                width: 22,
                height: 44,
                borderLeft: "1px solid white",
                borderTop: "1px solid white",
                borderTopLeftRadius: 4,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: "-20%",
                  width: 8,
                  height: 8,
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: "50%",
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Stack
        direction={"row"}
        justifyContent={"center"}
        sx={{
          position: "absolute",
          bottom: "5%",
          left: 0,
          right: 0,
        }}
      >
        <SearchBar {...props} />
      </Stack>
    </Box>
  );
};
export default HeroSection;

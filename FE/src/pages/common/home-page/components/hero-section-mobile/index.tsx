import SearchBarMobile from "@components/search-bar-mobile";
import { Errors, FormBooking } from "@constant/types";
import { Box, Container, Typography } from "@mui/material";
interface Props {
  form: FormBooking;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
const HeroSectionMobile: React.FC<Props> = (props) => {
  return (
    <>
      <Box
        sx={{ bgcolor: "rgba(36,171,112,0.05)", height: 236 }}
        position={"relative"}
      >
        <Container>
          <Box sx={{ py: 5 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 28,
              }}
            >
              Trải nghiệm cùng
            </Typography>
            <Typography
              color="primary"
              sx={{
                fontWeight: 700,
                fontSize: 28,
              }}
            >
              Skyline Đà Nẵng
            </Typography>
          </Box>
        </Container>
      </Box>
      <Container
        sx={{
          transform: "translateY(-80px)",
        }}
      >
        <SearchBarMobile {...props} />
      </Container>
    </>
  );
};
export default HeroSectionMobile;

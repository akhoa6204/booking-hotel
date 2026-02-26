import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { NotFoundImg } from "../../../assets/images";
import useAuth from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";
const NotFoundPage = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleBackHome = () => {
    if (user && !hasRole("CUSTOMER"))
      return hasRole("ADMIN")
        ? navigate("/manager/dashboard")
        : navigate("/manager/bookings");
    return navigate("/");
  };
  return (
    <Container>
      <Grid
        container
        my={10}
        justifyContent={"center"}
        alignItems={"center"}
        spacing={5}
      >
        <Grid size={6}>
          <Box>
            <img src={NotFoundImg} alt="" />
          </Box>
        </Grid>
        <Grid size={6}>
          <Typography
            variant="h1"
            color="primary"
            fontWeight={600}
            fontSize={58}
          >
            404 not found
          </Typography>
          <Typography variant="body1" color="#89CCAA" fontSize={24}>
            Looking something we don’t serve?
          </Typography>
          <Stack direction={"row"}>
            <Typography
              variant="body1"
              sx={{ textDecoration: "underline", color: "#295040" }}
              mr={2}
              fontSize={16}
              onClick={handleBackHome}
            >
              back to home
            </Typography>
            <Typography
              variant="body1"
              sx={{ textDecoration: "underline", color: "#295040" }}
              fontSize={16}
            >
              contact us
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};
export default NotFoundPage;

import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Link as MuiLink,
  IconButton,
  Divider,
} from "@mui/material";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import GoogleIcon from "@mui/icons-material/Google";
import { Link } from "react-router-dom";

const cols = [
  {
    title: "Home",
    items: [
      { label: "Booking", to: "/booking" },
      { label: "Facilities", to: "/facilities" },
      { label: "Location", to: "/location" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "About Us", to: "/about" },
      { label: "Help center", to: "/help" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "FAQs", to: "/faqs" },
    ],
  },
  {
    title: "Get the app",
    items: [
      { label: "iOS app", to: "/app/ios" },
      { label: "Android app", to: "/app/android" },
    ],
  },
];

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: "#24ab700d", pt: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left intro */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h5"
              color="primary"
              fontWeight={700}
              sx={{ cursor: "pointer", mb: 2 }}
            >
              Skyline
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton
                aria-label="facebook"
                sx={{
                  bgcolor: "#1877F2",
                  color: "#fff",
                  "&:hover": { bgcolor: "#1877F2", opacity: 0.9 },
                }}
              >
                <FacebookRoundedIcon />
              </IconButton>

              <IconButton
                aria-label="instagram"
                sx={{
                  bgcolor: "#E4405F",
                  color: "#fff",
                  "&:hover": { bgcolor: "#E4405F", opacity: 0.9 },
                }}
              >
                <InstagramIcon />
              </IconButton>

              <IconButton
                aria-label="google"
                sx={{
                  bgcolor: "#DB4437",
                  color: "#fff",
                  "&:hover": { bgcolor: "#DB4437", opacity: 0.9 },
                }}
              >
                <GoogleIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Columns */}
          {cols.map((c) => (
            <Grid key={c.title} size={{ xs: 6, md: 2.666 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {c.title}
              </Typography>
              <Stack spacing={1.5}>
                {c.items.map((it) => (
                  <MuiLink
                    key={it.label}
                    component={Link}
                    to={"/"}
                    underline="none"
                    color="text.primary"
                    sx={{ "&:hover": { color: "primary.main" } }}
                  >
                    {it.label}
                  </MuiLink>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ pb: 4 }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Skyline. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <MuiLink
              component={Link}
              to=""
              underline="hover"
              color="text.secondary"
            >
              Terms
            </MuiLink>
            <MuiLink
              component={Link}
              to=""
              underline="hover"
              color="text.secondary"
            >
              Privacy
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;

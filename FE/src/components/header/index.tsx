import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Slide,
  Stack,
  Typography,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutline from "@mui/icons-material/PersonOutline";
import LockReset from "@mui/icons-material/LockReset";
import Logout from "@mui/icons-material/Logout";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "@hooks/useAuth";
import { useAppDispatch } from "@hooks/useRedux";
import { logout } from "@store/slice/account.slice";

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const navLinks = [
  { label: "Trang chủ", link: "/" },
  { label: "Đặt phòng", link: "/booking" },
];

function UserMenu({
  userName,
  onProfile,
  onChangePassword,
  onLogout,
}: {
  userName: string;
  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      {/* Trigger – dùng Tailwind cho hover, không dùng onMouseEnter/onMouseLeave */}
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="flex items-center gap-2 cursor-pointer bg-transparent border-0 outline-none"
      >
        <Avatar sx={{ width: 32, height: 32 }}>
          {userName?.[0]?.toUpperCase() ?? "U"}
        </Avatar>
        <span className="font-semibold hover:text-emerald-600 transition-colors">
          {userName}
        </span>
      </button>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 2,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onProfile();
          }}
        >
          <ListItemIcon>
            <PersonOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Thông tin cá nhân" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onChangePassword();
          }}
        >
          <ListItemIcon>
            <LockReset fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Đổi mật khẩu" />
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onLogout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </MenuItem>
      </Menu>
    </>
  );
}

const Header = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const transition = { type: "spring", stiffness: 260, damping: 20 } as const;

  const { user } = useAuth();

  const renderNav = (mobile = false) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        gap: mobile ? 16 / 8 : 32 / 8,
        alignItems: mobile ? "flex-start" : "center",
      }}
    >
      {navLinks.map((n, i) => (
        <MotionBox
          key={n.link}
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.06, ...transition },
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <NavLink
            to={n.link}
            onClick={() => mobile && setOpen(false)}
            className="no-underline"
          >
            {({ isActive }) => (
              <span
                className={[
                  "relative px-2 py-1 text-sm font-medium transition-colors",
                  isActive
                    ? "text-emerald-600"
                    : "text-slate-900 hover:text-emerald-600",
                  "after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-emerald-600 after:transition-transform after:origin-left",
                  isActive ? "after:scale-x-100" : "after:scale-x-0",
                ].join(" ")}
              >
                {n.label}
              </span>
            )}
          </NavLink>
        </MotionBox>
      ))}
    </Box>
  );

  const goProfile = () => navigate("/account/profile?tab=info");
  const goChangePassword = () => navigate("/account/profile?tab=security");
  const doLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <HideOnScroll>
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          bgcolor: "#24ab700d",
          borderBottom: "1px solid rgba(0,0,0,.06)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            py={{ xs: 1.5, md: 2 }}
          >
            {/* Logo */}
            <Typography
              variant="h5"
              color="primary"
              fontWeight={700}
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Skyline
            </Typography>

            {/* Desktop nav */}
            {!isMobile && (
              <>
                <Stack direction="row" spacing={4} alignItems="center">
                  {renderNav(false)}
                </Stack>

                {user ? (
                  <UserMenu
                    userName={user.fullName || user.name || "User"}
                    onProfile={goProfile}
                    onChangePassword={goChangePassword}
                    onLogout={doLogout}
                  />
                ) : (
                  <MotionBox
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Button
                      component={Link}
                      to="/login"
                      fullWidth
                      variant="contained"
                      sx={{ borderRadius: "999px", py: 1.2 }}
                    >
                      Đăng nhập
                    </Button>
                  </MotionBox>
                )}
              </>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <MotionIconButton
                onClick={() => setOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="open menu"
              >
                <MenuIcon />
              </MotionIconButton>
            )}
          </Stack>
        </Container>

        {/* Drawer mobile */}
        <Drawer
          anchor="right"
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              width: "100%",
              maxWidth: 320,
              background: "rgba(255,255,255,.98)",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <MotionBox
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition }}
            sx={{ height: 1, display: "flex", flexDirection: "column", p: 3 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={3}
            >
              <Typography
                variant="h5"
                color="primary"
                fontWeight={700}
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/");
                  setOpen(false);
                }}
              >
                Skyline
              </Typography>
              <IconButton onClick={() => setOpen(false)} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Stack>

            {renderNav(true)}

            <Box mt="auto" pt={3}>
              {user ? (
                <Stack spacing={1.2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setOpen(false);
                      goProfile();
                    }}
                    sx={{ borderRadius: "999px", py: 1.1 }}
                  >
                    Thông tin cá nhân
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setOpen(false);
                      goChangePassword();
                    }}
                    sx={{ borderRadius: "999px", py: 1.1 }}
                  >
                    Đổi mật khẩu
                  </Button>
                  <Button
                    fullWidth
                    color="error"
                    variant="contained"
                    onClick={() => {
                      setOpen(false);
                      doLogout();
                    }}
                    sx={{ borderRadius: "999px", py: 1.2 }}
                  >
                    Đăng xuất
                  </Button>
                </Stack>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  fullWidth
                  variant="contained"
                  onClick={() => setOpen(false)}
                  sx={{ borderRadius: "999px", py: 1.2 }}
                >
                  Đăng nhập
                </Button>
              )}
            </Box>
          </MotionBox>
        </Drawer>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header;

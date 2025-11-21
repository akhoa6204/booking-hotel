import {
  Avatar,
  Box,
  Card,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HistoryIcon from "@mui/icons-material/History";
import ReviewsIcon from "@mui/icons-material/Reviews";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@hooks/useRedux";
import { logout } from "@store/slice/account.slice";

type NavItem = {
  label: string;
  icon: React.ReactElement;
  to?: string;
  action?: "logout";
};

const navItems: NavItem[] = [
  {
    label: "Hồ sơ của tôi",
    icon: <PersonOutlineIcon fontSize="small" />,
    to: "/account/profile",
  },
  {
    label: "Lịch sử đặt phòng",
    icon: <HistoryIcon fontSize="small" />,
    to: "/account/bookings",
  },
  {
    label: "Đánh giá",
    icon: <ReviewsIcon fontSize="small" />,
    to: "/account/reviews",
  },
  {
    label: "Đăng xuất",
    icon: <LogoutIcon fontSize="small" />,
    action: "logout",
  },
];

const AccountSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.account.user); 
  const fullName = user?.fullName || user?.name || "User";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActivePath = (to?: string) => {
    if (!to) return false;
    return location.pathname.startsWith(to);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        overflow: "hidden",
      }}
    >
      {/* Header user */}
      <Box px={2.5} py={2} display="flex" alignItems="center" gap={1.5}>
        <Avatar sx={{ bgcolor: "warning.main", width: 36, height: 36 }}>
          {fullName[0]?.toUpperCase() ?? "U"}
        </Avatar>
        <Typography fontWeight={600}>{fullName}</Typography>
      </Box>

      <Divider />

      {/* Menu items */}
      <List disablePadding>
        {navItems.map((item) => {
          const active = isActivePath(item.to);

          const commonProps = {
            sx: {
              py: 1.1,
              px: 2.5,
              borderRadius: 0,
              bgcolor: active ? "#24AB70" : "transparent",
              color: active ? "common.white" : "text.primary",
              "& .MuiListItemIcon-root": {
                color: active ? "common.white" : "text.secondary",
                minWidth: 32,
              },
              "&:hover": {
                bgcolor: active ? "#1f8f5f" : "grey.50",
              },
            },
          };

          if (item.action === "logout") {
            return (
              <ListItemButton
                key={item.label}
                onClick={handleLogout}
                {...commonProps}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          }

          return (
            <ListItemButton
              key={item.label}
              component={RouterLink}
              to={item.to!}
              {...commonProps}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Card>
  );
};

export default AccountSidebar;

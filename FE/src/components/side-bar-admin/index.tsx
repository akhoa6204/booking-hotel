import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import {
  Dashboard,
  BarChart,
  Assignment,
  Hotel,
  LocalOffer,
  BookOnline,
  Reviews,
  People,
} from "@mui/icons-material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@store/slice/account.slice";
import useAuth from "@hooks/useAuth";
import { UserRole } from "@constant/types";

const menuItems = [
  {
    label: "Dashboard",
    icon: <Dashboard />,
    path: "/manager/dashboard",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Quản lý phòng",
    icon: <BarChart />,
    path: "/manager/rooms",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Quản lý loại phòng",
    icon: <Assignment />,
    path: "/manager/room-types",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Quản lý đặt phòng",
    icon: <BookOnline />,
    path: "/manager/bookings",
    allowedRoles: ["ADMIN", "MANAGER", "RECEPTION"],
  },
  {
    label: "Quản lý khuyến mãi",
    icon: <LocalOffer />,
    path: "/manager/promotions",
    allowedRoles: ["ADMIN", "MANAGER", "RECEPTION"],
  },
  {
    label: "Quản lý đánh giá",
    icon: <Reviews />,
    path: "/manager/reviews",
    allowedRoles: ["ADMIN", "MANAGER", "RECEPTION"],
  },
  {
    label: "Quản lý nhân viên",
    icon: <People />,
    path: "/manager/employees",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
];

const AdminSideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogOut = () => {
    localStorage.removeItem("accessToken");
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const { hasRole } = useAuth();

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.allowedRoles.length === 0 ||
      item.allowedRoles.some((role: UserRole) => hasRole(role)),
  );

  return (
    <Box className="h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <Box className="p-6">
        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary"
          className="select-none"
        >
          Skyline
        </Typography>
      </Box>

      {/* Menu */}
      <List className="flex-1 space-y-1">
        {filteredMenuItems.map((item) => {
          const active = location.pathname.startsWith(item.path);

          return (
            <NavLink key={item.path} to={item.path}>
              <ListItemButton
                selected={active}
                sx={{
                  borderRadius: "8px",
                  mx: 1,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(46, 125, 50, 0.1)",
                    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                      color: "primary.main",
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: active ? "primary" : "grey.500", minWidth: 40 }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    color: active ? "primary" : "text.secondary",
                  }}
                />
              </ListItemButton>
            </NavLink>
          );
        })}
      </List>
      <Button sx={{ mb: 2 }} onClick={handleLogOut}>
        Đăng xuất
      </Button>
    </Box>
  );
};

export default AdminSideBar;

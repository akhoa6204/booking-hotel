import {
  DefaultLayout,
  AccountLayout,
  AdminLayout,
  RootLayout,
} from "@layouts";
import {
  BookingManagement,
  DashboardPage,
  HomePage,
  LoginPage,
  PromotionManagement,
  ReviewManagement,
  RoomsManagement,
  RoomTypesManagement,
  RoomDetail,
  BookingPage,
  ProfilePage,
  MyBookingPage,
  BookingDetailPage,
  MyReviewPage,
  ReviewDetailPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  NotFoundPage,
  EmployeeManagement,
  FrontDeskPage,
  HouseKeepingPage,
  ShiftManagementPage,
  ServiceManagementPage,
  SearchPage,
  PaymentPage,
} from "@pages";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { CustomerRoute, AdminRoute, StaffRoute } from "./ProtectedRoute";
import HeaderOnlyLayout from "@layouts/header-only";
import PublicGate, { UnProtectedRoute } from "./UnProtectedRoute";

const paths = [
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicGate />,
        children: [
          {
            element: <DefaultLayout />,
            children: [
              {
                path: "/",
                element: <HomePage />,
              },
              {
                path: "/room-detail/:id",
                element: <RoomDetail />,
              },
              {
                path: "/booking",
                element: <BookingPage />,
              },
              {
                path: "/search",
                element: <SearchPage />,
              },
              {
                path: "/payment",
                element: <PaymentPage />,
              },
            ],
          },
          {
            element: <CustomerRoute />,
            path: "/account",
            children: [
              {
                element: <AccountLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="profile" replace />,
                  },
                  {
                    path: "profile",
                    element: <ProfilePage />,
                  },
                  {
                    path: "bookings",
                    element: <MyBookingPage />,
                  },
                  {
                    path: "bookings/:id",
                    element: <BookingDetailPage />,
                  },
                  {
                    path: "reviews",
                    element: <MyReviewPage />,
                  },
                  {
                    path: "reviews/:id",
                    element: <ReviewDetailPage />,
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        element: <UnProtectedRoute />,
        children: [
          {
            element: <HeaderOnlyLayout />,
            children: [
              {
                path: "/login",
                element: <LoginPage />,
              },
              {
                path: "/register",
                element: <RegisterPage />,
              },
              {
                path: "/forgot-password",
                element: <ForgotPasswordPage />,
              },
              {
                path: "/reset-password",
                element: <ResetPasswordPage />,
              },
            ],
          },
        ],
      },
      {
        path: "/manager",
        element: <StaffRoute roles={["RECEPTION", "HOUSEKEEPING"]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                element: <StaffRoute roles={["RECEPTION"]} />,
                children: [
                  {
                    path: "bookings",
                    element: <BookingManagement />,
                  },
                  {
                    path: "front-desk",
                    element: <FrontDeskPage />,
                  },
                  {
                    path: "reviews",
                    element: <ReviewManagement />,
                  },
                ],
              },

              {
                path: "housekeeping-tasks",
                element: <HouseKeepingPage />,
              },

              {
                path: "shifts",
                element: <ShiftManagementPage />,
              },

              {
                element: <AdminRoute />,
                children: [
                  {
                    path: "rooms",
                    element: <RoomsManagement />,
                  },
                  {
                    path: "room-types",
                    element: <RoomTypesManagement />,
                  },
                  {
                    path: "dashboard",
                    element: <DashboardPage />,
                  },
                  {
                    path: "employees",
                    element: <EmployeeManagement />,
                  },
                  {
                    path: "promotions",
                    element: <PromotionManagement />,
                  },
                  {
                    path: "services",
                    element: <ServiceManagementPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

const router = createBrowserRouter(paths);
export default router;

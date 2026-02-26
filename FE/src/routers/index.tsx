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
        element: <StaffRoute roles={["RECEPTION"]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="bookings" replace />,
              },
              {
                path: "promotions",
                element: <PromotionManagement />,
              },
              {
                path: "bookings",
                element: <BookingManagement />,
              },
              {
                path: "reviews",
                element: <ReviewManagement />,
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

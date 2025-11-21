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
} from "@pages";
import { createBrowserRouter } from "react-router-dom";
import { CustomerRoute, ManagerRoute } from "./ProtectedRoute";
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
        element: <ManagerRoute />,
        children: [
          {
            element: <AdminLayout />,
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
                path: "promotions",
                element: <PromotionManagement />,
              },
              {
                path: "bookings",
                element: <BookingManagement />,
              },
              {
                path: "dashboard",
                element: <DashboardPage />,
              },
              {
                path: "reviews",
                element: <ReviewManagement />,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <DefaultLayout />,
        children: [{ element: <HomePage /> }],
      },
    ],
  },
];

const router = createBrowserRouter(paths);
export default router;

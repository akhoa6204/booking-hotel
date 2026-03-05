import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import { authRouter } from "./routes/auth.routes.js";
import { adminRoomsRouter, roomsRouter } from "./routes/rooms.routes.js";
import {
  adminBookingsRouter,
  bookingsRouter,
} from "./routes/bookings.routes.js";
import { adminPaymentRouter } from "./routes/payments.routes.js";
import { hotelsRouter } from "./routes/hotels.routes.js";
import { servicesRouter } from "./routes/services.routes.js";
import { promosRouter } from "./routes/promotions.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { reviewsRouter } from "./routes/reviews.routes.js";
import { searchRouter } from "./routes/search.routes.js";
import {
  roomTypeRoute,
  roomTypeAdminRoute,
} from "./routes/roomTypes.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { amenitiesRouter } from "./routes/amenities.routes.js";
import { employeesRouter } from "./routes/employees.routes.js";
import { shiftsRouter } from "./routes/shifts.routes.js";

dotenv.config();

export const app = express();

app.use(morgan("dev"));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Public
app.use("/api/auth", authRouter);
// app.use("/api/hotels", hotelsRouter);
// app.use("/api/services", servicesRouter);
app.use("/api/promotions", promosRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);
// app.use("/api/notifications", notificationsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/room-types", roomTypeRoute);
app.use("/api/rooms", roomsRouter);

// Admin
app.use("/api/admin/room-types", roomTypeAdminRoute);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/amenities", amenitiesRouter);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/admin/rooms", adminRoomsRouter);
app.use("/api/admin/promotions", promosRouter);
app.use("/api/admin/payments", adminPaymentRouter);
app.use("/api/admin/employees", employeesRouter);
app.use("/api/admin/shifts", shiftsRouter);

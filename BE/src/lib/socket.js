import { Server } from "socket.io";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_booking", (bookingId) => {
      console.log("join booking room:", `booking_${bookingId}`);
      socket.join(`booking_${bookingId}`);
    });

    socket.on("leave_booking", (bookingId) => {
      socket.leave(`booking_${bookingId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

export function getIO() {
  if (!io) throw new Error("Socket chưa khởi tạo");
  return io;
}

import { useEffect } from "react";
import { socket } from "../socket.js";

type UseSocketOptions = {
  event?: string;
  handler?: (data: any) => void;
  room?: string;
};

export default function useSocket({ event, handler, room }: UseSocketOptions) {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (room) {
      socket.emit("join_booking", room);
    }

    if (event && handler) {
      socket.on(event, handler);
    }

    return () => {
      if (room) {
        socket.emit("leave_booking", room);
      }

      if (event && handler) {
        socket.off(event, handler);
      }
    };
  }, [event, handler, room]);
}

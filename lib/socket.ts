// so apparently this is for persistent socket connection across ALL pages
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // we’ll connect manually
  transports: ['polling', 'websocket'],
});

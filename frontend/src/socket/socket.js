import { io } from "soket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: false,
});

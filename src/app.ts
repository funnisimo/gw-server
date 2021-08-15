import express from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";

const app = express();
const httpServer = http.createServer(app);

app.use("/", express.static("dist"));

const io = new Server(httpServer, {
  // ...
});

function sendRandomDraw(socket: Socket, w: number, h: number) {
  const x = Math.floor(Math.random() * w);
  const y = Math.floor(Math.random() * h);
  const fg = Math.floor(Math.random() * 0x1000);
  const bg = Math.floor(Math.random() * 0x1000);
  const glyph = 65 + Math.floor(Math.random() * 26);

  socket.emit("draw", { x, y, ch: glyph, fg, bg });
}

io.on("connection", (socket: Socket) => {
  console.log("IO Connected!");
  socket.emit("hello", { width: 30, height: 30 });

  const interval = setInterval(() => {
    sendRandomDraw(socket, 30, 30);
  }, 500);

  socket.on("disconnect", () => {
    console.log("disonnect");
    clearInterval(interval);
  });

  socket.on("click", (data) => {
    console.log("click", data);
    socket.emit("draw", { x: data.x, y: data.y, ch: " ", fg: 0x0, bg: 0x0 });
  });

  socket.on("move", (data) => {
    socket.emit("draw", { x: data.x, y: data.y, ch: " ", fg: 0x0, bg: 0x0 });
  });
});

httpServer.listen(3000, () => {
  console.log("listening on *:3000");
});

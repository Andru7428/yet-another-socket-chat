const express = require("express");
const { copyFileSync } = require("fs");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

let rooms = ["default"];

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("public/chat.html", { root: __dirname });
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.room = socket.handshake.auth.room;
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  socket.join(socket.room);

  console.log(`${socket.username} connected to room ${socket.room}`);

  socket.on("disconnect", () => {
    console.log(`${socket.username} disconnected`);
    socket.broadcast.to(socket.room).emit("user disconnected", {
      userID: socket.id,
      username: socket.username,
    });
  });

  socket.on("message", (msg) => {
    io.to(socket.room).emit("message", {
      username: socket.username,
      text: msg,
    });
    console.log("message: " + msg);
  });

  socket.on("create room", (room_name) => {
    if (!rooms.includes(room_name)) {
      rooms.push(room_name);
      io.emit("room created", room_name);
    }
  });

  const users = [];
  for (let [id, sckt] of io.of("/").sockets) {
    if (sckt.room == socket.room)
      users.push({
        userID: id,
        username: sckt.username,
      });
  }

  socket.emit("users", users);

  socket.emit("rooms", rooms);

  socket.broadcast.to(socket.room).emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

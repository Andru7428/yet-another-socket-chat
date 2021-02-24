const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 80;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("public/chat.html", { root: __dirname });
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  console.log(`${socket.username} connected`);

  socket.on("disconnect", () => {
    console.log(`${socket.username} disconnected`);
    socket.broadcast.emit("user disconnected", {
      userID: socket.id,
      username: socket.username,
    });
  });

  socket.on("message", (msg) => {
    io.emit("message", { username: socket.username, text: msg });
    console.log("message: " + msg);
  });

  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit("users", users);

  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const socket = io({ autoConnect: false });
var username, current_room;

window.onload = () => {
  var username_input = document.getElementById("username_input");
  document.getElementById("username_form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (username_input.value) {
      username = username_input.value;
      connect(username, "default");
      overlay.remove();
    }
  });
  username_input.focus();

  var message_input = document.getElementById("message_input");
  document.getElementById("message_form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (message_input.value) {
      socket.emit("message", message_input.value);
      message_input.value = "";
    }
  });

  var room_input = document.getElementById("room_input");
  document.getElementById("room_form").addEventListener("submit", (e) => {
    console.log(room_input.value);
    e.preventDefault();
    if (room_input.value) {
      socket.emit("create room", room_input.value);
      room_input.value = "";
    }
  });
};

socket.on("message", (msg) => {
  addMessage(`${msg.username}: ${msg.text}`);
});

socket.on("users", (io_users) => {
  io_users.forEach((user) => {
    var item = document.createElement("li");
    item.id = user.userID;
    item.textContent = user.username;
    users.appendChild(item);
  });
});

socket.on("rooms", (rooms) => {
  rooms.forEach((room) => {
    addRoom(room);
  });
});

socket.on("room created", (room) => {
  addRoom(room);
});

socket.on("user connected", (user) => {
  var item = document.createElement("li");
  item.id = user.userID;
  item.textContent = user.username;
  users.appendChild(item);
  addMessage(
    `[${new Date().toLocaleTimeString()}] ${user.username} has connected`
  );
});

socket.on("user disconnected", (user) => {
  document.getElementById(user.userID).remove();
  addMessage(
    `[${new Date().toLocaleTimeString()}] ${user.username} has disconnected`
  );
});

function addMessage(text) {
  var item = document.createElement("li");
  item.textContent = text;
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
}

function connect(username, room) {
  if (current_room == room) return;
  current_room = room;
  rooms_list.innerHTML = "";
  messages.innerHTML = "";
  users.innerHTML = "";
  socket.auth = { username, room };
  socket.connect();
  addMessage(`[${new Date().toLocaleTimeString()}] ${username} has connected`);
}

function addRoom(room) {
  var item = document.createElement("li");
  item.textContent = room;
  item.id = "room_" + room;
  item.classList.add("room_button");
  item.addEventListener("click", (e) => {
    socket.disconnect();
    connect(username, room);
  });
  if (room == current_room) {
    console.log(room);
    item.style.backgroundColor = "CornflowerBlue";
  }
  rooms_list.appendChild(item);
}

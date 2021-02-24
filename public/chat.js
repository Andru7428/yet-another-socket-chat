const socket = io({ autoConnect: false });
var username;

socket.on("message", (msg) => {
  var item = document.createElement("li");
  item.textContent = `${msg.username}: ${msg.text}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("users", (io_users) => {
  io_users.forEach((user) => {
    var item = document.createElement("li");
    item.id = user.userID;
    item.textContent = user.username;
    users.appendChild(item);
  });
});

socket.on("user connected", (user) => {
  var item = document.createElement("li");
  item.id = user.userID;
  item.textContent = user.username;
  users.appendChild(item);

  var item = document.createElement("li");
  item.textContent = `${user.username} has connected`;
  messages.appendChild(item);
});

socket.on("user disconnected", (user) => {
  document.getElementById(user.userID).remove();

  var item = document.createElement("li");
  item.textContent = `${user.username} has disconnected`;
  messages.appendChild(item);
});

window.onload = () => {
  var username_input = document.getElementById("username_input");
  document.getElementById("username_form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (username_input.value) {
      socket.auth = { username: username_input.value };
      socket.connect();
    }
  });

  var message_input = document.getElementById("message_input");
  document.getElementById("message_form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (message_input.value) {
      socket.emit("message", message_input.value);
      message_input.value = "";
    }
  });

  /*
  for (let i = 0; i < 30; i++) {
    var item = document.createElement("li");
    item.textContent = i;
    messages.appendChild(item);
  }
  */
};

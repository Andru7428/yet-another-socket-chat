const socket = io({ autoConnect: false });
var username;

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

socket.on("user connected", (user) => {
  var item = document.createElement("li");
  item.id = user.userID;
  item.textContent = user.username;
  users.appendChild(item);
  addMessage(`${user.username} has connected`);
});

socket.on("user disconnected", (user) => {
  document.getElementById(user.userID).remove();
  addMessage(`${user.username} has disconnected`);
});

window.onload = () => {
  var username_input = document.getElementById("username_input");
  document.getElementById("username_form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (username_input.value) {
      username = username_input.value;
      socket.auth = { username };
      socket.connect();
      overlay.remove();
      message_input.focus();
      var item = document.createElement("li");
      item.textContent = `${username} has connected`;
      messages.appendChild(item);
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
};

function addMessage(text) {
  var item = document.createElement("li");
  item.textContent = text;
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
}

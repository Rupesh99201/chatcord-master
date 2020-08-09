const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log(username, room);

const socket = io();

//Join Chat room

socket.emit("joinRoom", { username, room });

// Get Room and user

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  console.log(message);
  outPutMessage(message);

  //message window scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message Submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //  Get Message text
  const msg = e.target.elements.msg.value;
  //console.log(msg);

  // Emit message to the server
  socket.emit("chatMessage", msg);

  //Clear message and add focus on input field
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//Output Message to DOM

function outPutMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = ` <p class="meta">${message.name} <span>${message.time}</span></p>
  <p class="text">
   ${message.msg}
  </p>`;

  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
      ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}

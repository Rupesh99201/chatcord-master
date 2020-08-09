//npm run dev
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./public/utils/messages");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
} = require("./public/utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder to join a page
app.use(express.static(path.join(__dirname, "public")));

//Defining Bot Name
const botName = "Chatcord bot";
// Runs when the client connect
io.on("connection", (socket) => {
  console.log("New web socket Connection...");

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current  user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord"));

    // Brodcast when user connect
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send User and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat message

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when the client disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      //Send user and room info
      // io.to().emit('')
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server Running on port: ${PORT}`));

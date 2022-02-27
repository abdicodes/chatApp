//importing all the libraries required for our backend express, socket.io object Server, http and cors.
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());

// to save retrieved user IDs and other relevant information.
let users = [];

//initialize our server
const server = http.createServer(app);

//initialize our socket-io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
/// progress reminder I need to check if user ID matches the one emitted from the client side and then emit these new user IDs
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("send_user", (data) => {
    console.log(`new user ${data.user} has joined`);
    console.log("operation successful");
    users = [...users, data];
    socket.broadcast.emit("usersList", users);
    socket.emit("usersList", users);
  });

  socket.on("join_room", (data) => {
    socket.join(data);

    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    users = users.filter((user) => user.userID !== socket.id);
    console.log(users);
    socket.broadcast.emit("usersList", users);
    socket.emit("usersList", users);
  });
  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
    console.log(content);
  });
});

server.listen(3001, () => console.log("server listening on port 3001"));

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
    console.log(`new user ${data.username} has joined`);
    console.log("operation successful");
    users = [...users, data];
    socket.broadcast.emit("usersList", users);
    socket.emit("usersList", users);
  });

  socket.on("update_user", (data) => {
    users.forEach((user) => {
      if (user.id === data.id) {
        user.peerid = data.peerid;
      }
    });
    console.log("updated function working!");
    console.log(users);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    users = users.filter((user) => user.id !== socket.id);
    console.log(users);
    socket.broadcast.emit("usersList", users);
    socket.emit("usersList", users);
  });
  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: users.find((user) => user.id == socket.id),
    });
  });

  //this has caused errors
  // socket.on("call request", ({ from, to }) => {
  //   const callee = users.find((user) => user.peerid === to);
  //   socket.to(callee.id).emit("answer call", from);
  //   console.log("answer call is successful");
  // });
});

server.listen(3001, () => console.log("server listening on port 3001"));

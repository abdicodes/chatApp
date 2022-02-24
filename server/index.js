//importing all the libraries required for our backend express, socket.io object Server, http and cors.
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());

// to save retrieved user IDs and other relevant information.
const users = [];

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
  users.push(socket.id);
  console.log(users);
  users.find;

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`this is what inside data${data}`);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => console.log("server listening on port 3001"));

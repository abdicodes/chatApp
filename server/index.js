//importing all the libraries required for our backend express, socket.io object Server, http and cors.
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());

//initialize our server
const server = http.createServer(app);

//initialize our socket-io server
io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

server.listen(3001, () => console.log("server listening on port 3001"));

import "./App.css";
import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import Chat from "./Chat";
import Dashboard from "./Dashboard";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (connected && socket.connected) {
      console.log(socket.connected);
      console.log(socket.connected);
      const userDetails = { user: username, userID: socket.id };
      console.log(userDetails);
      console.log(socket.id);
      socket.emit("send_user", userDetails);

      // socket.on("connect", () => {

      // });
    }
  }, [username, connected]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };
  // const joinApp = () => {
  //   socket.on("connect", () => {
  //     console.log(socket.connected);
  //     const userDetails = { user: username, userID: socket.id };
  //     console.log(userDetails);
  //     console.log(socket.id);
  //     socket.emit("send_user", userDetails);
  //     setConnected(true);
  //   });
  // };

  // return (
  //   <div className="App">
  //     {!showChat ? (
  //       <div className="joinChatContainer">
  //         <h3>Join A Chat</h3>
  //         <input
  //           type="text"
  //           placeholder="John..."
  //           onChange={(event) => {
  //             setUsername(event.target.value);
  //           }}
  //         />
  //         <input
  //           type="text"
  //           placeholder="Room ID..."
  //           onChange={(event) => {
  //             setRoom(event.target.value);
  //           }}
  //         />
  //         <button onClick={joinRoom}>Join A Room</button>
  //       </div>
  //     ) : (
  //       <Chat socket={socket} username={username} room={room} />
  //     )}
  //   </div>
  // );
  if (!connected) {
    return (
      <div className="App">
        <h1>Enter your name</h1>
        <input
          type="text"
          placeholder="John..."
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
        <button
          onClick={() => {
            setConnected(true);
          }}
        >
          Let's start{" "}
        </button>
      </div>
    );
  } else {
    return <Dashboard socket={socket} username={username} />;
  }
}

export default App;

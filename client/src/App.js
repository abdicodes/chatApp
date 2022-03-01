import "./App.css";
import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import Dashboard from "./Dashboard";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (connected && socket.connected) {
      socket.emit("send_user", {
        username: username,
        id: socket.id,
        peerid: null,
      });
      setUser({ username: username, id: socket.id, peerid: null });
    }
  }, [username, connected]);
  console.log(user);

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
    return <Dashboard socket={socket} userInfo={user} />;
  }
}

export default App;

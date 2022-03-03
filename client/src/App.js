import "./App.css";
import io from "socket.io-client";
import { useState, useEffect, useMemo, useContext } from "react";
import Dashboard from "./Dashboard";
import { UserContext } from "./UserContext";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");

  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);

  const provideValue = useMemo(() => ({ user, setUser }), [user, setUser]);

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
    return (
      <UserContext.Provider value={provideValue}>
        <Dashboard socket={socket} />
      </UserContext.Provider>
    );
  }
}

export default App;

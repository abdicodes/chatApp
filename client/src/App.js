//importing all the necessary modules
import io from "socket.io-client";
import { useState, useEffect, useMemo } from "react";
// import Dashboard from "./Dashboard";
import NewDash from "./NewDash";
import { UserContext } from "./UserContext";
import Styles from "./Styles";
import {
  Button,
  TextField,
  Typography,
  CssBaseline,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";

// socket.io frontend client that connects to the server. if you wish to deploy the app the URL string needs to be changed
const socket = io.connect("http://localhost:3001");

//the module that will exported to index.js and rendered.
function App() {
  // different state object some are shared across components such as user.
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);
  const provideValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  const classes = Styles();

  //this function emits the user information to the server
  useEffect(() => {
    if (connected && socket.connected) {
      socket.emit("send_user", {
        username: username,
        id: socket.id,
        peerid: null,
      });
      //user object will contain these properties they will also be saved in the constant array users in the backend server
      setUser({ username: username, id: socket.id, peerid: null });
    }
  }, [username, connected]);

  // this will show the user the form to get connected to the application and be assigned with a username
  if (!connected) {
    return (
      <>
        <CssBaseline />
        <AppBar>
          <Toolbar className={classes.navbar}>
            <img src="./favicon.ico" alt="" width="50" />
            <Typography variant="h6"> Bekos</Typography>
          </Toolbar>
        </AppBar>
        <main>
          <div className={classes.Container}>
            <Container maxWidth="sm">
              {" "}
              <TextField
                align="center"
                onChange={(event) => {
                  setUsername(event.target.value);
                }}
                onKeyPress={(event) => {
                  event.key === "Enter" && setConnected(true);
                }}
                id="outlined-basic"
                label="Enter your name"
                variant="outlined"
                size="small"
              />
              <Button
                align="center"
                onClick={() => {
                  // once connected state is true this form will not be shown
                  setConnected(true);
                }}
                variant="contained"
              >
                Let's start
              </Button>
            </Container>
          </div>
        </main>
      </>
    );
    // once connected the Dashboard component will be rendered here.
    // it's wrapped in the UserContext that will share the state objects.
  } else {
    return (
      <UserContext.Provider value={provideValue}>
        <NewDash socket={socket} />
      </UserContext.Provider>
    );
  }
}

export default App;

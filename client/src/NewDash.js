//important modules coupled with this module
import React, { useEffect, useState, useRef, useContext } from "react";

import ChatLive from "./ChatLive";
import Peer from "peerjs";
import { UserContext } from "./UserContext";
import { makeStyles } from "@mui/styles";
import SendIcon from "@mui/icons-material/Send";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import {
  Fab,
  Avatar,
  ListItemText,
  ListItem,
  List,
  Typography,
  TextField,
  Divider,
  Grid,
  Paper,
  Box,
  ListItemIcon,
  CardMedia,
} from "@mui/material";

function NewDash({ socket }) {
  // state objects
  const [usersList, setUsersList] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [message, setMessage] = useState([]);
  const [peerConeccted, setPeerConnected] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callAnswered, setCallAnswered] = useState(false);
  const [endCall, setEndCall] = useState(false);
  const [peerid, setPeerid] = useState(null);
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const { user, setUser } = useContext(UserContext);
  const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
    chatSection: {
      width: "100%",
      height: "80vh",
    },
    headBG: {
      backgroundColor: "#e0e0e0",
    },
    borderRight500: {
      borderRight: "1px solid #e0e0e0",
    },
    messageArea: {
      height: "60vh",
      overflowY: "auto",
    },
    video: {
      width: "220px",
      height: "180px",
    },
    gridContainer: {
      justifyContent: "center",
    },
    paper: {
      padding: "2px",
      border: "1px  black",
      margin: "2px",
      marginTop: "50px",
      marginBottom: "50px",
    },
  });

  const classes = useStyles();

  //this function will emit the user information to
  useEffect(() => {
    socket.on("usersList", (data) => {
      setUsersList(data);
    });
    socket.on("disconnect", (data) => setUsersList(data));

    socket.on("private message", ({ content, from }) => {
      if (!chatPartner) {
        setMessage(content);

        setChatPartner(from);
      }
    });
  }, [socket, chatPartner]);

  console.log(user);

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerid(id);

      setPeerConnected(true);
    });
    peer.on("call", (call) => {
      var getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (mediaStream) => {
        console.log(mediaStream);
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
        call.answer(mediaStream);
        call.on("stream", function (remoteStream) {
          setCallAnswered(true);
          remoteVideoRef.current.srcObject = remoteStream;
          //   remoteVideoRef.current.play();
          const playPromise = remoteVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Automatic playback started!
              })
              .catch((error) => {
                console.log("call is loading");
              });
          }
        });
      });
    });
    peerInstance.current = peer;
  }, [endCall]);

  useEffect(() => {
    if (peerConeccted) {
      setUser({ username: user.username, id: user.id, peerid: peerid });
      socket.emit("update_user", {
        username: user.username,
        id: user.id,
        peerid: peerid,
      });
      console.log(user);
    }
  }, [peerConeccted, socket, peerid]);
  const startChat = (user) => {
    setChatPartner(user);
  };
  const call = (callTo) => {
    setCallAnswered(true);
    setEndCall(false);
    setCallerName(callTo);
    socket.emit("received call", { from: user, to: callTo.id });
    const getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (mediaStream) => {
      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.play();

      const call = peerInstance.current.call(callTo.peerid, mediaStream);

      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;

        const playPromise = remoteVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Automatic playback started!
            })
            .catch((error) => {
              console.log("call is loading");
            });
        }
      });
    });
  };

  const endcall = () => {
    setEndCall(true);
    setCallAnswered(false);

    peerInstance.current.destroy();
    currentUserVideoRef.current.pause();
    remoteVideoRef.current.pause();

    socket.emit("end call", { callEnded: true, to: callerName });
  };

  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h5" className="header-message">
            Chat
          </Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={3} className={classes.borderRight500}>
          <List>
            {usersList.map((onlineUser, i) => {
              return (
                onlineUser.id !== user.id && (
                  <ListItem button key={i}>
                    <ListItemIcon>
                      <Avatar
                        alt={onlineUser.username}
                        src="https://material-ui.com/static/images/avatar/1.jpg"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={onlineUser.username}
                      onClick={() => startChat(onlineUser)}
                    ></ListItemText>
                    <VideoCallIcon onClick={() => call(onlineUser)} />
                  </ListItem>
                )
              );
            })}
          </List>
        </Grid>
        {chatPartner && (
          <ChatLive
            user={user}
            chatPartner={chatPartner}
            messages={message}
            socket={socket}
          />
        )}

        <Grid item xs={3}>
          <Grid container className={classes.gridContainer}>
            {!endCall && (
              <Paper className={classes.paper}>
                <Grid item xs={12} md={6}>
                  <video
                    playsInline
                    muted
                    ref={currentUserVideoRef}
                    autoPlay
                    className={classes.video}
                  />
                </Grid>
              </Paper>
            )}
            <Divider />
            {!endCall && (
              <Paper className={classes.paper}>
                <Grid item xs={12} md={6}>
                  <video
                    playsInline
                    ref={remoteVideoRef}
                    autoPlay
                    className={classes.video}
                  />
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default NewDash;

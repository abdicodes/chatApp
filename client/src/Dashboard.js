//important modules coupled with this module
import React, { useEffect, useState, useRef, useContext } from "react";

import Chatbox from "./Chatbox";
import Peer from "peerjs";
import { UserContext } from "./UserContext";
import Styles from "./Styles";

import VideoCallIcon from "@mui/icons-material/VideoCall";
import MessageIcon from "@mui/icons-material/Message";
import {
  Avatar,
  ListItemText,
  ListItem,
  List,
  Typography,
  Divider,
  Grid,
  Paper,
  ListItemIcon,
  Button,
} from "@mui/material";

function Dashboard({ socket }) {
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

  const classes = Styles();

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

  /*initiating a new peer connection for video calling functionality this uses
  a public server for getting peer id to avoid running two server instances locally  */
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

  // this will send user new information with peer id to server side.
  useEffect(() => {
    if (peerConeccted) {
      setUser({ username: user.username, id: user.id, peerid: peerid });
      socket.emit("update_user", {
        username: user.username,
        id: user.id,
        peerid: peerid,
      });
    }
  }, [peerConeccted, socket, peerid]);
  const startChat = (user) => {
    setChatPartner(user);
  };

  // function to intiate a video call
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
  // function to end a video call
  const endcalling = () => {
    setEndCall(true);
    setCallAnswered(false);

    peerInstance.current.destroy();
    currentUserVideoRef.current.pause();
    remoteVideoRef.current.pause();

    socket.emit("end call", { callEnded: true, to: callerName });
  };

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h5" className="header-message">
            Chat
          </Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={2.5} className={classes.borderRight500}>
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
                    <ListItemText onClick={() => startChat(onlineUser)}>
                      <Typography>{onlineUser.username}</Typography>
                    </ListItemText>
                    <MessageIcon
                      fontSize="small"
                      onClick={() => startChat(onlineUser)}
                    />

                    <VideoCallIcon onClick={() => call(onlineUser)} />
                  </ListItem>
                )
              );
            })}
          </List>
        </Grid>
        {chatPartner && (
          <Chatbox
            user={user}
            chatPartner={chatPartner}
            messages={message}
            socket={socket}
          />
        )}
        {!endCall && callAnswered && (
          <Grid item xs={3.5}>
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
                    {!endCall && callAnswered && (
                      <Button onClick={endcalling}>end Call</Button>
                    )}
                  </Grid>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

export default Dashboard;

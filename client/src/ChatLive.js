import React, { useEffect, useState, useRef } from "react";
import { makeStyles } from "@mui/styles";
import SendIcon from "@mui/icons-material/Send";
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
} from "@mui/material";

function ChatLive({ user, chatPartner, messages, socket }) {
  const [currentMessage, setCurrentMessage] = useState("");

  /*this is to pop up new messages that comes from other users the logic inside the state is to fix a bug
  where an empty string is shown in the chatbox and instead keep it empty  */
  const [messageList, setMessageList] = useState(
    messages.length === 0 ? [] : [messages]
  );

  useEffect(() => {
    socket.on("private message", ({ content }) => {
      setMessageList((list) => [...list, content]);
    });
  }, [socket]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        recipient: chatPartner,
        author: user.username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      //   await socket.emit("send_message", messageData);
      await socket.emit("private message", {
        content: messageData,
        to: chatPartner.id,
      });
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };
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
  });

  const classes = useStyles();

  return (
    <>
      <Grid item xs={6}>
        <List className={classes.messageArea}>
          {messageList.map((messageContent, i) => {
            return (
              <ListItem key={i}>
                <Grid container>
                  {" "}
                  <Grid item xs={12}>
                    <ListItemText
                      align={
                        user.username === messageContent.author
                          ? "right"
                          : "left"
                      }
                      primary={messageContent.message}
                    ></ListItemText>
                  </Grid>
                  <Grid item xs={12}>
                    <ListItemText
                      align={
                        user.username === messageContent.author
                          ? "right"
                          : "left"
                      }
                      secondary={messageContent.time}
                    ></ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
            );
          })}
        </List>
        <Divider />
        <Grid container style={{ padding: "20px" }}>
          <Grid item xs={11}>
            <TextField
              id="outlined-basic-email"
              label="Type Something"
              fullWidth
              value={currentMessage}
              onChange={(event) => {
                setCurrentMessage(event.target.value);
              }}
              onKeyPress={(event) => {
                event.key === "Enter" && sendMessage();
              }}
            />
          </Grid>
          <Grid item xs={1} align="right">
            <Fab color="primary" aria-label="add">
              <SendIcon onClick={sendMessage} />
            </Fab>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default ChatLive;

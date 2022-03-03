import React, { useEffect, useState, useRef, useContext } from "react";
import Chatbox from "./Chatbox";
import Peer from "peerjs";
import { UserContext } from "./UserContext";

function Dashboard({ socket }) {
  const [usersList, setUsersList] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [message, setMessage] = useState([]);
  const [peerConeccted, setPeerConnected] = useState(false);
  const [peerid, setPeerid] = useState(null);
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);

  const { user, setUser } = useContext(UserContext);

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
      console.log(user);
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
  }, []); // eslint-disable-line
  useEffect(() => {
    if (peerConeccted) {
      setUser({ username: user.username, id: user.id, peerid: peerid });
      console.log(user);
    }
  }, [peerConeccted]); // eslint-disable-line
  const startChat = (user) => {
    setChatPartner(user);
  };
  console.log(user);
  return (
    <div className="chat-window">
      {usersList.map((user, i) => {
        return (
          <div key={i}>
            <button onClick={() => startChat(user)}> {user.username}</button>
          </div>
        );
      })}

      {chatPartner && (
        <Chatbox
          user={user}
          chatPartner={chatPartner}
          messages={message}
          socket={socket}
        />
      )}
    </div>
  );
}

export default Dashboard;

import React, { useEffect, useState, useRef } from "react";
import Chatbox from "./Chatbox";
import Peer from "peerjs";

function Dashboard({ socket, userInfo }) {
  const [usersList, setUsersList] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [message, setMessage] = useState([]);
  const peerInstance = useRef(null);
  const [user, setUser] = useState(userInfo);

  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);

  useEffect(() => {
    socket.on("usersList", (data) => {
      setUsersList(data);
      if (peerInstance) {
        peerInstance.current.on("open", (id) => {
          console.log(id);

          if (user) {
            socket.emit("update_user", {
              username: user.username,
              id: user.id,
              peerid: id,
            });
            setUser({ username: user.username, id: user.id, peerid: id });
          }
        });
      }
    });
    socket.on("disconnect", (data) => setUsersList(data));

    socket.on("private message", ({ content, from }) => {
      if (!chatPartner) {
        setMessage(content);

        setChatPartner(from);
      }
    });

    console.log(user);
  }, [socket, user]);

  //peer instance
  useEffect(() => {
    const peer = new Peer();
    peer.on("call", (call) => {
      var getUserMedia =
        // this is due to variation in different browsers own commands so to avoid errors when running cross browsers.
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
        call.answer(mediaStream);
        call.on("stream", function (remoteStream) {
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
    });
    peerInstance.current = peer;
    console.log(peerInstance.current);
  }, []);
  const call = (remotePeerId) => {
    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (mediaStream) => {
      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.play();

      const call = peerInstance.call(remotePeerId, mediaStream);

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

  const startChat = (user) => {
    setChatPartner(user);
  };
  return (
    <div className="chat-window">
      {usersList.map((user, i) => {
        return (
          <div key={i}>
            <button onClick={() => startChat(user)}> {user.username}</button>
            {/* <button key={user.id} onClick={() => call(user.peerid)}>
              call{" "}
            </button> */}
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

      <div>
        <video ref={currentUserVideoRef} />
      </div>
      <div>
        <video ref={remoteVideoRef} />
      </div>
    </div>
  );
}

export default Dashboard;

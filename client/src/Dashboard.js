//important modules coupled with this module
import React, { useEffect, useState, useRef, useContext } from "react";
import Chatbox from "./Chatbox";
import Peer from "peerjs";
import { UserContext } from "./UserContext";

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
    <div className="chat-window">
      {usersList.map((onlineUser, i) => {
        return (
          onlineUser.id !== user.id && (
            <div key={i}>
              <button
                onClick={() =>
                  onlineUser.id !== user.id && startChat(onlineUser)
                }
              >
                {" "}
                {onlineUser.username}
              </button>
              <button
                onClick={() => onlineUser.id !== user.id && call(onlineUser)}
              >
                Call {onlineUser.username}
              </button>
            </div>
          )
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
      <div>{!endCall && <video ref={currentUserVideoRef} />}</div>
      <div>{!endCall && <video ref={remoteVideoRef} />}</div>
      <div>
        {" "}
        {!endCall && callAnswered && (
          <button onClick={endcall}>end call</button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

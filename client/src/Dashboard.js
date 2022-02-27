import React, { useEffect, useState, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import useObserveScrollPosition from "react-scroll-to-bottom/lib/hooks/useObserveScrollPosition";
import Chat from "./Chat";

function Dashboard({ socket, username }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);

  // this will track changes in online users
  useEffect(() => {
    socket.on("usersList", (data) => {
      setUsersList(data);
    });
    socket.on("disconnect", (data) => setUsersList(data));
  }, [socket]);

  console.log(usersList);

  const startChat = (input) => {
    setChatPartner(input);
    console.log(chatPartner);
  };
  return (
    <div className="chat-window">
      {usersList.map((user, i) => {
        return (
          <button key={i} onClick={() => startChat(user)}>
            {" "}
            {user.user}
          </button>
        );
      })}

      {chatPartner && (
        <Chat socket={socket} username={username} recipient={chatPartner} />
      )}
    </div>
  );
}

export default Dashboard;

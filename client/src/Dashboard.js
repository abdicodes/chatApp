import React, { useEffect, useState } from "react";
import Chatbox from "./Chatbox";
import ScrollToBottom from "react-scroll-to-bottom";

function Dashboard({ socket, user }) {
  const [usersList, setUsersList] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [message, setMessage] = useState([]);

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
  }, [socket]);
  console.log(message);
  console.log(chatPartner);

  // this will track changes in online users

  console.log(usersList);

  const startChat = (user) => {
    setChatPartner(user);
    console.log(chatPartner);
  };
  return (
    <div className="chat-window">
      {usersList.map((user, i) => {
        return (
          <button key={i} onClick={() => startChat(user)}>
            {" "}
            {user.username}
          </button>
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

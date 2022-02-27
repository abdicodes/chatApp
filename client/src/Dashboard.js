import React, { useEffect, useState } from "react";
import Chat from "./Chat";

function Dashboard({ socket, user }) {
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
        <Chat
          socket={socket}
          username={user.username}
          recipient={chatPartner}
        />
      )}
    </div>
  );
}

export default Dashboard;

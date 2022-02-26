import React, { useEffect, useState, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import useObserveScrollPosition from "react-scroll-to-bottom/lib/hooks/useObserveScrollPosition";

function Dashboard({ socket, username }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  //this will add the new message on the frontend side by updating the state on the messageList
  useEffect(() => {
    socket.on("usersList", (data) => {
      setUsersList(data);
    });
    socket.on("disconnect", (data) => setUsersList(data));
  }, [socket]);

  console.log(usersList);

  return (
    <div className="chat-window">
      {usersList.map(({ user }, i) => {
        return <h1 key={i}> {user}</h1>;
      })}
    </div>
  );
}

export default Dashboard;

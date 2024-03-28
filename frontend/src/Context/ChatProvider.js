import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [notification, setNotification] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode

  const [chats, setChats] = useState([]);

  const Navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) Navigate("/");
    //!userinfo means agar user looged in nhi hai toh usko login page pr bhej do
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        notification,
        setNotification,
        chats,
        setChats,
        isDarkMode,
        setIsDarkMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;

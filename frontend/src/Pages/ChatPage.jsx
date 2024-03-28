import React, { useState } from 'react'
import { Box } from "@chakra-ui/layout";
import { ChatState } from "../Context/ChatProvider"
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChat from "../components/MyChat";
import ChatBox from "../components/ChatBox";

// import axios from 'axios'
export default function ChatPage() {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState()

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}

      <Box w="100%" h="91.5vh" p="10px" style={{ justifyContent: "space-between", display: "flex" }}>

        {user && <MyChat fetchAgain={fetchAgain} />}

        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}

      </Box >
    </div >
  )
}


import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { AddIcon } from '@chakra-ui/icons'


const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats, isDarkMode, } = ChatState();


  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("http://localhost:5000/api/chat", config);
      // console.log(data)
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg={isDarkMode ? "#212121" : "white"}
      color={isDarkMode ? "white" : "black"}
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    // overflow="hidden"

    >
      <Box
        pb={3}
        px={3}
        fontSize={{ md: "35px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        fontWeight="bold"
        justifyContent="space-around"
        alignItems="center"

      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            ml={5}
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
          >
            Group Chat
            <AddIcon marginLeft={3} />

          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={4}
        // mb={10}
        // bg="#F8F8F8"
        bg={isDarkMode ? "#212121" : ""}
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="auto"
        maxH="calc(85.5vh - 72px)" // Subtract header height from max height
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box >
  );
};

export default MyChats;

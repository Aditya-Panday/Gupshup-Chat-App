import { Box } from '@chakra-ui/react'
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, isDarkMode, } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      // bg="white"
      bg={isDarkMode ? "#212121" : "white"}
      color={isDarkMode ? "white":"black"}
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >

      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;


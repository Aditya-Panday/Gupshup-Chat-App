import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { useMediaQuery } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react"; // Import IconButton



function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isLargerThanMedium] = useMediaQuery("(min-width: 48em)");


  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
    isDarkMode,
    setIsDarkMode,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const Navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    Navigate("/");
    toast({
      title: "Logout Successful",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "bottom",
    });
  };



  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);

      const filteredData = data.filter((user) => user.name.toLowerCase().startsWith(search.toLowerCase()));

      setLoading(false);
      setSearchResult(filteredData);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    // console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`http://localhost:5000/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]); //agar chat already hai toh..
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };





  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg={isDarkMode ? "black" : "white"} // Conditionally apply text color
        color={isDarkMode ? "white" : "black"} // Conditionally apply text color
        w="100%"
        p="5px 10px "
        borderWidth="5px"
        borderColor={isDarkMode ? "black" : "white"}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>

          <Tooltip label="Search Users to chat" hasArrow placement="bottom-end" >
            <Button variant="ghost" onClick={onOpen}
              _hover={{ backgroundColor: isDarkMode ? "" : "#F0F3FF" }}
              style={{ color: isDarkMode ? "white" : "black" }}>
              <i className="fas fa-search" ></i>
              <Text display={{ base: "none", md: "flex" }}    //medium size pr serach user text gayab ho jayga
                px={{ base: 0, md: 4 }}>
                Search User
              </Text>
            </Button>
          </Tooltip>

          <Text fontSize="2xl" fontWeight="bold" fontFamily="Work sans">
            {isLargerThanMedium ? "Gupshup-Chat-app" : "Gupshup"}
          </Text>

          <div>

            <Menu >
              <MenuButton p={1} _hover={{ backgroundColor: isDarkMode ? "" : "#F0F3FF" }}>
                <NotificationBadge
                  count={notification.length}
                  effect={Effect.SCALE}
                />
                <BellIcon fontSize="2xl" m={1} />
              </MenuButton>
              <MenuList pl={2}>
                {!notification.length && " No New Messages "}
                {notification.map(notif => (
                  <MenuItem key={notif._id} onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif))
                  }} >
                    {notif.chat.isGroupChat ?
                      `New Message in ${notif.chat.chatName}`
                      : `New Message From ${getSender(user, notif.chat.users)}`}

                  </MenuItem>
                ))}

              </MenuList>
            </Menu>
            {/* Toggle Dark Mode */}
            <Menu>
              <IconButton
                _hover={{ backgroundColor: isDarkMode ? "" : "#F0F3FF" }}
                style={{ color: isDarkMode ? "white" : "black" }}
                icon={isDarkMode ? <SunIcon /> : <MoonIcon />}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                onClick={() => setIsDarkMode(!isDarkMode)}
                variant="ghost"
                colorScheme="gray"
              />
            </Menu>

            <Menu >
              <MenuButton as={Button}
                style={{
                  color: isDarkMode ? "white" : "",
                  backgroundColor: isDarkMode ? "black" : "white",
                  border: isDarkMode ? "1px solid gray" : ""
                }}
                rightIcon={<ChevronDownIcon />}>
                <Avatar
                  size="sm"
                  cursor="pointer"
                  name={user.name}
                  src={user.pic}
                />
              </MenuButton>
              <MenuList style={{
                color: isDarkMode ? "white" : "",
                backgroundColor: isDarkMode ? "black" : "",
                border: isDarkMode ? "1px solid gray" : ""
              }} >
                <ProfileModal user={user}>

                  <MenuItem style={{
                    color: isDarkMode ? "white" : "black",
                    backgroundColor: isDarkMode ? "black" : "white",
                  }}
                  >
                    <span className="material-symbols-outlined" style={{ marginRight: "8px" }}>
                      person
                    </span>
                    My Profile
                  </MenuItem>
                </ProfileModal>
                <MenuDivider />
                <MenuItem onClick={logoutHandler} style={{
                  color: isDarkMode ? "white" : "black",
                  backgroundColor: isDarkMode ? "black" : "white",
                }}>
                  <span className="material-symbols-outlined" style={{ marginRight: "8px" }}>
                    logout
                  </span>
                  Logout</MenuItem>



              </MenuList>
            </Menu>
          </div>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent  >
          <DrawerHeader
            style={{
              color: isDarkMode ? "#aaaaaa" : "black",
              backgroundColor: isDarkMode ? "#212121" : "white",
            }}
            borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody style={{
            color: isDarkMode ? "#aaaaaa" : "black",
            backgroundColor: isDarkMode ? "#212121" : "white",
          }}>

            <Box display="flex" pb={2}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Input
                  placeholder="Search by name or email"
                  mr={3}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                  onClick={handleSearch}
                >Go</Button>
              </div>
            </Box>
            {loading ? (    //loading true hai toh chat loading hongi
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;

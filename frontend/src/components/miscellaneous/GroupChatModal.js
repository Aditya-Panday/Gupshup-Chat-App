import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
} from "@chakra-ui/react"; // Importing necessary Chakra UI components
import axios from "axios"; // Importing Axios for making HTTP requests
import { useState } from "react"; // Importing useState hook for managing component state
import { ChatState } from "../../Context/ChatProvider"; // Importing ChatState context for managing chat-related state
import UserBadgeItem from "../userAvatar/UserBadgeItem"; // Importing UserBadgeItem component
import UserListItem from "../userAvatar/UserListItem"; // Importing UserListItem component

const GroupChatModal = ({ children }) => { // Functional component definition with children prop
  const { isOpen, onOpen, onClose } = useDisclosure(); // Destructuring isOpen, onOpen, and onClose from useDisclosure hook for managing modal state
  const [groupChatName, setGroupChatName] = useState(); // State variable for group chat name
  const [selectedUsers, setSelectedUsers] = useState([]); // State variable for selected users
  const [search, setSearch] = useState(""); // State variable for search query
  const [searchResult, setSearchResult] = useState([]); // State variable for search results
  const [loading, setLoading] = useState(false); // State variable for loading status
  const toast = useToast(); // useToast hook for displaying toast messages

  const { user, chats, setChats } = ChatState(); // Destructuring user, chats, and setChats from ChatState context

  const handleGroup = (userToAdd) => { // Function to handle adding users to the group chat
    if (selectedUsers.includes(userToAdd)) { // Check if the user is already added
      toast({ // Display a toast message
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]); // Add the user to the selected users array
  };

  const handleSearch = async (query) => { // Function to handle user search
    setSearch(query); // Update search query state
    if (!query) { // If the query is empty, return
      return;
    }

    try {
      setLoading(true); // Set loading state to true
      const config = { // Configuration object for Axios request
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config); // Make GET request to search users
      
      setLoading(false); // Set loading state to false
      setSearchResult(data); // Update search result state

    } catch (error) { // If an error occurs during the request
      toast({ // Display an error toast message
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleDelete = (delUser) => { // Function to handle deleting a user from selected users
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id)); // Remove the user from selected users array
  };

  const handleSubmit = async () => { // Function to handle form submission
    if (!groupChatName || selectedUsers.length < 3) { // Check if chat name or selected users are empty
      toast({ // Display a warning toast message
        title: "Please fill all the fields and select at least 3 users ",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = { // Configuration object for Axios request
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post( // Make POST request to create a group chat
        `http://localhost:5000/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]); // Update chat state with the new group chat
      onClose(); // Close the modal
      toast({ // Display a success toast message
        title: "New Group Chat Created!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      // Reset form fields after successful creation

      setGroupChatName("");
      setSelectedUsers([]);
      setSearch(""); // Clear the search input
      setSearchResult([]); // Clear the search results
    } catch (error) { // If an error occurs during the request
      toast({ // Display an error toast message
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: John, Piyush, Jane"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              // <ChatLoading />
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;

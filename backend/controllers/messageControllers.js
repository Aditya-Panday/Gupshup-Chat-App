const asyncHandler = require("express-async-handler"); // Importing express-async-handler for handling asynchronous errors
const Message = require("../models/MessageModel"); // Importing the Message model
const User = require("../models/UserModel"); // Importing the User model
const Chat = require("../models/chatModel"); // Importing the Chat model

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => { // Defining a route handler to get all messages
  try {
    const messages = await Message.find({ chat: req.params.chatId }) // Finding all messages in a specific chat
      .populate("sender", "name pic email") // Populating the 'sender' field with user details
      .populate("chat"); // Populating the 'chat' field with chat details
    res.json(messages); // Sending the messages as JSON response
  } catch (error) {
    res.status(400); // Setting response status to 400 (Bad Request)
    throw new Error(error.message); // Throwing an error with the message
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => { // Defining a route handler to send a new message
  const { content, chatId } = req.body; // Destructuring content and chatId from request body

  if (!content || !chatId) { // Checking if content or chatId is missing
    console.log("Invalid data passed into request"); // Logging an error message
    return res.sendStatus(400); // Sending a 400 status code (Bad Request) as response
  }

  // Creating a new message object
  var newMessage = {
    sender: req.user._id, // Setting sender ID to current user's ID
    content: content, // Setting message content
    chat: chatId, // Setting chat ID
  };

  try {
    var message = await Message.create(newMessage); // Creating a new message document

    // Populating sender and chat fields with additional details
    message = await message.populate("sender", "name pic")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Updating the latestMessage field of the chat
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message); // Sending the created message as JSON response
  } catch (error) {
    res.status(400); // Setting response status to 400 (Bad Request)
    throw new Error(error.message); // Throwing an error with the message
  }
});

module.exports = { allMessages, sendMessage }; // Exporting the route handlers

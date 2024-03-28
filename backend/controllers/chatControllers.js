// Required dependencies
const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/UserModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
// Middleware to create or fetch one-to-one chat

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Check if userId is provided in request body
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({    //one on one chat isliye grouupchat ko false  kiya hai
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// @description     Fetch all chats for a user
// @route           GET /api/chat/
// @access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    // MongoDB query to find all chats where the user is included in the users array
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      // Populating the 'users' field of the found chats, excluding the password field
      .populate("users", "-password")
      // Populating the 'groupAdmin' field of the found chats, excluding the password field
      .populate("groupAdmin", "-password")
      // Populating the 'latestMessage' field of the found chats
      .populate("latestMessage")
      // Sorting the results by 'updatedAt' field in descending order
      .sort({ updatedAt: -1 })
      // Executing the query and handling the results
      .then(async (results) => {
        // Populating the 'latestMessage.sender' field of the results, including 'name', 'pic', and 'email'
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        // Sending the populated results as a response with status code 200
        res.status(200).send(results);
      });
  } catch (error) {
    // Handling any errors and sending a response with status code 400
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  // Check karta hai ki request mein 'users' aur 'name' fields hain ya nahi
  if (!req.body.users || !req.body.name) {
    // Agar nahi hain toh 400 status code ke saath error message bhejta hai

    return res.status(400).send({ message: "Please Fill all the feilds" });
  }
  // Request body se 'users' field ka JSON parse kiya jata hai

  var users = JSON.parse(req.body.users);
  // Agar users ke length 2 se kam hai, toh error message bhejta hai

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  // Current user ko 'users' array mein add kiya jata hai

  users.push(req.user);

  try {
    // Naya group chat banaya jata hai 'Chat' model ke upar 'create' method ka istemal karke

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    // Banaya gaya group chat ko populate karke 'fullGroupChat' mein store kiya jata hai

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    // Populate kiya gaya group chat ko 200 status code ke saath response ke roop mein bhejta hai

    res.status(200).json(fullGroupChat);
  } catch (error) {
    // Kisi bhi error ko handle kiya jata hai aur 400 status code ke saath error message bheja jata hai

    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  // Request body se chatId aur chatName extract kiya jata hai

  const { chatId, chatName } = req.body;
  // ChatId ke basis par Chat model ko update kiya jata hai

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,// Naye updated document ko return karne ke liye 'new' option true kiya gaya hai
    }
  )
    .populate("users", "-password") // Populate karke 'users' field ko exclude kar diya gaya hai
    .populate("groupAdmin", "-password"); // Populate karke 'groupAdmin' field ko exclude kar diya gaya hai

  // Agar koi chat update nahi milti hai toh 404 status code ke saath error message bhejta hai

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Agar chat update milti hai toh updated chat ko JSON format mein response ke roop mein bhejta hai

    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  // Request body se chatId aur userId extract kiya jata hai
  const { chatId, userId } = req.body;

  // ChatId ke basis par Chat model ko update kiya jata hai, jismein users array se specified userId ko hata diya jata hai
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true, // Naye updated document ko return karne ke liye 'new' option true kiya gaya hai
    }
  )
    .populate("users", "-password") // Populate karke 'users' field ko exclude kar diya gaya hai
    .populate("groupAdmin", "-password"); // Populate karke 'groupAdmin' field ko exclude kar diya gaya hai

  // Agar koi chat update nahi milti hai toh 404 status code ke saath error message bhejta hai
  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Agar chat update milti hai toh updated chat ko JSON format mein response ke roop mein bhejta hai
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // Check if the user is already a member of the chat
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  }

  if (chat.users.includes(userId)) {
    res.status(400); // Bad Request
    throw new Error("User is already a member of the chat");
  }
  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};

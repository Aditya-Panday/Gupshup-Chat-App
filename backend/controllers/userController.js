// is controller mai agar koi error aata hai toh woh automatic handle krega ye package (npm i express-async-handler)

const asyncHandler = require("express-async-handler");      //jo package install kiya haiasync-handler
const User = require("../models/UserModel");                //User model ko import kiya hai..
const generateToken = require("../config/generateToken");   //generate token import kiya hai
// const bcrypt = require('bcrypt'); // Import bcrypt for password comparison


//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
// it will used to search users

// http://localhost:5000/api/user?search=a
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: "^" + req.query.search, $options: "i" } }, // StartsWith search using "^"
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });    //$ne means not equal to..
    res.send(users);
    // console.log(keyword);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public

// it will use to register user..
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;

    // agar name email password undefined hai toh error dega
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Fields");
    }

    // is line mai check kr rhe hai ki user exist's krta hai ya nhi..
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        pic,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),     //user create krne pr ek token de denge
        });
    } else {
        res.status(400);
        throw new Error("User not found");
    }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public

// it will used for login..

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});


//@description     Delete user account
//@route           DELETE /api/user
//@access          Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    await user.deleteOne(); // Use deleteOne() to remove the user document

    res.json({ message: "User account deleted successfully" });
});

//@description     Update user profile picture
//@route           PUT /api/user/pic
//@access          Private

module.exports = {
    allUsers,
    registerUser,
    authUser,
    deleteUser,
};

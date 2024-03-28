

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    // kya data containe krega user
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",   //Agar user picture upload nhi krega toh default picture ye hogi
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestaps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {   //password match krega
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {    //pre means save hone se pehle
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);    //bcrypt.genSalt use krenge password ko secure krne ke liye..
  this.password = await bcrypt.hash(this.password, salt);
});



const User = mongoose.model("User", userSchema);

module.exports = User;

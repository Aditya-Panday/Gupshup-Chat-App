// (npm i json webtoken)
// jwt token kya krta hai help krta hai user ko backend mai autorize krne mai like user ne token bheja agar wo verify hua toh uska resource yani uska data usse mil jayga 



const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",   // expires in 30 days
  });
};

module.exports = generateToken;

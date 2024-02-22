const UserModel = require("../model/UserModel");
const { findUserByEmail } = require("../queries/auth.queries");

async function checkUser(req, res, next) {
  const email = req.body.email;
  const user = await findUserByEmail(req, email)

  if (user) {
    console.log("User already exixts");
    next();
  } else {
    res.status(400).json({
      msg: "authFailed",
      status: "success",
    });
  }
}

module.exports = { checkUser };

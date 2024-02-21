const UserModel = require("../model/UserModel");

async function checkUser(req, res, next) {
  const email = req.body.email;
  const user = await UserModel.find({
    email: email,
  });

  if (user.length > 0) {
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

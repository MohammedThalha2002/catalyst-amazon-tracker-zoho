const UserModel = require("../model/UserModel");
const { findUserByEmail } = require("../queries/auth.queries");
var catalyst = require("zcatalyst-sdk-node");

const createUser = async (req, res) => {
  var app = catalyst.initialize(req);
  let zcql = app.zcql();
  //
  const email = req.body.email;
  let user = await findUserByEmail(req, email);

  if (user) {
    const ROWID = user.ROWID; // Assuming your Users has a primary key named 'id'
    const token = req.body.token;
    const userId = req.body.userId;

    console.log(ROWID, token, userId);

    const updateQuery = `
      UPDATE Users
      SET token = '${token}', userId = '${userId}'
      WHERE ROWID = ${ROWID};`;

    try {
      await zcql.executeZCQLQuery(updateQuery);
      res.status(200).json({ msg: "Token updated successfully", status: "success" });
    } catch (error) {
      res.status(400).json({ msg: "Failed to update user", error: error, status: "failed" });
    }
  } else {
    // create new user
    const newUser = req.body;
    const insertQuery = `
      INSERT INTO Users (email, token, userId)
      VALUES ('${newUser.email}', '${newUser.token}', '${newUser.userId}')`;

    try {
      await zcql.executeZCQLQuery(insertQuery);
      res.status(200).json({ msg: "User registered successfully", status: "success" });
    } catch (error) {
      res.status(400).json({ msg: "Failed to register user", error: error, status: "failed" });
    }
  }
};

const checkAuth = async (req, res) => {
  const email = req.params.email;
  let user = await findUserByEmail(req, email);

  if (user) {
    // user exists
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(200).json({
      status: "failed",
    });
  }
};

// 1. find user by email
// 2. update the user's token and userId by id
// 3. post a new user

module.exports = { createUser, checkAuth };

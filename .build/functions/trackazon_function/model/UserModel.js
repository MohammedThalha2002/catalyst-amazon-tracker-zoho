const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("Users", UserSchema);

module.exports = User;

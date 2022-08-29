const mongoose = require("mongoose");

const UserInfoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
    unique: false,
  },
  userName: {
    type: String,
    required: true,
    unique: false,
  },
  birthDate: {
    type: Date,
    required: false,
    unique: false,
  },
  qIndex: {
    type: Number,
    required: true,
    unique: false,
    default: 0,
  },
});

const UserInfo = mongoose.model("userInfo", UserInfoSchema);

module.exports = UserInfo;

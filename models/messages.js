const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  message: {
    type: Object,
    required: true,
    unique: false,
  },
});

const Message = mongoose.model("messages", MessageSchema);

module.exports = Message;

const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

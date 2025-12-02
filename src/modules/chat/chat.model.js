const mongoose = require("mongoose");
const { chatMembers } = require("./chat.constants");
const { Schema } = mongoose;

const participantSchema = new Schema({
  userId: {
    type: String, // PostgreSQL UUID
    required: true,
  },
  role: {
    type: String,
    enum: chatMembers,
    default: chatMembers[0] || "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String, // only for group
    default: null,
  },
  name: {
    type: String, // only for group
    default: null,
  },
  createdBy: {
    type: String, // PostgreSQL UUID
    required: true,
  },
  participants: [participantSchema],

  lastMessageAt: {
    type: Date,
    default: null,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for fast fetching user chats
chatSchema.index({ "participants.userId": 1 });

module.exports = mongoose.model("Chat", chatSchema);

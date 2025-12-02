const { messageReadTypes } = require("../message.constants");

const mongoose = require("mongoose");

const messageReadSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
  userId: {
    type: String, // PostgreSQL UUID
    required: true,
  },
  status: {
    type: String,
    enum: messageReadTypes,
    default: messageReadTypes[0] || "sent",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

messageReadSchema.index({ messageId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("MessageRead", messageReadSchema);

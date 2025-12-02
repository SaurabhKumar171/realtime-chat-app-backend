const mongoose = require("mongoose");
const { mediaTypes, messageTypes } = require("../message.constants");

const mediaSchema = new mongoose.Schema({
  url: String,
  mediaType: {
    type: String,
    enum: mediaTypes,
  },
  size: Number,
  metadata: mongoose.Schema.Types.Mixed,
});

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },

  senderId: {
    type: String, // PostgreSQL UUID
    required: true,
  },

  type: {
    type: String,
    enum: messageTypes,
    default: messageTypes[0] || "text",
  },

  text: { type: String },

  media: mediaSchema,

  status: {
    sent: { type: Boolean, default: true },
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
  },

  createdAt: { type: Date, default: Date.now },
});

// Important indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ "status.read": 1 });

module.exports = mongoose.model("Message", messageSchema);

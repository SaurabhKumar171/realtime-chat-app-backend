const pool = require("../../config/postgres");
const Chat = require("./chat.model");
// const queryWithPool = async () => {
//   let client;
//   try {
//     client = await pool.connect();
//     console.log("🔄 Client acquired from pool");

//     const result = await client.query("SELECT * FROM chats LIMIT 5");
//     console.log("✅ Users:", result.rows);
//   } catch (error) {
//     console.error("❌ Database query error:", error);
//   } finally {
//     if (client) {
//       client.release();
//       console.log("↩️ Client released back to pool");
//     }
//   }
// };

// module.exports = { queryWithPool };

// controllers/chatController.js

exports.createChat = async (req, res) => {
  try {
    const { type, participants, name, icon } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!type || !participants) {
      return res.status(400).json({ message: "type & participants required" });
    }

    // Add the creator to the list (ensure no duplicates)
    const uniqueParticipants = Array.from(new Set([...participants, userId]));

    // Check: DM should only have exactly 2 participants
    if (type === "DM") {
      if (uniqueParticipants.length !== 2)
        return res
          .status(400)
          .json({ message: "DM must have exactly 2 users" });

      // Check if DM exists already
      const existingDM = await Chat.findOne({
        type: "DM",
        participants: { $all: uniqueParticipants, $size: 2 },
      });

      if (existingDM) return res.status(200).json(existingDM);
    }

    // Create New Chat
    const chat = await Chat.create({
      type,
      participants: uniqueParticipants,
      name: type === "GROUP" ? name : null,
      icon: type === "GROUP" ? icon : null,
    });

    return res.status(201).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      members: userId,
    })
      .sort({ updatedAt: -1 })
      .populate("lastMessage");

    return res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId).populate("lastMessage");

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    return res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const updates = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (chat.type === "DM") {
      return res.status(400).json({ message: "Cannot update DM chat" });
    }

    if (updates.name) chat.name = updates.name;
    if (updates.icon) chat.icon = updates.icon;

    await chat.save();

    return res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    await chat.deleteOne();

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

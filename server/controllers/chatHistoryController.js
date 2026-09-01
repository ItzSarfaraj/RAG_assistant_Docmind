import Chat from "../models/Chat.js";
import Document from "../models/Document.js";

// ==========================================
// GET CHAT HISTORY
// ==========================================

const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required",
      });
    }

    // Make sure document belongs to logged-in user
    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const chat = await Chat.findOne({
      user: req.user.id,
      document: documentId,
    });

    if (!chat) {
      return res.status(200).json({
        messages: [],
      });
    }

    return res.status(200).json({
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Get chat history error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};

// ==========================================
// SAVE CHAT MESSAGE
// ==========================================

const saveChatMessage = async (req, res) => {
  try {
    const { documentId, role, content, sources = [] } = req.body;

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required",
      });
    }

    if (!role || !["user", "assistant"].includes(role)) {
      return res.status(400).json({
        message: "Invalid message role",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    // Make sure document belongs to user
    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    let chat = await Chat.findOne({
      user: req.user.id,
      document: documentId,
    });

    // Create chat if it doesn't exist
    if (!chat) {
      chat = await Chat.create({
        user: req.user.id,
        document: documentId,
        messages: [],
      });
    }

    chat.messages.push({
      role,
      content,
      sources,
    });

    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    return res.status(201).json({
      message: savedMessage,
    });
  } catch (error) {
    console.error("Save chat message error:", error.message);

    return res.status(500).json({
      message: "Failed to save chat message",
      error: error.message,
    });
  }
};

export { getChatHistory, saveChatMessage };

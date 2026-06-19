import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const groqHeaders = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  };
};

const callGroq = async (messages, temperature = 0.7) => {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: groqHeaders(),
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = payload?.error?.message || `Groq request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return content;
};

/**
 * Build conversation history for Groq context window
 */
const buildHistory = (messages) =>
  messages.map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.content,
  }));

/**
 * Generate a short title from the first user message
 */
const generateTitle = async (firstMessage) => {
  try {
    const title = await callGroq(
      [
        {
          role: "system",
          content: "You write short chat titles.",
        },
        {
          role: "user",
          content: `Generate a short 3-5 word title for a chat that starts with: "${firstMessage}". Return only the title, no quotes.`,
        },
      ],
      0.2
    );

    return title.slice(0, 50) || "New Chat";
  } catch {
    return firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "..." : "");
  }
};

/**
 * POST /api/chat
 * Send a message and receive an AI response
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    let conversation;

    // Create new conversation or load existing one
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
    } else {
      conversation = await Conversation.create({ title: "New Chat" });
    }

    // Save user message to database
    const userMessage = await Message.create({
      conversationId: conversation._id,
      sender: "user",
      content: message.trim(),
    });

    // Load previous messages for context
    const previousMessages = await Message.find({
      conversationId: conversation._id,
      _id: { $ne: userMessage._id },
    }).sort({ timestamp: 1 });

    // Call Groq API with chat history
    const aiContent = await callGroq([
      {
        role: "system",
        content: "You are a helpful, concise assistant inside a chat application.",
      },
      ...buildHistory(previousMessages),
      {
        role: "user",
        content: message.trim(),
      },
    ]);

    // Save AI response to database
    const aiMessage = await Message.create({
      conversationId: conversation._id,
      sender: "ai",
      content: aiContent,
    });

    // Auto-generate title from first message
    const messageCount = await Message.countDocuments({
      conversationId: conversation._id,
    });
    if (messageCount === 2 && conversation.title === "New Chat") {
      const title = await generateTitle(message.trim());
      conversation.title = title;
      await conversation.save();
    }

    res.json({
      conversationId: conversation._id,
      title: conversation.title,
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
};

/**
 * GET /api/chats
 * List all conversations (most recent first)
 */
export const getAllChats = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt");

    res.json(conversations);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

/**
 * GET /api/chat/:id
 * Get a single conversation with all its messages
 */
export const getChatById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 });

    res.json({ conversation, messages });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

/**
 * DELETE /api/chat/:id
 * Delete a conversation and all its messages
 */
export const deleteChat = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await Message.deleteMany({ conversationId: conversation._id });
    await Conversation.findByIdAndDelete(conversation._id);

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};

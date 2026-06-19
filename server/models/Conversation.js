import mongoose from "mongoose";

/**
 * Conversation schema — one document per chat session
 */
const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Conversation", conversationSchema);

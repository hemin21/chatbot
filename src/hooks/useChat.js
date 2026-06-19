import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../services/api";

/**
 * Main chat state management hook
 */
export function useChat(addToast) {
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const connectionErrorShown = useRef(false);

  // Load conversation list on mount
  const loadConversations = useCallback(async (search = "") => {
    try {
      const chats = await api.getChats(search);
      setConversations(chats);
      connectionErrorShown.current = false;
    } catch (error) {
      if (!connectionErrorShown.current) {
        addToast(error.message, "error");
        connectionErrorShown.current = true;
      }
    }
  }, [addToast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when active chat changes
  const selectChat = useCallback(
    async (id) => {
      setActiveChatId(id);
      setSidebarOpen(false);
      try {
        const { messages: msgs } = await api.getChat(id);
        setMessages(msgs);
      } catch (error) {
        addToast(error.message, "error");
      }
    },
    [addToast]
  );

  // Start a new empty chat
  const newChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
    setSidebarOpen(false);
  }, []);

  // Send a message to the AI
  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || isTyping) return;

      const tempUserMsg = {
        _id: `temp-${Date.now()}`,
        sender: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
      setIsTyping(true);

      try {
        const data = await api.sendMessage(content, activeChatId);
        setActiveChatId(data.conversationId);
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== tempUserMsg._id),
          data.userMessage,
          data.aiMessage,
        ]);
        await loadConversations(searchQuery);
      } catch (error) {
        setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
        addToast(error.message, "error");
      } finally {
        setIsTyping(false);
      }
    },
    [activeChatId, isTyping, loadConversations, searchQuery, addToast]
  );

  // Delete a conversation
  const removeChat = useCallback(
    async (id) => {
      try {
        await api.deleteChat(id);
        if (activeChatId === id) {
          newChat();
        }
        await loadConversations(searchQuery);
        addToast("Chat deleted", "success");
      } catch (error) {
        addToast(error.message, "error");
      }
    },
    [activeChatId, newChat, loadConversations, searchQuery, addToast]
  );

  // Search conversations
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      loadConversations(query);
    },
    [loadConversations]
  );

  // Export current chat as TXT file
  const exportChat = useCallback(() => {
    if (messages.length === 0) {
      addToast("No messages to export", "warning");
      return;
    }

    const chat = conversations.find((c) => c._id === activeChatId);
    const title = chat?.title || "chat-export";
    const content = messages
      .map(
        (m) =>
          `[${new Date(m.timestamp).toLocaleString()}] ${
            m.sender === "user" ? "You" : "AI"
          }: ${m.content}`
      )
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Chat exported successfully", "success");
  }, [messages, conversations, activeChatId, addToast]);

  return {
    conversations,
    activeChatId,
    messages,
    isLoading,
    isTyping,
    searchQuery,
    sidebarOpen,
    setSidebarOpen,
    selectChat,
    newChat,
    sendMessage,
    removeChat,
    handleSearch,
    exportChat,
  };
}

import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ToastContainer from "../components/ToastContainer";
import { useChat } from "../hooks/useChat";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";

/**
 * Main chat page — composes sidebar, chat window, and toast notifications
 */
export default function ChatPage() {
  const { toasts, addToast, removeToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const {
    conversations,
    activeChatId,
    messages,
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
  } = useChat(addToast);

  const activeChatTitle = conversations.find((c) => c._id === activeChatId)?.title;

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeChatId={activeChatId}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onSelectChat={selectChat}
        onNewChat={newChat}
        onDeleteChat={removeChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow
        messages={messages}
        isTyping={isTyping}
        onSend={sendMessage}
        onExport={exportChat}
        onToggleSidebar={() => setSidebarOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onCopy={addToast}
        activeChatTitle={activeChatTitle}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

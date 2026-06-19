const API_BASE = import.meta.env.VITE_API_URL || "/api";

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch {
    throw new Error(
      "Cannot reach the backend server. Make sure it is running on port 5000 (cd server && npm run dev)."
    );
  }

  const text = await response.text();

  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned an invalid response. Check backend logs.");
    }
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.details ||
        `Request failed (${response.status}). Check server/.env configuration.`
    );
  }

  if (!text) {
    throw new Error("Server returned an empty response. Is the backend running?");
  }

  return data;
}

/** Send a message and receive AI response */
export const sendMessage = (message, conversationId = null) =>
  request("/chat", {
    method: "POST",
    body: JSON.stringify({ message, conversationId }),
  });

/** Get all conversations, optionally filtered by search */
export const getChats = (search = "") =>
  request(`/chats${search ? `?search=${encodeURIComponent(search)}` : ""}`);

/** Get a single conversation with all messages */
export const getChat = (id) => request(`/chat/${id}`);

/** Delete a conversation */
export const deleteChat = (id) =>
  request(`/chat/${id}`, { method: "DELETE" });

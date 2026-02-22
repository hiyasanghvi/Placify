import api from "./axios";

// 🔹 Send a message
export const sendMessage = (to, text) => {
  return api.post("/messages", { to, text });
};

// 🔹 Get inbox (all chats)
export const getInbox = () => {
  return api.get("/messages/inbox");
};

// 🔹 Get conversation with a user
export const getConversation = (userId) => {
  return api.get(`/messages/${userId}`);
};
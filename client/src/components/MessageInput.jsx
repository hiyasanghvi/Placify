import { useState } from "react";
import { sendMessage } from "../api/messagesApi";

const MessageInput = ({ to }) => {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage(to, text); // 🔥 do NOT manually setChat
    setText("");
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
        style={{ flex: 1 }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;
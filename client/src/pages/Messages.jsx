import { useEffect, useState, useRef } from "react";
import { getInbox, getConversation } from "../api/messagesApi";
import MessageInput from "../components/MessageInput";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Messages = () => {
  const location = useLocation();
  const preSelectedUser = location.state?.user;

  const [inbox, setInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState(preSelectedUser || null);
  const [chat, setChat] = useState([]);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unread, setUnread] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);

  // ✅ SAFE USER ID FETCH
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const loggedInUserId = storedUser?._id;

  /* ============================== */
  /* LOAD INBOX */
  /* ============================== */
  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    const res = await getInbox();
    const messages = res.data;

    const usersMap = {};

    messages.forEach(msg => {
      const senderId =
        typeof msg.from === "object"
          ? msg.from._id
          : msg.from;

      const otherUser =
        String(senderId) === String(loggedInUserId)
          ? msg.to
          : msg.from;

      const otherUserId =
        typeof otherUser === "object"
          ? otherUser._id
          : otherUser;

      if (
        !usersMap[otherUserId] ||
        new Date(msg.createdAt) >
          new Date(usersMap[otherUserId].lastMsgDate)
      ) {
        usersMap[otherUserId] = {
          ...otherUser,
          lastMsg: msg.text,
          lastMsgDate: msg.createdAt
        };
      }
    });

    setInbox(
      Object.values(usersMap).sort(
        (a, b) =>
          new Date(b.lastMsgDate) - new Date(a.lastMsgDate)
      )
    );
  };

  /* ============================== */
  /* LOAD CONVERSATION */
  /* ============================== */
  useEffect(() => {
    if (!selectedUser) return;

    getConversation(selectedUser._id).then(res => {
      setChat(res.data);

      setUnread(prev => ({
        ...prev,
        [selectedUser._id]: 0
      }));

      socket.emit("joinConversation", {
        userId: loggedInUserId,
        otherUserId: selectedUser._id
      });
    });
  }, [selectedUser]);

  /* ============================== */
  /* SOCKET EVENTS */
  /* ============================== */
  useEffect(() => {
    if (!loggedInUserId) return;

    socket.emit("joinRoom", loggedInUserId);

    socket.on("newMessage", message => {
      const senderId =
        typeof message.from === "object"
          ? message.from._id
          : message.from;

      if (
        selectedUser &&
        String(selectedUser._id) === String(senderId)
      ) {
        setChat(prev => [...prev, message]);
      } else {
        setUnread(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }

      loadInbox();
    });

    return () => {
      socket.off("newMessage");
    };
  }, [selectedUser, loggedInUserId]);

  /* ============================== */
  /* AUTO SCROLL */
  /* ============================== */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const filteredInbox = inbox.filter(user =>
    user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="messages-container">
      <div className="inbox">
        <h3>💬 Inbox</h3>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />

        {filteredInbox.map(user => (
          <div
            key={user._id}
            className={`inbox-item ${
              selectedUser?._id === user._id ? "active" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="avatar">
              {user.name?.[0] || "U"}
            </div>

            <div className="inbox-text">
              <strong>{user.name || user.email}</strong>
              <span>{user.lastMsg?.slice(0, 30)}...</span>
            </div>

            {unread[user._id] > 0 && (
              <span className="badge">{unread[user._id]}</span>
            )}
          </div>
        ))}
      </div>

      <div className="chat">
        {selectedUser ? (
          <>
            <div className="chat-header">
              {selectedUser.name || selectedUser.email}
            </div>

            <div className="chat-body">
              {chat.map(msg => {
  const senderId =
    msg.from?._id || msg.from;
  console.log("Sender:", senderId);
console.log("Logged:", loggedInUserId);
  const isMine =
    String(senderId) === String(loggedInUserId);

  return (
    <div
      key={msg._id}
      className={`message-row ${
        isMine ? "right" : "left"
      }`}
    >
      <div
        className={`bubble ${
          isMine ? "sent" : "received"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
})}

              <div ref={chatEndRef}></div>
            </div>

            <div className="chat-input">
              <MessageInput
                to={selectedUser._id}
                socket={socket}
                onSend={newMsg =>
                  setChat(prev => [...prev, newMsg])
                }
              />
            </div>
          </>
        ) : (
          <div className="empty-chat">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
import { useEffect, useState, useRef } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import LogoutButton from "../components/LogoutButton";
import "../styles/ChatRoom.css";
import { FaRocketchat } from "react-icons/fa";

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [username, setUsername] = useState("");
  const wsRef = useRef(null); //ref value persistent between renders
  const bottomRef = useRef();

  //fetch chat history via api
  useEffect(() => {
    getCurrentTenant();
    if (!apartmentId) return;
    getMessages();
  }, [apartmentId]);

  //connect WebSocket
  useEffect(() => {
    if (!apartmentId) return;
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${apartmentId}/`);
    wsRef.current = socket;

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => socket.close();
  }, [apartmentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      wsRef.current.send(JSON.stringify({ message: input, sender: username }));
      setInput("");
    }
  };

  const getMessages = () => {
    api
      .get(`/chat/${apartmentId}/`)
      .then((res) => res.data)
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => alert(err));
  };

  const getCurrentTenant = () => {
    api
      .get("/api/tenant/")
      .then((res) => res.data)
      .then((data) => {
        setApartmentId(data.apartment.id);
        setUsername(data.user.username);
      })
      .catch((err) => alert(err));
  };

  return (
    <div>
      <Navbar />
      <section className="chat-header">
        <FaRocketchat size={24} />
        <header>Welcome home!</header>
        <LogoutButton />
      </section>
      <p>Roundtable at the world leaders' summit (very important) !</p>
      <div className="chat-wrapper">
        <div className="chat-box">
          {messages.map((msg, idx) => {
            const isSelf =
              msg.sender === username || msg.sender_username === username;
            return (
              <div
                key={idx}
                className={`chat-bubble ${isSelf ? "chat-self" : "chat-other"}`}
              >
                {!isSelf && (
                  <div className="chat-sender">
                    {msg.sender || msg.sender_username}
                  </div>
                )}
                <div className="chat-content">{msg.message || msg.content}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;

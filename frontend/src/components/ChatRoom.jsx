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
  const [flatmates, setFlatmates] = useState([]);
  const wsRef = useRef(null); //ref value persistent between renders
  const bottomRef = useRef();

  //fetch chat history via api
  useEffect(() => {
    getCurrentTenant();
    getFlatmates();
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
    if (
      input.trim() &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          content: input,
          sender: username,
          timestamp: Date.now(),
        })
      );
      setInput("");
    } else if (wsRef.current?.readyState !== WebSocket.OPEN) {
      alert("WebSocket connection not ready. Please try again in a moment.");
    }
  };

  const getFlatmates = () => {
    api
      .get("api/tenants/")
      .then((res) => res.data)
      .then((data) => {
        setFlatmates(data);
      })
      .catch((err) => alert(err));
  };

  const getMessages = () => {
    api
      .get(`/chat/${apartmentId}/`)
      .then((res) => res.data)
      .then((data) => {
        console.log(data);
        setMessages(data);
      })
      .catch((err) => alert(err));
  };

  const getCurrentTenant = () => {
    api
      .get("/api/tenant/")
      .then((res) => res.data)
      .then((data) => {
        setApartmentId(data.apartment);
        setUsername(data.id);
      })
      .catch((err) => alert(err));
  };

  const matchTenantIdToUsername = (id) => {
    for (let tenant of flatmates) {
      if (tenant.id === id) {
        return tenant.user.username;
      }
    }
  };

  const formattedDate = (d) => {
    var date = new Date(d);
    return (
      date.getUTCFullYear() +
      "/" +
      ("0" + (date.getUTCMonth() + 1)).slice(-2) +
      "/" +
      ("0" + date.getUTCDate()).slice(-2) +
      " " +
      ("0" + date.getUTCHours()).slice(-2) +
      ":" +
      ("0" + date.getUTCMinutes()).slice(-2) +
      ":" +
      ("0" + date.getUTCSeconds()).slice(-2)
    );
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
        <div className="window-title-bar">
          <span>ChatApp.exe</span>
          <div className="window-buttons">
            <div className="win-btn">–</div>
            <div className="win-btn">×</div>
          </div>
        </div>
        <div className="chat-box">
          {messages.map((msg, idx) => {
            const isSelf = msg.sender === username;
            return (
              <div
                key={idx}
                className={`chat-bubble ${isSelf ? "chat-self" : "chat-other"}`}
              >
                {!isSelf && (
                  <div className="chat-sender">
                    {matchTenantIdToUsername(msg.sender)}
                  </div>
                )}
                <div className="chat-content">{msg.content}</div>
                <div className="chat-timestamp">
                  {formattedDate(msg.timestamp)}
                </div>
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

// src/pages/ChatPage.jsx
import ChatRoom from "../components/ChatRoom";

function ChatPage() {
  const apartmentId = 1; // get from context or backend
  const username = localStorage.getItem("username"); // or fetch via API

  return <ChatRoom apartmentId={apartmentId} username={username} />;
}
export default ChatPage;

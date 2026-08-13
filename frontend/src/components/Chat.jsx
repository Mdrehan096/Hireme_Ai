import { useState } from "react";

import Message from "./Message";
import ChatInput from "./ChatInput";

import { streamChat } from "../services/chat.api";

function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Rehan's AI assistant. Ask me about his skills, projects, education, or experience.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleSend = async (question) => {
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
      {
        role: "assistant",
        content: "",
      },
    ]);

    try {
      await streamChat(question, (chunk) => {
        console.log("RECEIVED CHUNK:", chunk);

        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;

          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + chunk,
          };

          return updated;
        });
      });
    } catch (error) {
  console.error("🔥 CHAT ERROR:", error);
  alert(error.message);

  setMessages((prev) => {
    const updated = [...prev];
    const lastIndex = updated.length - 1;

    updated[lastIndex] = {
      ...updated[lastIndex],
      content: `Error: ${error.message}`,
    };

    return updated;
  });
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h1>HireMe AI</h1>
          <p>AI assistant representing Rehan</p>
        </div>

        <span className="status">● Online</span>
      </div>

      <div className="messages">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>

      <ChatInput onSend={handleSend} loading={loading} />
    </div>
  );
}

export default Chat;
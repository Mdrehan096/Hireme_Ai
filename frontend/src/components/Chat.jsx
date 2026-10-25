
import { useState } from "react";
import { streamChat } from "../services/chat.api";
import ChatInput from "./ChatInput";
import Message from "./Message";

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
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ]);

    try {
      await streamChat(question, (chunk) => {
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
      console.error("Chat error:", error);

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
      <header className="chat-header">
        <div>
          <h1>HireMe AI</h1>
          <p>Ask me about Rehan's resume</p>
        </div>
        <span className="status">● Online</span>
      </header>

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

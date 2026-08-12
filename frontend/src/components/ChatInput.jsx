import { useState } from "react";

function ChatInput({ onSend, loading }) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || loading) {
      return;
    }

    const currentQuestion = question;

    setQuestion("");

    await onSend(currentQuestion);
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ask about my skills, projects, experience..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={loading}
      />

      <button type="submit" disabled={loading || !question.trim()}>
        {loading ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}

export default ChatInput;
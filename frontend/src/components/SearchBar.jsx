import { useState } from "react";
import { askAI } from "../services/api";

function ChatUI() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = {
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await askAI(query);

      const aiMessage = {
        role: "ai",
        content: res.data.answer,
        sources: res.data.source,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>🤖 AI File Assistant</h2>

      {/* CHAT BOX */}
      <div
        style={{
          height: "500px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "10px 15px",
                borderRadius: "10px",
                background:
                  msg.role === "user" ? "#6366f1" : "#111827",
                color: "white",
                maxWidth: "70%",
              }}
            >
              {msg.content}
            </div>

            {/* SOURCES */}
            {msg.role === "ai" && msg.sources && (
              <div style={{ marginTop: "5px", fontSize: "12px" }}>
                📄 {msg.sources.length} sources
              </div>
            )}
          </div>
        ))}

        {loading && <p>🤖 AI is thinking...</p>}
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tanyakan sesuatu..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleSend}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            background: "#6366f1",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatUI;
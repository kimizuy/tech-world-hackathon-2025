"use client";

import { useEffect, useState } from "react";

interface Message {
  id: number;
  username: string;
  content: string;
  createdAt: string;
}

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !content) return;

    setLoading(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, content }),
    });
    setContent("");
    await fetchMessages();
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Drizzle + TiDB Demo</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              fontSize: 16,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <textarea
            placeholder="Message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: 10,
              fontSize: 16,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !username || !content}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      <h2>Messages</h2>
      {messages.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {messages.map((msg) => (
            <li
              key={msg.id}
              style={{
                padding: 15,
                marginBottom: 10,
                backgroundColor: "#f5f5f5",
                borderRadius: 8,
              }}
            >
              <strong>{msg.username}</strong>
              <span style={{ color: "#666", marginLeft: 10, fontSize: 12 }}>
                {new Date(msg.createdAt).toLocaleString()}
              </span>
              <p style={{ margin: "10px 0 0" }}>{msg.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatBox.css";
import ChatBoxIcon from "./../images/ChatBoxIcon.png";
import { IoCloseSharp } from "react-icons/io5";

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme-mode") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your AI assistant. How can I help you today?",
      user: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (!isLoading && isOpen) {
      inputRef.current?.focus();
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { text: inputValue, user: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: inputValue,
      });
      const botMessage = { text: response.data.reply, user: false };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        text: "Sorry, I encountered an error. Please try again.",
        user: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {!isOpen && (
        <button className="floating-chat-button" onClick={toggleChat}>
          <img src={ChatBoxIcon} alt="Chat" />
        </button>
      )}

      <div className={`chat-container ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <span>
            <img src={ChatBoxIcon} alt="AI Assistant" />
            AI Assistant
          </span>
          <button className="close-chat" onClick={toggleChat}>
            <IoCloseSharp />
          </button>
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.user ? "user-message" : "bot-message"} ${isLoading && index === messages.length - 1 ? 'typing' : ''}`}
            >
              {msg.text}
            </div>
          ))}

          {isLoading && (
            <div className="bot-message" style={{ borderRadius: "18px 18px 18px 5px" }}>
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="chat-input"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? <span className="spinner">↻</span> : <span>➤</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBox;
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const messageEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setChatHistory([]); // Reset chat history when closing the chatbot
    }
  };

  const sendMessage = async () => {
    if (!message) return;

    const userMessage = { type: 'user', text: message };
    setChatHistory([...chatHistory, userMessage]);

    setMessage(''); // Clear the message input immediately

    try {
      const response = await axios.post('/api/chat', { message: userMessage.text });
      const botMessage = { type: 'bot', text: response.data.response };
      setChatHistory((prevChatHistory) => [...prevChatHistory, botMessage]);
    } catch (error) {
      console.error('Error sending message to chatbot', error);
    }

    scrollToBottom();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  return (
    <>
      <div className="chatbot-icon" onClick={toggleChatbot}>
        <img src="/assets/images/dashboard/chatbot2.png" alt="Chatbot Icon" />
      </div>
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <img src="/assets/images/dashboard/Zephyr.gif" alt="Zephyr" className="header-image-full" />
            <button className="close-btn" onClick={toggleChatbot}>×</button>
          </div>
          <div className="chatbot-messages">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
      <style jsx>{`
        .chatbot-icon {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          cursor: pointer;
          z-index: 1000;
        }
        .chatbot-icon img {
          width: 100%;
          height: 100%;
        }
        .chatbot-container {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 400px;
          height: 600px;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .chatbot-header {
          background-color: #007bff;
          color: white;
          padding: 0;
          text-align: center;
          position: relative;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          height: 100px; /* Adjust the height as needed */
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .header-image-full {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }
        .chatbot-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          background-color: #f9f9f9;
        }
        .message {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 8px;
          max-width: 80%;
        }
        .message.user {
          text-align: right;
          background-color: #007bff;
          color: white;
          margin-left: auto;
        }
        .message.bot {
          text-align: left;
          background-color: #e0e0e0;
          color: #333;
          margin-right: auto;
        }
        .chatbot-input {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ccc;
          background-color: #f1f1f1;
          align-items: center;
        }
        .chatbot-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-right: 10px;
        }
        .chatbot-input button {
          padding: 10px 15px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .chatbot-input button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </>
  );
};

export default Chatbot;

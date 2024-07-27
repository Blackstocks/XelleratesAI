import { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    const userMessage = { type: 'user', text: message };
    setChatHistory([...chatHistory, userMessage]);

    try {
      const response = await axios.post('/api/chat', { message });
      const botMessage = { type: 'bot', text: response.data.response };
      setChatHistory([...chatHistory, userMessage, botMessage]);
    } catch (error) {
      console.error('Error sending message to chatbot', error);
    }

    setMessage('');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Xellerates AI Chatbot</h2>
      </div>
      <div className="chatbot-messages">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <style jsx>{`
        .chatbot-container {
          width: 400px;
          height: 600px;
          display: flex;
          flex-direction: column;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }
        .chatbot-header {
          background-color: #007bff;
          color: white;
          padding: 10px;
          text-align: center;
        }
        .chatbot-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          background-color: #f9f9f9;
        }
        .message {
          margin-bottom: 10px;
        }
        .message.user {
          text-align: right;
          color: #007bff;
        }
        .message.bot {
          text-align: left;
          color: #333;
        }
        .chatbot-input {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ccc;
        }
        .chatbot-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .chatbot-input button {
          padding: 10px;
          margin-left: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;

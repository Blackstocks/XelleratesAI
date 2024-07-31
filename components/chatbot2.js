import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaHome,
  FaComments,
  FaQuestionCircle,
  FaNewspaper,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const blogData = [
  {
    title: "The Crucial Role of Due Diligence in Startup Funding",
    content:
      "In the fast-paced world of startups, securing funding is often a crucial milestone for growth and expansion. Whether seeking equity funding or debt financing, startups face a competitive landscape where investors scrutinize every aspect of the business before committing capital. This is where due diligence plays a pivotal role, providing investors with the necessary confidence and assurance to invest in a startup.",
    image: "/assets/images/dashboard/blog1.jpeg",
  },
  {
    title:
      "Unlocking Potential: Why Now is the Ideal Time to Invest in Startups",
    content:
      "In the ever-evolving landscape of investments, the allure of startups continues to captivate seasoned investors and novices alike. While the allure of startups is perennial, the timing of investment plays a pivotal role in reaping optimal returns. In this article, we delve into why now presents an opportune moment to channel your investments into the startup ecosystem and discern the sectors primed for exponential growth.",
    image: "/assets/images/dashboard/blog2.jpeg",
  },
  {
    title:
      "Empowering Startups: The Role of Purchase Order (PO) Financing in Fulfilling Orders and Driving Revenue",
    content:
      "In the competitive landscape of startups, fulfilling orders and managing cash flow are paramount for sustained growth. Purchase Order (PO) financing emerges as a strategic solution, enabling startups to bridge the gap between securing orders and fulfilling them. This article delves into the concept of PO financing, its benefits for startups, and its role in accelerating revenue generation amidst the challenges of cash constraints.",
    image: "/assets/images/dashboard/blog3.jpeg",
  },
  {
    title: "Essentials Of Securing Startup Funding",
    content:
      "Embarking on the startup funding path requires a solid foundation. It's crucial to have a strong business plan that outlines your vision. A persuasive pitch can make your startup stand out to investors. Understanding the financial landscape helps you strategize effectively. With the right groundwork, your startup is more likely to secure the funding it needs for growth.",
    image: "/assets/images/dashboard/blog1.jpeg",
  },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const messageEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setChatHistory([]); // Reset chat history when closing the chatbot
    }
  };

  const sendMessage = async () => {
    if (!message) return;

    const userMessage = { type: "user", text: message };
    setChatHistory([...chatHistory, userMessage]);

    setMessage(""); // Clear the message input immediately

    try {
      const response = await axios.post("/api/chat", {
        message: userMessage.text,
      });
      const botMessage = { type: "bot", text: response.data.response };
      setChatHistory((prevChatHistory) => [...prevChatHistory, botMessage]);
    } catch (error) {
      console.error("Error sending message to chatbot", error);
    }

    scrollToBottom();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeContent onSendMessageClick={() => setActiveTab("messages")} />
        );
      case "messages":
        return (
          <div className="chatbot-messages">
            {chatHistory.length === 0 ? (
              <div className="no-messages">
                <FaComments size={48} />
                <p>No messages</p>
                <p>Messages from the team will be shown here</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`message-container ${
                    msg.type === "user" ? "user-message" : "bot-message"
                  }`}
                >
                  <div className={`message ${msg.type}`}>{msg.text}</div>
                </div>
              ))
            )}
            <div ref={messageEndRef} />
          </div>
        );
      case "help":
        return <HelpContent />;
      case "news":
        return <NewsContent />;
      default:
        return (
          <HomeContent onSendMessageClick={() => setActiveTab("messages")} />
        );
    }
  };

  return (
    <>
      <div className="chatbot-icon" onClick={toggleChatbot}>
        <img src="/assets/images/dashboard/chatbot2.png" alt="Chatbot Icon" />
      </div>
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <img
              src="/assets/images/dashboard/Zephyr.gif"
              alt="Zephyr"
              className="header-image-full"
            />
            <button className="close-btn" onClick={toggleChatbot}>
              ×
            </button>
          </div>
          <div className="chatbot-messages">{renderContent()}</div>

          {activeTab === "messages" && (
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
          )}

          <div className="chatbot-footer">
            <button
              onClick={() => setActiveTab("home")}
              className={activeTab === "home" ? "active" : ""}
            >
              <FaHome size={24} />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={activeTab === "messages" ? "active" : ""}
            >
              <FaComments size={24} />
              <span>Messages</span>
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={activeTab === "help" ? "active" : ""}
            >
              <FaQuestionCircle size={24} />
              <span>Help</span>
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={activeTab === "news" ? "active" : ""}
            >
              <FaNewspaper size={24} />
              <span>News</span>
            </button>
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
        .chatbot-content {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          background-color: transparent;
        }
        .chatbot-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .no-messages p {
          margin: 0;
        }
        .message-container {
          display: flex;
          margin-bottom: 10px;
        }
        .message-container.user-message {
          text-align: right;
          background-color: #007bff;
          color: white;
          margin-left: auto;
        }
        .message-container.bot-message {
          background-color: #f1f1f1;
          color: #333;
        }
        .message {
          padding: 10px;
          border-radius: 8px;
          max-width: 80%;
          word-break: break-word;
        }
        .message.user {
          text-align: right;
          background-color: #007bff;
          color: white;
          margin-left: auto;
        }
        .message.bot {
          background-color: #f1f1f1;
          color: #333;
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
        .chatbot-footer {
          display: flex;
          justify-content: space-around;
          padding: 10px;
          border-top: 1px solid #ccc;
          background-color: #f1f1f1;
        }
        .chatbot-footer button {
          background: none;
          border: none;
          color: #333;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .chatbot-footer button.active {
          color: #007bff;
        }
        .chatbot-footer span {
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </>
  );
};

const HomeContent = ({ onSendMessageClick }) => {
  const [expandedBlog, setExpandedBlog] = useState(null);

  const toggleBlog = (index) => {
    setExpandedBlog(expandedBlog === index ? null : index);
  };

  return (
    <div className="home-content">
      <div className="header-greeting">Hello there. How can we help?</div>
      <div className="send-message-bar" onClick={onSendMessageClick}>
        <input
          type="text"
          placeholder="Send us a message"
          className="send-message-input"
          readOnly
        />
        <FaArrowRight className="send-message-arrow" />
      </div>
      <div className="blog-section">
        {blogData.map((blog, index) => (
          <div key={index} className="blog-card">
            <img src={blog.image} alt={blog.title} className="blog-image" />
            <h3>{blog.title}</h3>
            <p>
              {expandedBlog === index
                ? blog.content
                : `${blog.content.split(" ").slice(0, 20).join(" ")}...`}
              <span className="read-more" onClick={() => toggleBlog(index)}>
                {expandedBlog === index ? " Show less" : " read more"}
              </span>
            </p>
          </div>
        ))}
      </div>
      <style jsx>{`
        .home-content {
          padding: 5px;
        }
        .header-greeting {
          font-size: 24px;
          font-weight: bold;
          text-align: left;
          margin-bottom: 5px;
          line-height: 1.2;
        }
        .send-message-bar {
          display: flex;
          align-items: center;
          background-color: #fff;
          border-radius: 8px;
          padding: 0px 10px;
          width: 100%;
          max-width: 400px;
          margin-top: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 1);
          cursor: pointer;
        }
        .send-message-input {
          flex: 1;
          border: none;
          background-color: transparent;
          font-size: 16px;
          padding: 10px;
          outline: none;
          cursor: pointer;
        }
        .send-message-arrow {
          color: #007bff;
          margin-left: 10px;
        }
        .send-message-arrow:hover {
          color: #0056b3;
        }
        .blog-section {
          padding: 20px 0;
        }
        .blog-card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          padding: 20px;
        }
        .blog-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
        }
        .blog-card h3 {
          margin-top: 10px;
          font-size: 20px;
          line-height: 1.2;
        }
        .blog-card p {
          margin: 10px 0;
        }
        .read-more {
          color: #007bff;
          cursor: pointer;
        }
        .read-more:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

const HelpContent = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      question: "What is Xellerates AI?",
      answer:
        "Xellerates AI is an investment tech platform and a one-stop solution for startups and investors to streamline the fundraising journey through artificial intelligence.",
    },
    {
      question: "Who can become a part of Xellerates AI?",
      answer:
        "Anyone who is a startup, investor, or incubator can become a part of Xellerates AI.",
    },
    {
      question:
        "Does Xellerates AI help startups with financial research and projections?",
      answer:
        "Yes, our Financial Insights tool helps with market studies, financial projections, and startup valuation. It provides accurate TAM, SAM, and SOM for your business, integrated with our Pitch Deck tool.",
    },
    {
      question: "How can Xellerates AI help me in fundraising?",
      answer:
        "We offer a Fundraising tool for equity funding, debt funding, M&A, and sale of secondary shares. It matches you with investors based on your profile.",
    },
    {
      question: "How does the fundraising tool work?",
      answer:
        "After analyzing your profile, you receive a list of investors aligned with your sector, stage, and geography. You can send connection requests to investors, and if they show interest, a meeting is scheduled.",
    },
    {
      question: "How does Xellerates AI address legal needs for startups?",
      answer:
        "Our legal tech solution offers legal agreements, a compliance library, and streamlined compliance management from day one.",
    },
    {
      question:
        "I am at the ideation stage and looking to avail grants from the government. Can Xellerates AI help?",
      answer:
        "Yes, first register your startup and obtain the Startup India certification through our Investment Readiness tool. We then help you connect with incubators for government grants and guide you through the application process.",
    },
    {
      question: "What kind of market research tools does Xellerates AI offer?",
      answer:
        "Our platform provides comprehensive market research tools that analyze your industry, competitors, and market trends to help you make informed decisions.",
    },
    {
      question:
        "Can Xellerates AI assist in networking with other startups and investors?",
      answer:
        "Yes, our platform includes networking features that allow you to connect with other startups, investors, and industry experts to build valuable relationships.",
    },
    {
      question: "Does Xellerates AI offer mentorship programs?",
      answer:
        "Yes, we provide access to a network of experienced mentors who can guide you through various stages of your startup journey.",
    },
    {
      question:
        "How can Xellerates AI help with my startup's compliance requirements?",
      answer:
        "Our compliance tools help you stay updated with regulatory requirements and streamline the process of maintaining compliance documentation.",
    },
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="help-content">
      <h5>Frequently asked question.</h5>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div
              className={`faq-question ${
                openQuestion === index ? "active" : ""
              }`}
              onClick={() => toggleQuestion(index)}
            >
              {faq.question}
              {openQuestion === index ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {openQuestion === index && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        .faq-list {
          margin-top: 20px;
        }
        .faq-item {
          margin-bottom: 10px;
        }
        .faq-question {
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background-color: #f1f1f1;
          border-radius: 4px;
        }
        .faq-answer {
          padding: 10px;
          background-color: #fff;
          border: 1px solid #f1f1f1;
          border-top: none;
          border-radius: 0 0 4px 4px;
        }
        .faq-question.active {
          color: #000;
        }
      `}</style>
    </div>
  );
};

const NewsContent = () => (
  <div className="news-content">
    <h2>Latest News</h2>
    <p>Here are the latest news articles...</p>
  </div>
);

export default Chatbot;

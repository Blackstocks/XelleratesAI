"use client"
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
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

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
  const [stage, setStage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const {profile} = useCompleteUserDetails(); 


  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Opening the chatbot
      setChatHistory([]); // Reset chat history when opening the chatbot
      setStage("initialGreeting"); // Set the initial stage when opening the chatbot
  
      // Send initial greeting message directly to chat history without user input
      const initialGreetingMessage = {
        role: "model",
        parts: [{
          text: "How are you doing today? Welcome to Xellerates AI! I am Zephyr, your personal Investment Banker. (I am an AI, trained for your fundraising journey). Are you an existing customer? Yes or No"
        }]
      };
      setChatHistory([initialGreetingMessage]);
      setStage("waitingForCustomerStatus"); // Move to the next stage
    } else {
      // Closing the chatbot
      setStage(null); // Reset stage when closing the chatbot
    }
  };


  const TypingIndicator = () => (
    <div className="typing-indicator">
      <span>.</span>
      <span>.</span>
      <span>.</span>
      <style jsx>{`
        .typing-indicator {
          display: inline-block;
          font-size: 18px;
          line-height: 18px;
          color: #333;
          opacity: 0.75;
          animation: typing 1s steps(3, end) infinite;
        }
  
        .typing-indicator span {
          animation: blink 1.4s infinite both;
        }
  
        @keyframes typing {
          from { width: 0; }
          to { width: 3em; }
        }
  
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
  

  const sendMessage = async (inputMessage) => {
    if (!inputMessage || typeof inputMessage !== 'string') {
      return; // Avoid processing if there is no valid input message
    }
  
    const userMessage = { role: "user", parts: [{ text: inputMessage }] };
    setMessage(""); // Clear the message input immediately
    setIsTyping(true); // Show typing indicator
  
    try {
      const messagesHistory = [...chatHistory, userMessage];
      setChatHistory(messagesHistory);
  
      let botResponseText;
  
      switch (stage) {
        case "waitingForCustomerStatus":
          if (inputMessage.toLowerCase() === "yes") {
            botResponseText = "Kindly confirm me with your email ID:";
            setStage("waitingForEmail");
          } else if (inputMessage.toLowerCase() === "no") {
            botResponseText = "Thank you for stepping in and planning to take your first step towards the startup ecosystem. Are you an investor or startup?";
            setStage("waitingForInvestorOrStartup");
          } else {
            botResponseText = "Please answer with 'Yes' or 'No'.";
          }
          break;
        case "waitingForEmail":
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailPattern.test(inputMessage)) {
              botResponseText = "Great! Do you have any questions for me?";
              setStage("waitingForInvestorOrStartup"); // Move to asking questions
          } else {
              botResponseText = "Please enter a valid email address.";
              setStage("waitingForEmail"); // Stay in the email stage
          }
          break;
        case "waitingForInvestorOrStartup":
          if (inputMessage.toLowerCase() === "investor") {
            botResponseText = "Are you? <br>• Venture Capital<br>• Angel Investor<br>• Family Office<br>• Angel Network<br>• Angel Fund";
            setStage("waitingForInvestorType");
          } else if (inputMessage.toLowerCase() === "startup") {
            botResponseText = "Which stage is your startup in?<br>• Bootstrapped<br>• Pre-Seed<br>• Seed<br>• Pre-Series A<br>• Series A<br>• Series B<br>• Series C & beyond";
            setStage("waitingForStartupStage");
          } else {
            botResponseText = "Please specify if you are an investor or a startup.";
          }
          break;
        case "waitingForInvestorType":
        case "waitingForStartupStage":
          botResponseText = "That's great! Do you have any questions for me?";
          //setStage("awaitingQuestion");
          const botMessageWithButtons = {
            role: "model",
            parts: [{ text: botResponseText }],
            buttons: [
              { label: "Continue to chat with Zephyr", action: "continueChat", icon: "/assets/images/chat/zephyr.png" },
              { label: "Talk to customer care on WhatsApp", action: "customerCare", icon: "/assets/images/chat/whatsapp.png" }
            ]
          };
          setChatHistory((prevChatHistory) => [...prevChatHistory, botMessageWithButtons]);
          setIsTyping(false);
          return

        case "waitingForQuestions":
          botResponseText = "Feel free to ask any questions you have.";
          setStage("awaitingQuestion");
          break;
        case "awaitingQuestion":
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messagesHistory, question: inputMessage }),
          });
    
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          const lastEntry = data[data.length - 1];
          const parts = lastEntry.parts;
          botResponseText = parts[0]?.text || "Sorry, something went wrong.";

          if (botResponseText.includes("{contact_info}")) {
            botResponseText = botResponseText.replace(
              "{contact_info}",
              `<a href="https://wa.me/9818446004?text=Hello" target="_blank" style="color: blue; text-decoration: underline; padding: 2px 4px; ">Click Here to chat on WhatsApp</a>`
            );
          }

          break;
        default:
          botResponseText = "Sorry, I didn't understand that. Can you please rephrase?";
      }
  
      const botMessage = { role: "model", parts: [{ text: botResponseText }] };
      setChatHistory((prevChatHistory) => [...prevChatHistory, botMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message to chatbot", error);
      const errorMessage = { role: "model", parts: [{ text: "Sorry, something went wrong. Please try again later." }] };
      setChatHistory((prevChatHistory) => [...prevChatHistory, errorMessage]);
      setIsTyping(false);
    } finally {
      scrollToBottom();
    }
  };

  const handleButtonClick = (action) => {
    if (action === "continueChat") {
      const thankYouMessage = {
        role: "model",
        parts: [{ text: "Thank you for choosing Zephyr. Please ask your question." }]
      };
      setChatHistory(prevChatHistory => [...prevChatHistory, thankYouMessage]);
      setStage("awaitingQuestion");
    } else if (action === "customerCare") {
      window.open(`https://wa.me/9818446004?text=Hello%2C%0AMy%20name%20is%20${profile?.name}%2E%0ANeed%20an%20assistance%20from%20an%20Investment%20banker%20@Xellerates%20AI`, "_blank");
    }
  };
  
  
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage(message);
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);


  const renderContent = () => {
    switch (activeTab) {
      case "messages":
        return (
          <div className="chatbot-messages">
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', width: '100%' }}>
                {msg.parts.map((part, partIndex) => (
                  <div key={partIndex} style={{
                    padding: '12px 18px',
                    borderRadius: '20px',
                    maxWidth: '75%',
                    wordBreak: 'break-word',
                    fontSize: '14px',
                    backgroundColor: msg.role === "user" ? '#4a90e2' : '#f7f7f7',
                    color: msg.role === "user" ? '#fff' : '#333',
                    alignSelf: msg.role === "user" ? 'flex-end' : 'flex-start'
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: part.text }} />
                  </div>
                ))}
  
                {/* Display buttons if present */}
                {msg.buttons && (
                  <div className="chatbot-buttons-container">
                    {msg.buttons.map((button, btnIndex) => (
                      <button
                        key={btnIndex}
                        onClick={() => handleButtonClick(button.action)}
                        className="chatbot-button"
                      >
                        {button.icon && <img src={button.icon} alt="" className="button-icon" />}
                        {button.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px', width: '100%' }}>
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '20px',
                  maxWidth: '75%',
                  wordBreak: 'break-word',
                  fontSize: '14px',
                  backgroundColor: '#f7f7f7',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    margin: '0 1.5px',
                    backgroundColor: "rgb(78 78 78)",
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'bounce 1.2s infinite ease-in-out',
                    animationDelay: '0s',
                  }}></span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    margin: '0 1.5px',
                    backgroundColor: 'rgb(78 78 78)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'bounce 1.2s infinite ease-in-out',
                    animationDelay: '-0.16s'
                  }}></span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    margin: '0 1.5px',
                    backgroundColor: 'rgb(78 78 78)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'bounce 1.2s infinite ease-in-out',
                    animationDelay: '-0.32s'
                  }}></span>
                </div>
              </div>
            )}
            <style>
{`
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  .chatbot-buttons-container {
  display: flex;
  margin-top: 20px;
  justify-content: center;
  margin-bottom: 20px;
}

.chatbot-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 2px;
  background-color: #fff;
  color: #4a90e2;
  border: 1px solid #4a90e2;
  border-radius: 15px;
  cursor: pointer;
  width: 40%;
  font-size: 12px;
  transition: background-color 0.3s ease;
  margin-right: 5px;
  margin-left: 5px;
}

.chatbot-button:hover {
  background-color: #4a90e2;
  color: #fff;
}

.button-icon {
  width: 25px;
  height: 25px;
  margin-left: 3px;
  margin-right: 5px;

}
`}
</style>
            <div ref={messageEndRef} />
          </div>
        );
      default:
        return (
          <HomeContent onSendMessageClick={() => setActiveTab("messages")} />
        );
    }
  };
  
  
  

  return (
    
    <>
  <div className="chatbot-icon" onClick={toggleChatbot}>
    <img src="/assets/images/dashboard/chatbot2.svg" alt="Chatbot Icon" />
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
          <button onClick={() => sendMessage(message)}>Send</button>
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
      width: 100%;
      max-width: 400px;
          height: 80vh;
          max-height: 600px;
      height: 600px;
      background-color: #fff;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
          .chatbot-container {
            bottom: 60px;
            right: 10px;
            width: 90%;
            height: 80vh;
          }
          .chatbot-icon {
            margin-bottom: 12%;
          }
        }

    .chatbot-header {
      background-color: #4a90e2;
      color: #fff;
      padding: 0;
      position: relative;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      height: 100px;
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
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
.message-container {
  display: flex;
  margin-bottom: 10px;
  width: 100%;
}

.user-message {
  justify-content: flex-end;
}

.bot-message {
  justify-content: flex-start;
}

.message {
  padding: 12px 18px;
  border-radius: 20px;
  max-width: 75%;
  word-break: break-word;
  font-size: 14px;
}

.message.user {
  background-color: #4a90e2;
  color: #fff;
}

.message.model {
  background-color: #f7f7f7;
  color: #333;
}

    .chatbot-input {
      display: flex;
      padding: 10px;
      border-top: 1px solid #e0e0e0;
      background-color: #f7f7f7;
    }
    .chatbot-input input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 25px;
      margin-right: 10px;
      font-size: 14px;
    }
    .chatbot-input button {
      padding: 10px 15px;
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
    }
    .chatbot-footer {
      display: flex;
      border-top: 1px solid #e0e0e0;
      background-color: #f7f7f7;
    }
    .chatbot-footer button {
      flex: 1;
      padding: 10px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .chatbot-footer button.active {
      background-color: #4a90e2;
      color: white;
    }
    .chatbot-footer button:hover {
      background-color: #007bff;
      color: white;
    }
    .chatbot-footer button span {
      font-size: 12px;
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
    <p>Here are the some latest news articles...?</p>
  </div>
);

export default Chatbot;

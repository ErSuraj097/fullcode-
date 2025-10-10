import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AnimatedChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const demoMessages = [
  { text: "Hello! I'm JetHat AI Assistant", isUser: false },
  { text: "Hi there! Can you help me build a chatbot?", isUser: true },
  { text: "Absolutely! I can help you create multilingual chatbots with advanced AI features.", isUser: false },
  { text: "That sounds amazing! What languages do you support?", isUser: true },
  { text: "I support 22+ Indian languages including Hindi, Tamil, Bengali, Telugu, and many more! For example:", isUser: false },
  { text: "नमस्ते! मैं जेटहैट एआई सहायक हूं। (Hindi)", isUser: false },
  // { text: "Hello! I'm JetHat AI Assistant. (English)", isUser: false },
  // { text: "வணக்கம்! நான் ஜெட்ஹாட் AI உதவியாளர். (Tamil)", isUser: false },
  // { text: "नमस्कारः! अहं जेटहैट् एआई सहायकः। (Sanskrit)", isUser: false },
  { text: "Wow! Can I customize the appearance?", isUser: true },
  { text: "Yes! You can customize colors, themes, avatars, and even add voice responses.", isUser: false },
  { text: "Do you support payment gateways?", isUser: true },
  { text: "Yes! We integrate with popular payment gateways like Stripe, Razorpay, and PayPal. You can add secure payment processing to your chatbot for subscriptions, one-time payments, and more. Details include easy API setup, transaction tracking, and customizable payment flows.", isUser: false },
  { text: "Can you tell me more about the payment integration?", isUser: true },
  { text: "Sure! With Stripe, you can handle credit cards, Apple Pay, Google Pay, and more with PCI-compliant security. Razorpay supports UPI, netbanking, and wallets popular in India. PayPal offers global reach with buyer protection. We provide SDKs, webhooks for real-time updates, and dashboard for monitoring transactions.", isUser: false },
  { text: "How secure is the payment processing?", isUser: true },
  { text: "Security is our top priority. All integrations use HTTPS, tokenization (no card details stored on your servers), and comply with GDPR and PCI DSS standards. You can also add fraud detection tools.", isUser: false },
  { text: "Perfect! How do I get started?", isUser: true },
  { text: "Simply sign up and start building your AI chatbot in minutes. It's that easy!", isUser: false },

  // 🔹 New extended details
  { text: "Can I accept multiple currencies?", isUser: true },
  { text: "Absolutely! Stripe and PayPal both support 135+ currencies, while Razorpay supports INR and major international currencies for cross-border transactions.", isUser: false },
  { text: "What about recurring or subscription billing?", isUser: true },
  { text: "Stripe and Razorpay provide powerful subscription APIs—ideal for monthly or annual plans. You can set trial periods, coupon codes, and automatic invoice generation.", isUser: false },
  { text: "Do you support refunds or partial refunds?", isUser: true },
  { text: "Yes, all gateways allow full or partial refunds directly through the dashboard or via API, with real-time status updates for your users.", isUser: false },
  { text: "Can I add payment links inside chatbot messages?", isUser: true },
  { text: "Definitely! You can send dynamic payment links or embedded checkout widgets right inside the conversation for a seamless experience.", isUser: false },
  { text: "Where can these integrations run?", isUser: true },
  { 
    text: "All these payment options—Stripe, Razorpay, and PayPal—can be integrated into your JetHat chatbot across web apps, mobile apps (iOS/Android), and popular frameworks like React, Next.js, Vue, or even WordPress sites using custom widgets.",
    isUser: false
  },
  { text: "Amazing! Can I monitor revenue analytics too?", isUser: true },
  { text: "Yes. Each gateway provides a live dashboard for revenue insights, and JetHat offers unified analytics so you can track payments and conversions in one place.", isUser: false }
];

// Example usage:
// import { demoMessages } from './demoMessages.js';
// console.log(demoMessages);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentMessageIndex < demoMessages.length) {
        setIsTyping(true);

        setTimeout(() => {
          const newMessage: Message = {
            id: Date.now(),
            text: demoMessages[currentMessageIndex].text,
            isUser: demoMessages[currentMessageIndex].isUser,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, newMessage]);
          setIsTyping(false);
          setCurrentMessageIndex(prev => prev + 1);
        }, 500);
      } else {
        // Optional: restart after a pause
        setTimeout(() => {
          setMessages([]);
          setCurrentMessageIndex(0);
        }, 6000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentMessageIndex, demoMessages.length]);

  // ➤ NEW: Always scroll to the bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]); // runs on every new message or typing indicator


  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (currentMessageIndex < demoMessages.length) {
  //       setIsTyping(true);
        
  //       setTimeout(() => {
  //         // Check if at bottom before adding message
  //         let wasAtBottom = true;
  //         if (chatContainerRef.current) {
  //           const { scrollTop, clientHeight, scrollHeight } = chatContainerRef.current;
  //           wasAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // Small epsilon for near-bottom
  //         }

  //         const newMessage: Message = {
  //           id: Date.now(),
  //           text: demoMessages[currentMessageIndex].text,
  //           isUser: demoMessages[currentMessageIndex].isUser,
  //           timestamp: new Date(),
  //         };
          
  //         setMessages(prev => [...prev, newMessage]);
  //         setIsTyping(false);
  //         setCurrentMessageIndex(prev => prev + 1);

  //         // Auto-scroll smoothly only if was at bottom
  //         if (wasAtBottom && chatContainerRef.current) {
  //           chatContainerRef.current.scrollTo({
  //             top: chatContainerRef.current.scrollHeight,
  //             behavior: 'smooth'
  //           });
  //         }
  //       }, 500);
  //     } else {
  //       // Reset animation after all messages
  //       setTimeout(() => {
  //         setMessages([]);
  //         setCurrentMessageIndex(0);
  //       }, 3000);
  //     }
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [currentMessageIndex, demoMessages.length]);

  return (
    <div className="animated-chatbot">
      <div className="mac-window">
        {/* Mac Window Header */}
        <div className="mac-window-header">
          <div className="mac-dots">
            <div className="mac-dot bg-red-600"></div>
            <div className="mac-dot bg-yellow-600"></div>
            <div className="mac-dot bg-green-600"></div>
          </div>
          <div className="mac-window-title text-[#e1802be0]">JetHat AI Assistant</div>
        </div>

        {/* Chat Container */}
        <div className="chat-container text-[#e1802be0]" ref={chatContainerRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message text-[#e1802be0] ${message.isUser ? 'user' : 'bot'}`}
            >
              <div className="flex items-start space-x-2">
                {message.isUser ? <User className="w-5 h-5 text-[#e1802be0]" /> : <Bot className="w-5 h-5 text-[#e1802be0]" />}
                <span>{message.text}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div className="chat-input-area text-[#e1802be0]">
          <div className="flex text-[#e1802be0] items-center space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="chat-input text-[#e1802be0]"
              disabled
            />
            <button className="p-2 bg-[#e1802be0] text-white rounded-full hover:shadow-lg transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedChatbot;
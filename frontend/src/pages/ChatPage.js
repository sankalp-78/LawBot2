import React, { useState, useEffect } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import '../styles/ChatPage.css';

const ChatPage = () => {
  // Get selected chat ID from localStorage
  const [selectedChatId, setSelectedChatId] = useState(() => {
    return localStorage.getItem('selectedChatId') || null;
  });

  // Manage chat list visibility state
  const [isChatListVisible, setIsChatListVisible] = useState(() => {
    const savedState = localStorage.getItem('chatListVisible');
    return savedState === null ? true : savedState === 'true';
  });

  // Handle chat selection
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    if (chatId) {
      localStorage.setItem('selectedChatId', chatId);
    } else {
      localStorage.removeItem('selectedChatId');
    }
    
    // Auto-hide chat list on mobile after selection
    if (window.innerWidth <= 768) {
      setIsChatListVisible(false);
    }
  };

  // Toggle chat list visibility
  const toggleChatList = () => {
    setIsChatListVisible(!isChatListVisible);
    localStorage.setItem('chatListVisible', !isChatListVisible);
  };

  return (
    <div className="chat-page-container">
      <div className={`chat-page ${isChatListVisible ? 'chat-list-visible' : 'chat-list-hidden'}`}>
        <aside className="chat-list-container">
          <ChatList 
            currentChatId={selectedChatId} 
            onSelectChat={handleSelectChat} 
          />
        </aside>
        
        <main className="chat-window-container">
          <ChatWindow selectedChatId={selectedChatId} />
        </main>
        
        <button 
          className="toggle-chat-list-btn" 
          onClick={toggleChatList}
          aria-label={isChatListVisible ? "Hide chat history" : "Show chat history"}
          title={isChatListVisible ? "Hide chat history" : "Show chat history"}
        >
          {isChatListVisible ? "←" : "→"}
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
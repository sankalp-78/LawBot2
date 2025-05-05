import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/ChatList.css';

const ChatList = ({ onSelectChat, currentChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const token = localStorage.getItem('token');

  // Fetch chats on component mount and when a chat is deleted
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:4500/api/chat/list', {
        headers: { 'x-auth-token': token },
      });
      setChats(res.data);
      
      // Only select a chat if none is already selected
      if (!currentChatId && res.data.length > 0) {
        onSelectChat(res.data[0].chatId);
      } else if (currentChatId && !res.data.some(chat => chat.chatId === currentChatId)) {
        // If current chat was deleted, select a new one
        if (res.data.length > 0) {
          onSelectChat(res.data[0].chatId);
        } else {
          onSelectChat(null);
        }
      }
    } catch (err) {
      setError('Failed to load chats');
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, [token, currentChatId, onSelectChat]);

  useEffect(() => {
    if (token) fetchChats();
  }, [token, fetchChats]);

  const handleNewChat = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('http://localhost:4500/api/chat/new', {}, {
        headers: { 'x-auth-token': token },
      });
      
      // Add new chat to the list and select it
      const newChat = { 
        chatId: res.data.chatId, 
        lastMessage: 'New chat', 
        createdAt: new Date() 
      };
      setChats([newChat, ...chats]);
      onSelectChat(res.data.chatId);
    } catch (err) {
      setError('Failed to create new chat');
      console.error('Error creating chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteChat = (chatId, e) => {
    // Prevent event propagation to avoid selecting the chat when clicking delete
    e.stopPropagation();
    setDeletingChatId(chatId);
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setDeletingChatId(null);
    setShowConfirmation(false);
  };

  const handleDeleteChat = async () => {
    if (!deletingChatId) return;
    
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`http://localhost:4500/api/chat/delete/${deletingChatId}`, {
        headers: { 'x-auth-token': token },
      });
      
      // Remove deleted chat from the list
      const updatedChats = chats.filter((chat) => chat.chatId !== deletingChatId);
      setChats(updatedChats);
      
      // If the deleted chat was selected, select a new one
      if (deletingChatId === currentChatId) {
        if (updatedChats.length > 0) {
          onSelectChat(updatedChats[0].chatId);
        } else {
          onSelectChat(null);
        }
      }
      
      // Clear confirmation dialog
      setShowConfirmation(false);
      setDeletingChatId(null);
      
      // Refresh the chat list
      fetchChats();
    } catch (err) {
      setError('Failed to delete chat');
      console.error('Error deleting chat:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Your Chats</h3>
        <button 
          className="new-chat-btn" 
          onClick={handleNewChat}
          disabled={loading}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Chat</span>
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading && chats.length === 0 ? (
        <div className="loading">Loading chats...</div>
      ) : chats.length === 0 ? (
        <p className="no-chats">No chats yet. Create your first chat to get started!</p>
      ) : (
        <div className="chat-items-container">
          {chats.map((chat) => (
            <div 
              key={chat.chatId} 
              className={`chat-item ${currentChatId === chat.chatId ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.chatId)}
            >
              <div className="chat-item-content">
                <div className="chat-item-icon">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div className="chat-item-info">
                  <p className="chat-item-message">{chat.lastMessage}</p>
                  <small className="chat-item-date">{new Date(chat.createdAt).toLocaleString()}</small>
                </div>
              </div>
              <button 
                className="delete-btn" 
                onClick={(e) => confirmDeleteChat(chat.chatId, e)}
                aria-label="Delete chat"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h4>Delete Chat</h4>
            <p>Are you sure you want to delete this chat? This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button 
                className="cancel-btn" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleDeleteChat}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
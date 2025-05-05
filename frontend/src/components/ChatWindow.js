import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatWindow.css';
import SendIcon from './icons/SendIcon';
import MicIcon from './icons/MicIcon';

const ChatWindow = ({ selectedChatId }) => {
  const [chatId, setChatId] = useState(selectedChatId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('legal');
  const token = localStorage.getItem('token');
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [isResponding, setIsResponding] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check for browser SpeechRecognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
      console.warn('Speech recognition is not supported in this browser');
      return;
    }
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    
    // Set up event handlers
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
      setListening(false);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setListening(false);
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (selectedChatId) {
          // If there's a selectedChatId, fetch its history
          const res = await axios.get(
            `http://localhost:4500/api/chat/history/${selectedChatId}`,
            { headers: { 'x-auth-token': token } }
          );
          setChatId(selectedChatId);
          setMessages(res.data);
          setDisplayedMessages(res.data.map(msg => ({ ...msg, displayedContent: msg.content })));
        } else {
          // Only create a new chat if there are no chats at all (checked later)
          const res = await axios.get(
            'http://localhost:4500/api/chat/list',
            { headers: { 'x-auth-token': token } }
          );
          if (res.data.length === 0) {
            const newChatRes = await axios.post(
              'http://localhost:4500/api/chat/new',
              {},
              { headers: { 'x-auth-token': token } }
            );
            setChatId(newChatRes.data.chatId);
            setMessages([]);
            setDisplayedMessages([]);
          }
        }
      } catch (err) {
        console.error('Error fetching chat data:', err);
      }
    };
    if (token) fetchChatData();
  }, [token, selectedChatId]);

  useEffect(() => {
    setChatId(selectedChatId);
  }, [selectedChatId]);

  // Auto scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Stop listening when sending a message
    if (listening) {
      setListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Failed to stop recognition', error);
        }
      }
    }
    
    const newMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    
    setMessages([...messages, newMessage]);
    setDisplayedMessages([...displayedMessages, { ...newMessage, displayedContent: newMessage.text }]);
    setInput('');
    setIsResponding(true);

    try {
      const res = await axios.post(
        'http://localhost:4500/api/chat/message',
        { message: input, chatId, mode },
        { headers: { 'x-auth-token': token } }
      );
      const botMessage = {
        id: Date.now(),
        text: res.data.reply,
        sender: 'bot',
        displayedContent: '',
      };
      setMessages([...messages, newMessage, botMessage]);
      setDisplayedMessages([...displayedMessages, { ...newMessage, displayedContent: newMessage.text }, botMessage]);

      let currentText = '';
      const fullText = res.data.reply;
      let index = 0;

      const type = () => {
        if (index === 0) setIsResponding(false);
        if (index < fullText.length) {
          currentText += fullText[index];
          setDisplayedMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].displayedContent = currentText;
            return updated;
          });
          index++;
          setTimeout(type, 20);
        }
      };
      type();
    } catch (err) {
      console.error('Error sending message:', err);
      setIsResponding(false);
    }
  };

  const handleUpload = (newMessages) => {
    setMessages((prev) => [...prev, ...newMessages]);
    setDisplayedMessages((prev) => [...prev, ...newMessages.map(msg => ({ ...msg, displayedContent: msg.text }))]);
  };

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          // Request microphone permission first
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
              recognitionRef.current.start();
              setListening(true);
            })
            .catch(error => {
              console.error('Microphone permission denied:', error);
              alert('Please allow microphone access to use voice input.');
            });
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          alert('Speech recognition failed to start. Please try again.');
        }
      } else {
        alert('Speech recognition is not supported in your browser.');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-window">
      <div className="select-mode-section">
        <h2>Select Mode</h2>
        <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="legal">Legal Assistant</option>
          <option value="financial">Financial Advisor</option>
        </select>
      </div>
      <div className="messages">
        {displayedMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender} ${msg.isFading ? 'fade-out' : ''}`}>
            <div className="message-header">
              <span className="sender-label">{msg.sender === 'user' ? 'You' : 'Bot'}</span>
            </div>
            <div className="message-content">
              {msg.sender === 'bot' ? (
                <ReactMarkdown 
                  children={msg.displayedContent || ' '} 
                  components={{
                    p: ({node, ...props}) => <p {...props} />,
                    pre: ({node, ...props}) => <pre {...props} />,
                    code: ({node, ...props}) => <code {...props} />,
                    ul: ({node, ...props}) => <ul {...props} />,
                    ol: ({node, ...props}) => <ol {...props} />,
                    li: ({node, ...props}) => <li {...props} />
                  }}
                />
              ) : (
                <p>{msg.displayedContent}</p>
              )}
            </div>
          </div>
        ))}
        {isResponding && (
          <div className="message bot responding">
            <div className="message-header">
              <span className="sender-label">Bot</span>
            </div>
            <div className="message-content">
              <p>Responding...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <FileUpload chatId={chatId} onUpload={handleUpload} />
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={handleKeyPress}
          disabled={listening}
        />
        <div className="chat-actions">
          <button 
            className={`mic-button ${listening ? 'voice-btn listening' : ''}`}
            onClick={toggleListening} 
            disabled={!speechSupported}
            title={listening ? "Stop listening" : "Start voice input"}
          >
            <MicIcon isListening={listening} />
          </button>
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!input.trim()}
            title="Send message"
          >
            <span className="send-text">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
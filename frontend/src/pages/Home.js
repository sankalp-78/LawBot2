import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-page">
      {/* Hero section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your intelligent <span className="highlight">Legal Assistant</span>
            </h1>
            <p className="hero-subtitle">
              Get quick, accurate answers to your legal questions with our AI-powered chatbot.
              Upload documents, ask questions, and receive expert legal information instantly.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/chat" className="btn hero-btn">
                  Start Chatting
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn hero-btn">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-outline hero-btn-secondary">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-blob"></div>
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="hero-icon"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <path d="M12 7v.01"></path>
              <path d="M16 9v.01"></path>
              <path d="M8 11V11"></path>
              <path d="M10 13V13"></path>
              <path d="M14 15V15"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3>Smart Legal Analysis</h3>
              <p>Our AI analyzes legal questions and provides accurate, relevant information based on legal precedents and statutes.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>Document Upload</h3>
              <p>Upload legal documents, contracts, and files for instant analysis and information extraction.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Secure & Private</h3>
              <p>Your conversations and documents are secure and private, with industry-standard encryption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create an account in seconds to get started.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Ask Questions</h3>
              <p>Ask any legal question or upload documents for analysis.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Answers</h3>
              <p>Receive instant, accurate responses based on legal data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to get started?</h2>
          <p>Join thousands of users who trust Law Bot for their legal inquiries.</p>
          {user ? (
            <Link to="/chat" className="btn">Go to Chat</Link>
          ) : (
            <Link to="/register" className="btn">Create a Free Account</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
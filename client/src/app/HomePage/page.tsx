"use client"
import { auth, googleProvider } from '@/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react';
import ChatFileUpload from '@/components/ChatFile';
import '../../App.css'
import Message from '../../components/Message';


const HomePage = ({serverData}: {serverData: string}) => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<JSX.Element[]>([]);

  const authWithGoogle = async () => {
    setLoading(true);
    try {
        await signInWithPopup(auth, googleProvider);
        setIsAuthenticated(true);
    } catch {
        console.log("Invalid");
    } finally {
      setLoading(false);
    }
  }

  const sendMessage = async (text: string) => {
    if (text.length === 0) {
      return;
    }

    setWaitingForResponse(true);
    setMessages((prevMessages) => [...prevMessages, <Message text={text} role="user" />]);
    setInputValue('');

    const response = await fetch('http://localhost:5050/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: text }),
    });

    const data = await response.json();

    setMessages((prevMessages) => [...prevMessages, <Message text={data.response} role="bot" />]);

    setWaitingForResponse(false);
    console.log(data);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(inputValue);
    }
  };

  return (
    <div>
      <div className={`app-container ${isAuthenticated ? '' : 'blurred'}`}>
        <div className='chat-interface'>
          <div className='messages'>
            {messages}
          </div>
          <div className={`input-container ${waitingForResponse ? 'disabled' : ''}`}>
            <ChatFileUpload/>
            <input
              type="text"
              className="prompt-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message and press Enter"
              disabled={waitingForResponse}
            />

            <img
              src={`${waitingForResponse ? '/send-icon-dark.svg' : '/send-icon.svg'}`}
              alt="Send"
              className="send-icon"
              onClick={() => sendMessage(inputValue)}
              style={{ cursor: 'pointer', width: '24px', height: '24px' }} // Adjust size as needed
            />
          </div>
        </div>
      </div>

      <div className={`login-overlay ${isAuthenticated ? 'invisible' : ''}`} >
        {isAuthenticated ? ( <></> ) : (
          <button onClick={ () => authWithGoogle() } disabled={ loading }>{loading ? "Logging in..." : "Log in with Google"}</button>
        )}
      </div>
    </div>       
  )
}
export default HomePage;
"use client"
import { auth, googleProvider } from '@/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react';

import '../../src/App.css'
import Message from './Message';


const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const sendMessage = (text: string) => { 
    setMessages([...messages, <Message text={text} />]);
    setInputValue('');
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
            <input
              type="text"
              className="prompt-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message and press Enter"
            />
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
export default LoginPage;
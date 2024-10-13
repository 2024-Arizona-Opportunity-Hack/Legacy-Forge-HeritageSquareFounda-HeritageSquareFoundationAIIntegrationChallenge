import React, { useState } from 'react';
import { auth, googleProvider } from "./firebaseConfig.tsx";
import { signInWithPopup } from "firebase/auth";
import Message from '../../client/src/components/Message';
import './App.css';

const App = () => {
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

    const response = await fetch('http://localhost:5000/api/query', {
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
            <input
              type="text"
              className="prompt-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message and press Enter"
              disabled={waitingForResponse}
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

export default App;
"use client"
import { auth, googleProvider } from '@/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

import '../../App.css'
import Message from '../../components/Message';

const CLIENT_ID = '1087063763558-ocddjiusqu06b8lvh100d0afeov1k7i6.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAHMXyqXzzGNWPoialYthc3c12QyBxiVfw';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';
const DRIVE_ID = '1n_MKI9iE_3X1C7EnigH3NZcigXz-8r3C'; 



const HomePage = ({serverData}: {serverData: string}) => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<JSX.Element[]>([]);
  const [hasDriveAccess, setHasDriveAccess] = useState(false);

  // Initialize Google API client when component mounts
  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: CLIENT_ID,
        scope: DRIVE_SCOPE,
      });
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const authWithGoogle = async () => {
    setLoading(true);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        
        // Get the OAuth token
        const token = result.user.accessToken;
        console.log("User's OAuth token: ", token);

        // Now, check for Google Drive permissions after sign-in
        await checkDrivePermissions(token, result.user.email);

        setIsAuthenticated(true);
    } catch (error) {
        console.log("Invalid login attempt", error);
    } finally {
      setLoading(false);
    }
  };

  const checkDrivePermissions = async (accessToken: string, userEmail: string) => {
    try {
      // Set the OAuth2 token in the headers
      gapi.client.setToken({ access_token: accessToken });

      const response = await gapi.client.drive.permissions.list({
        fileId: DRIVE_ID,
      });

      const hasAccess = response.result.permissions.some(
        (permission: any) => permission.emailAddress === userEmail
      );

      if (hasAccess) {
        setHasDriveAccess(true);
        console.log("User has access to the Drive.");
      } else {
        setHasDriveAccess(false);
        console.log("User does NOT have access to the Drive.");
      }
    } catch (error) {
      console.error("Error checking Drive permissions:", error);
    }
  };

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
      <div className={`app-container ${isAuthenticated && hasDriveAccess ? '' : 'blurred'}`}>
        <div className='chat-interface'>
          <div className='messages'>
            {messages}
          </div>
          <div className={`input-container ${waitingForResponse ? 'disabled' : ''}`}>
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

      <div className={`login-overlay ${isAuthenticated && hasDriveAccess ? 'invisible' : ''}`} >
        {isAuthenticated && hasDriveAccess ? ( <></> ) : (
          <button onClick={ () => authWithGoogle() } disabled={ loading }>{loading ? "Logging in..." : "Log in with Google"}</button>
        )}
        {isAuthenticated && !hasDriveAccess && (
          <p>You do not have access to the required Google Drive.</p>
        )}
      </div>
    </div>       
  )
}

export default HomePage;

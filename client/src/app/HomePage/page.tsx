"use client"
import { auth, googleProvider } from '@/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import React, { useRef, useState } from 'react';

import '../../App.css'
import LogIn from '@/components/LogIn';
import Message from '@/components/Message';

import { PaperClipIcon } from '@heroicons/react/16/solid';

const HomePage = ({serverData}: {serverData: string}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<JSX.Element[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [click, setClicked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFile, setFile] = useState(false) //basically when i do the query request it needs to know whether im sending a file or a text message which is what this will be doing 
  const handleFileClick = () => {
    // Trigger the hidden file input click
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClicked(true);
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
      setSelectedFile(file);
      setFile(true)
      

      // Send file to chatbot is going to be replaced by actual query 
      sendFileToChatbot(file);
      
      // Reset click state after 5 seconds (just for visual feedback)
      setTimeout(() => {
        console.log('Woke up after 5 seconds');
        setClicked(false);
      }, 5000);
    }
  };

  const sendFileToChatbot = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
   
      //example fetch
    // fetch('https://your-chatbot-api-endpoint.com/upload', {
    //   method: 'POST',
    //   body: formData,
    // })
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log('File sent successfully:', data);
    //   })
    //   .catch(error => {
    //     console.error('Error sending file:', error);
    //   });
    
    

  };
  

  const handleLogin = () => {
    setIsAuthenticated(true);
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
      <div className={`app-container ${isAuthenticated ? '' : 'blurred'}`}>
        <div className='chat-interface'>
          <div className='messages'>
            {messages}
          </div>
          <div className={`input-container ${waitingForResponse ? 'disabled' : ''}`}>
            {/*File Button*/}
              <div className="flex items-center space-x-2">
                {/* Icon that triggers file input */}
                <button onClick={handleFileClick} className={`p-2 rounded hover:bg-gray-300 ${click ? 'bg-gray-500' : 'bg-gray-200'}`}>
                  <PaperClipIcon className="h-6 w-6 text-gray-600" />
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Optional file display */}
                {selectedFile && <span>{selectedFile.name}</span>}
              </div>
            {/**End */}
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

      <LogIn handleLogin={handleLogin} isAuthenticated={isAuthenticated}/>
    </div>       
  )
}
export default HomePage;
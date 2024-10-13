import React, { useState } from 'react';
import { auth, googleProvider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <div>
      <div className={`app-container ${isAuthenticated ? '' : 'blurred'}`}>
        <div className='chat-interface'>
          <div className='messages'>

          </div>
          <input className='prompt-input' placeholder="Type your message..."/>
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
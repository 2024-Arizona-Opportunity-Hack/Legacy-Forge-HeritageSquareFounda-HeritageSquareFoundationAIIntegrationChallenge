"use client"
import { auth, googleProvider } from '@/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react';

import '../../src/App.css'


const LoginPage = () => {
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
        <>
         <div>
        <div className={`app-container ${isAuthenticated ? '' : 'blurred'}`}>
            <div className='chat-interface'>
            <h1>Logged in</h1>
            </div>
        </div>

        <div className='login-overlay'>
            {isAuthenticated ? ( <></> ) : (
            <button onClick={ () => authWithGoogle() } disabled={ loading }>{loading ? "Logging in..." : "Log in with Google"}</button>
            )}
        </div>
    </div>
        </>
    ) 
}
export default LoginPage;
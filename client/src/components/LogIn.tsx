import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig'; // Adjust the import path as necessary

const LogIn: React.FC<{ handleLogin: () => void; isAuthenticated: boolean }> = ({ handleLogin, isAuthenticated }) => {
    const [loading, setLoading] = useState(false);

    const authWithGoogle = async () => {
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            handleLogin();
        } catch {
            console.log("Invalid");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`login-overlay ${isAuthenticated ? 'invisible' : ''}`}>
            {isAuthenticated ? (
                <></>
            ) : (
                <button onClick={authWithGoogle} disabled={loading}>
                    {loading ? "Logging in..." : "Log in with Google"}
                </button>
            )}
        </div>
    );
};

export default LogIn;
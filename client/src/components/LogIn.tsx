import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import './LogIn.css';

const CLIENT_ID = '651819070947-s3di6ljn1kt80gnmp8e1p4otka9s5ppo.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

const LogIn: React.FC<{ handleLogin: () => void; isAuthenticated: boolean }> = ({ handleLogin, isAuthenticated }) => {
    const [loading, setLoading] = useState(false);
    const [doesNotHavePermission, setDoesNotHavePermission] = useState(false);
    
    useEffect(() => {
        // Initialize Google API client
        function start() {
            gapi.client.init({
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            });
        }
        gapi.load('client:auth2', start); // Load the Google API library when the component mounts
    }, []);

    const authWithGoogle = async () => {
        setLoading(true);
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signIn(); // Trigger Google sign-in
            
            // After successful login, fetch permissions
            const emails = await listPermissions("1_RR7KyuQ-bIS1x7tvnxtfW-b-ibjGGWc");

            // Check if the user has the correct permission
            if (!emails.includes(authInstance.currentUser.get().getBasicProfile().getEmail())) {
                setDoesNotHavePermission(true);
                setLoading(false);
                return;
            }
            
            handleLogin(); // Call the parent component's handleLogin function to indicate login success
            setLoading(false);
        } catch (error) {
            console.error('Google sign-in failed:', error);
            setLoading(false);
        }
    };

    const listPermissions = async (fileId: string) => {
        try {
            const response = await gapi.client.drive.permissions.list({
                fileId: fileId,
                fields: 'permissions'
            });
            const permissions = response.result.permissions;

            const emails = permissions.map((permission: { emailAddress: any; }) => permission.emailAddress);

            return emails

        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    return (
        <div className={`login-overlay ${isAuthenticated ? 'invisible' : ''}`}>
            {isAuthenticated ? (
                <></>
            ) : (
                <button onClick={authWithGoogle} disabled={loading}>
                    {loading ? 'Logging in...' : doesNotHavePermission ? 'Unauthorized Account. Log in With Google' : 'Log in with Google'}
                </button>
            )}
        </div>
    );
};

export default LogIn;
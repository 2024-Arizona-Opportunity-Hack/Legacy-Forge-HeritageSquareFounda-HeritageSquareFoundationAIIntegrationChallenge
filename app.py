import streamlit as st
import requests
import json
import firebase_admin
from firebase_admin import credentials, auth

# Firebase configuration
FIREBASE_WEB_API_KEY = "AIzaSyDmieQrqLjTJzAhkLV9VpdLQNuVrUthvks"  # Replace with your Firebase Web API Key
FIREBASE_CREDENTIALS_PATH = "hackathon-legacyforge-firebase-adminsdk-k8wly-b2a7c3c5e8.json"  # Replace with path to Firebase Admin SDK credentials

# Initialize Firebase Admin SDK (for token verification)
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

# Function to handle Google sign-in via Firebase
def google_sign_in():
    auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key={FIREBASE_WEB_API_KEY}"
    payload = {
        "postBody": "id_token=YOUR_GOOGLE_ID_TOKEN&providerId=google.com",
        "requestUri": "http://localhost",  # This can be any value
        "returnIdpCredential": True,
        "returnSecureToken": True
    }
    response = requests.post(auth_url, data=json.dumps(payload))
    return response.json()

# Function to verify ID token using Firebase Admin SDK
def verify_firebase_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        st.error("Invalid token or session expired")
        return None

# Firebase login button
st.title("AI Chat with Firebase Authentication")

if 'firebase_user' not in st.session_state:
    st.session_state['firebase_user'] = None

if st.session_state['firebase_user']:
    st.success(f"Logged in as {st.session_state['firebase_user']['email']}")
else:
    if st.button("Login with Google"):
        # Simulate Google Sign-In (replace with actual Google Sign-In flow)
        # In practice, you would obtain an `id_token` from Google Sign-In API
        response = google_sign_in()
        if "idToken" in response:
            st.session_state['firebase_user'] = verify_firebase_token(response['idToken'])
            if st.session_state['firebase_user']:
                st.success("Logged in successfully!")
        else:
            st.error("Login failed")

# Session state to store conversation history
if 'messages' not in st.session_state:
    st.session_state['messages'] = []

# Function to simulate AI response
def get_agent_response(user_input):
    return f"{user_input[::-1]}"  # Example: Reversing user input

# Display chat only if user is logged in
if st.session_state['firebase_user']:
    # Input box for user message
    user_input = st.text_input("You:", key="user_input")

    # Submit button to send the message
    if st.button("Send"):
        if user_input:
            st.session_state['messages'].append(("User", user_input))
            ai_response = get_agent_response(user_input)
            st.session_state['messages'].append(("AI", ai_response))

    # Display conversation history
    for sender, message in st.session_state['messages']:
        if sender == "User":
            st.markdown(f"**You**: {message}")
        else:
            st.markdown(f"**AI**: {message}")
else:
    st.warning("Please log in to chat with the AI.")

import React from 'react';
import './Message.css'

// Define a custom Message component
type MessageProps = {
    text: string;
    role: string;
};

const Message: React.FC<MessageProps> = ({ text, role }) => {
    if (role === "user") {
        return <div className="message user">{text}</div>;
    } else if (role === "bot") {
        return <div className="message bot">{text}</div>;
    }
};

export default Message;
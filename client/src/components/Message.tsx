import React from 'react';
import './Message.css'

// Define a custom Message component
type MessageProps = {
  text: string;
};

const Message: React.FC<MessageProps> = ({ text }) => {
  return <div className="message">{text}</div>;
};

export default Message;
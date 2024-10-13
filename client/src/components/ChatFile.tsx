import React, { useRef } from 'react';
import { PaperClipIcon } from '@heroicons/react/16/solid';

const ChatFileUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileClick = () => {
    // Trigger the hidden file input click
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
      // You can handle the file upload logic here (e.g., send it to the backend)
      
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Icon that triggers file input */}
      <button onClick={handleFileClick} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
        <PaperClipIcon className="h-6 w-6 text-gray-600" />
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* File display (optional) */}
      {/* You can add logic to show the selected file name */}
    </div>
  );
};

export default ChatFileUpload;

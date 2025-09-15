import React from 'react';

interface MessageBubbleProps {
  sender: 'ai' | 'user';
  text: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, text }) => {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] p-4 rounded-2xl ${
          sender === 'user'
            ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white ml-4'
            : 'bg-white/80 text-gray-800 mr-4 border border-teal-100 shadow-sm'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;

import { useState } from 'react';
import axios from 'axios';

export default function ChatWindow() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const response = await axios.post('/api/chat', { message: input });
    setMessages(prev => [...prev, `You: ${input}`, `Bot: ${response.data.reply}`]);
    setInput('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, idx) => <p key={idx}>{msg}</p>)}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type here..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

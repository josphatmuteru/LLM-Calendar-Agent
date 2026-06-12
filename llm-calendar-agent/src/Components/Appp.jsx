import React, { useState } from 'react';
import { streamAgentChat } from '../services/agentApi.js';

export default function Appp() {
  const [thinking, setThinking] = useState('');
  const [content, setContent] = useState('');

  const handleAskAgent = async () => {
    setThinking('');
    setContent('');

    const history = [{ role: 'user', content: 'What should I wear in Tokyo?' }];
    
    await streamAgentChat(
      history,
      (thinkToken) => setThinking(prev => prev + thinkToken),
      (contentToken) => setContent(prev => prev + contentToken),
      () => console.log("Stream completely finished!")
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={handleAskAgent}>Query Gemma 4 Agent</button>
      <div><strong>Thinking Track:</strong> <pre>{thinking}</pre></div>
      <div><strong>Final Response:</strong> <p>{content}</p></div>
    </div>
  );
}

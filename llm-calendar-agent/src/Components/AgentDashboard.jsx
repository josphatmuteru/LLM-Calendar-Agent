import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamAgentChat } from '../services/agentApi';

export default function AgentDashboard() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]); // Stores completed chat history pairs
  const [currentThinking, setCurrentThinking] = useState(''); // Live thinking block
  const [currentResponse, setCurrentResponse] = useState(''); // Live response block
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef(null);

  // Automatically scroll the interface downward as new reasoning blocks stream in
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThinking, currentResponse, messages]);

  const handleSendPrompt = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = { role: 'user', content: prompt };
    
    // 1. Immediately append the user message into history array state
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setCurrentThinking('');
    setCurrentResponse('');

    // Prepare full historical payloads including previous chats
    const fullConversationHistory = [...messages, userMessage];

    try {
      // 2. Invoke network agent call from agentAPI.js
      await streamAgentChat(
        fullConversationHistory,
        (thinkToken) => setCurrentThinking((prev) => prev + thinkToken),
        (contentToken) => setCurrentResponse((prev) => prev + contentToken),
        () => {
          // Stream completed callback: finalize chat state history
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: currentResponse || "Task complete." }
          ]);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Agent error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar Header */}
      <header style={styles.header}>
        <h2 style={styles.title}>🤖 Gemma 4 Co-Pilot Studio</h2>
        <span style={styles.badge}>{isLoading ? 'Agent Synthesizing...' : 'Idle'}</span>
      </header>

      {/* Main Split-Screen Workspace Board */}
      <div style={styles.workspace}>
        
        {/* Left Side: Historical Conversational Logs */}
        <div style={styles.historyPanel}>
          <h3 style={styles.panelTitle}>📜 Conversation Log</h3>
          <div style={styles.scrollContainer}>
            {messages.length === 0 && (
              <p style={styles.emptyState}>No messages yet. Send a complex instruction to see the agent think.</p>
            )}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  ...styles.chatBubble,
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? '#3b82f6' : '#27272a'
                }}
              >
                <div style={styles.bubbleRole}>{msg.role === 'user' ? 'You' : 'Gemma 4'}</div>
                <div style={styles.bubbleText}>{msg.content}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Right Side: Active Real-Time Execution Traces */}
        <div style={styles.executionPanel}>
          
          {/* Active Container Block 1: Internal Markdown Thinking Window */}
          <div style={styles.thinkingContainer}>
            <div style={styles.containerHeader}>
              <span>🤔 Reasoning Chain (Markdown Enabled)</span>
            </div>
            <div style={styles.liveCodeBlock}>
              {currentThinking ? (
                <ReactMarkdown>{currentThinking}</ReactMarkdown>
              ) : (
                <span style={styles.placeholderText}>Waiting for thoughts to form...</span>
              )}
            </div>
          </div>

          {/* Active Container Block 2: Live Content Output Response */}
          <div style={styles.responseContainer}>
            <div style={styles.containerHeaderAnswer}>
              <span>✨ Synthesized Answer Output</span>
            </div>
            <div style={styles.liveResponseBlock}>
              {currentResponse ? (
                <p style={{ margin: 0 }}>{currentResponse}</p>
              ) : (
                <span style={styles.placeholderText}>Waiting for final execution outcome...</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Fixed Sticky Prompt Action Control Bar */}
      <footer style={styles.footerSubmit}>
        <form onSubmit={handleSendPrompt} style={styles.formStructure}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a multi-step task (e.g., 'What should I wear in Tokyo today?')"
            style={styles.textInputStyle}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !prompt.trim()} 
            style={{
              ...styles.sendButtonStyle,
              backgroundColor: isLoading ? '#4b5563' : '#3b82f6'
            }}
          >
            {isLoading ? 'Processing...' : 'Run Agent'}
          </button>
        </form>
      </footer>
    </div>
  );
}

// Clean Minimal Dashboard CSS-in-JS Style Definitions
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#09090b',
    color: '#fafafa',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  header: {
    padding: '15px 25px',
    borderBottom: '1px solid #27272a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181b'
  },
  title: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#f4f4f5' },
  badge: {
    backgroundColor: '#27272a',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#a1a1aa'
  },
  workspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    padding: '20px',
    gap: '20px'
  },
  historyPanel: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: '12px',
    border: '1px solid #27272a',
    display: 'flex',
    flexDirection: 'column',
    padding: '15px'
  },
  panelTitle: { margin: '0 0 15px 0', fontSize: '14px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' },
  scrollContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    overflowY: 'auto',
    paddingRight: '5px'
  },
  emptyState: { color: '#71717a', textAlign: 'center', marginTop: '40px', fontSize: '14px' },
  chatBubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  bubbleRole: { fontSize: '11px', fontWeight: 'bold', color: '#e4e4e7', opacity: 0.8 },
  bubbleText: { fontSize: '14px', lineHeight: '1.5' },
  executionPanel: {
    flex: 1.2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  thinkingContainer: {
    flex: 1.5,
    backgroundColor: '#18181b',
    borderRadius: '12px',
    border: '1px solid #27272a',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  containerHeader: {
    padding: '10px 15px',
    backgroundColor: '#27272a',
    fontSize: '13px',
    color: '#d4d4d8',
    fontWeight: '500'
  },
  containerHeaderAnswer: {
    padding: '10px 15px',
    backgroundColor: '#1e293b',
    fontSize: '13px',
    color: '#93c5fd',
    fontWeight: '500'
  },
  liveCodeBlock: {
    padding: '15px',
    overflowY: 'auto',
    flex: 1,
    fontFamily: 'Fira Code, monospace',
    fontSize: '13px',
    color: '#a1a1aa',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },
  responseContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    border: '1px solid #1e3a8a',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  liveResponseBlock: {
    padding: '15px',
    overflowY: 'auto',
    flex: 1,
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#f8fafc'
  },
  placeholderText: { color: '#52525b', fontStyle: 'italic' },
  footerSubmit: {
    padding: '20px',
    backgroundColor: '#18181b',
    borderTop: '1px solid #27272a'
  },
  formStructure: { display: 'flex', gap: '15px', maxWidth: '1200px', margin: '0 auto' },
  textInputStyle: {
    flex: 1,
    backgroundColor: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    padding: '14px 18px',
    color: '#fafafa',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s'
  },
  sendButtonStyle: {
    padding: '0 24px',
    borderRadius: '8px',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  }
};
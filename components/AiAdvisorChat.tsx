"use client";

import React, { useState, useRef, useEffect } from 'react';
import SystemWindow from './SystemWindow';
import { useSystemMessage } from '@/contexts/SystemMessageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAdvisorChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Entity detected. I am the System Advisor. Describe your requirements or specific class needs, and I shall provide optimal item recommendations.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showMessage } = useSystemMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(1).map(m => ({ 
            role: m.role === 'assistant' ? 'model' : 'user', 
            content: m.content 
          }))
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Advisor Error:', error);
      showMessage('Sync Failure', 'Failed to communicate with the System Advisor.', 'error');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Alert: Connection to the System Intelligence has been disrupted. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic Audio Recording Logic
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        // In a full implementation, we would send this blob to a speech-to-text service
        // or directly to Gemini if using the raw native audio input capability via API.
        // For now, we notify the user that voice processing is initializing.
        showMessage('Voice Log Captured', 'Processing audio stream...', 'success');
        
        // Mocking transcription for the demonstration phase
        setInput("Recommend a laptop for a warrior class student."); 
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording Error:', err);
      showMessage('Audio Error', 'Permission denied or microphone missing.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <SystemWindow title="SYSTEM ADVISOR [GEMINI_ALPHA]">
      <div className="flex flex-col h-[500px]">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-sm border ${
                m.role === 'user' 
                ? 'bg-system-accent/10 border-system-accent/30 text-system-accent font-orbitron text-xs' 
                : 'bg-black/40 border-system-border/30 text-system-text font-rajdhani text-sm'
              }`}>
                {m.role === 'assistant' && (
                  <div className="text-[10px] font-orbitron text-system-accent mb-1 uppercase tracking-widest opacity-60">
                    Advisor Output
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-black/40 border border-system-border/30 p-3 rounded-sm animate-pulse">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-system-accent rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-system-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-system-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 pt-4 border-t border-system-border/30">
          <form onSubmit={handleSend} className="flex gap-2">
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={`p-3 rounded-sm border transition-all ${
                isRecording 
                ? 'bg-system-error/20 border-system-error text-system-error shadow-[0_0_15px_rgba(255,0,0,0.4)] scale-95' 
                : 'bg-black/40 border-system-border text-system-muted hover:text-system-accent hover:border-system-accent'
              }`}
              title="Hold to Record Voice Log"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v8a3 3 0 01-6 0V5a3 3 0 013-3z" />
              </svg>
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query the System Intelligence..."
              className="flex-1 bg-black/40 border border-system-border/50 rounded-sm px-4 py-2 text-sm font-rajdhani text-system-text focus:outline-none focus:border-system-accent focus:ring-1 focus:ring-system-accent transition-all"
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-system-accent/20 border border-system-accent text-system-accent rounded-sm hover:bg-system-accent hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </form>
          <div className="mt-2 text-[8px] font-mono text-system-muted uppercase tracking-[0.2em] flex justify-between">
            <span>Voice Protocol: {isRecording ? 'Active' : 'Standby'}</span>
            <span>Security Level: Alpha</span>
          </div>
        </div>
      </div>
    </SystemWindow>
  );
}

"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type MessageType = 'info' | 'success' | 'warning' | 'error';

interface SystemMessage {
  id: string;
  title: string;
  content: string;
  type: MessageType;
}

interface SystemMessageContextType {
  showMessage: (title: string, content: string, type?: MessageType) => void;
}

const SystemMessageContext = createContext<SystemMessageContextType | undefined>(undefined);

export function SystemMessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<SystemMessage[]>([]);

  const showMessage = useCallback((title: string, content: string, type: MessageType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessages((prev) => [...prev, { id, title, content, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, 3000);
  }, []);

  return (
    <SystemMessageContext.Provider value={{ showMessage }}>
      {children}
      {/* Messages rendering area */}
      <div className="fixed top-24 right-4 z-50 flex flex-col items-end space-y-4 pointer-events-none">
        {messages.map((msg) => {
           const colorMap = {
             info: 'border-system-accent text-system-accent shadow-system-glow',
             success: 'border-system-success text-system-success shadow-system-success',
             warning: 'border-yellow-400 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]',
             error: 'border-system-error text-system-error shadow-system-error'
           };
           
           return (
             <div 
               key={msg.id}
               className={`animate-fade-in-up bg-system-bg border backdrop-blur-md p-4 rounded-sm max-w-sm \${colorMap[msg.type]} pointer-events-auto`}
             >
               <h4 className="font-orbitron text-xs tracking-widest uppercase opacity-80 mb-1">
                 [System Message]
               </h4>
               <p className="font-orbitron font-bold text-sm tracking-wider">{msg.title}</p>
               <p className="font-rajdhani text-system-text text-sm mt-1">{msg.content}</p>
             </div>
           );
        })}
      </div>
    </SystemMessageContext.Provider>
  );
}

export function useSystemMessage() {
  const context = useContext(SystemMessageContext);
  if (context === undefined) {
    throw new Error('useSystemMessage must be used within a SystemMessageProvider');
  }
  return context;
}

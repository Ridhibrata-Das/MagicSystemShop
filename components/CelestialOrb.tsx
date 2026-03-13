import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSystemMessage } from '@/contexts/SystemMessageContext';
import { GeminiWebSocket } from '@/services/geminiWebSocket';
import { GeminiChatService } from '@/services/geminiChatService';
import { getCelestialConfig, getCelestialVariables } from '@/services/celestialContext';
import { getAllProducts } from '@/services/products';
import { Base64 } from 'js-base64';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AudioVisualizer: React.FC<{ level: number; isRecording: boolean }> = ({ level, isRecording }) => (
  <div className="w-full h-8 flex items-center justify-center gap-1">
    {[...Array(20)].map((_, i) => {
      const height = Math.min(100, Math.max(10, (level * (1 - Math.abs(i - 10) / 10))));
      return (
        <div 
          key={i}
          className={`w-1 transition-all duration-150 rounded-full ${isRecording ? 'bg-system-error' : 'bg-system-accent'}`}
          style={{ height: `${height}%`, opacity: 0.3 + (height / 150) }}
        />
      );
    })}
  </div>
);

const CelestialOrb: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<'conversation' | 'chat'>('conversation');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [suggestedItem, setSuggestedItem] = useState<{ 
    name: string; 
    id?: string; 
    discount?: number; 
    imageUrl?: string; 
    price?: number;
    rarity?: string;
  } | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [outputAudioLevel, setOutputAudioLevel] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const router = useRouter();
  const { showMessage } = useSystemMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const geminiWsRef = useRef<GeminiWebSocket | null>(null);
  const geminiChatRef = useRef<GeminiChatService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleTranscription = useCallback((text: string) => {
    console.log("[Celestial] Result:", text);
    setMessages(prev => [...prev, { role: 'assistant', content: text }]);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    geminiWsRef.current = new GeminiWebSocket(
      async (text) => {
        if (text.trim()) {
          setMessages(prev => [...prev, { role: 'assistant', content: text }]);
          
          const suggestMatch = text.match(/\[SUGGEST:(.*?)\]/);
          const offerMatch = text.match(/\[OFFER:(.*?):(\d+)%?\]/);

          if (offerMatch || suggestMatch) {
            const rawName = offerMatch ? offerMatch[1] : suggestMatch![1];
            const itemName = rawName.replace(/_/g, ' ').trim();
            const discount = offerMatch ? parseInt(offerMatch[2]) : undefined;
            
            // Fetch product metadata from registry
            const products = await getAllProducts();
            const product = products.find(p => p.title.toLowerCase().includes(itemName.toLowerCase()));
            
            setSuggestedItem({ 
              name: product?.title || itemName, 
              id: product?.id,
              discount: discount,
              imageUrl: product?.imageUrl,
              price: product?.price,
              rarity: product?.rarity
            });
          }
        }
      },
      () => {
        setIsLinked(true);
        setIsConnecting(false);
        showMessage('Link Established', 'Celestial synchronization complete.', 'success');
      },
      (isPlaying) => {
        setIsModelSpeaking(isPlaying);
      },
      (level) => {
        setOutputAudioLevel(level);
      },
      handleTranscription
    );

    geminiChatRef.current = new GeminiChatService();

    return () => {
      geminiWsRef.current?.disconnect();
      cleanupAudio();
    };
  }, [handleTranscription, showMessage, cleanupAudio]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleCelestialLink = async () => {
    if (isLinked) {
      handleDisconnect();
    } else {
      await handleJoin();
    }
  };

  const handleJoin = async () => {
    if (isLinked || isConnecting) return;
    setIsConnecting(true);
    try {
        const config = await getCelestialConfig();
        const systemInstruction = config.systemInstruction.parts[0].text;
        geminiWsRef.current?.connect(systemInstruction);
        // Audio setup will be triggered by onSetupComplete in the WebSocket effect
    } catch (err) {
        console.error("[Celestial] Failed to fetch divine context:", err);
        geminiWsRef.current?.connect(); 
    }
  };

  const handleDisconnect = () => {
    geminiWsRef.current?.disconnect();
    setIsLinked(false);
    setIsConnecting(false);
    setIsRecording(false);
    setAudioLevel(0);
    cleanupAudio();
    showMessage('Link Severed', 'Celestial link disconnected.', 'info');
  };

  // Re-map setup complete to trigger audio automatically
  useEffect(() => {
    if (isLinked && !isRecording && isOpen) {
       setupAudioProcessing().then(() => setIsRecording(true));
    }
  }, [isLinked, isOpen]); // Also check isOpen so it doesn't start in background if closed

  const setupAudioProcessing = async () => {
    try {
      if (audioContextRef.current) return;

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        }
      });
      streamRef.current = audioStream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = ctx;

      await ctx.audioWorklet.addModule('/worklets/audio-processor.js');

      audioWorkletNodeRef.current = new AudioWorkletNode(ctx, 'audio-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        processorOptions: {
          sampleRate: 16000,
          bufferSize: 4096,
        },
        channelCount: 1,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers'
      });

      const source = ctx.createMediaStreamSource(audioStream);
      audioWorkletNodeRef.current.port.onmessage = (event) => {
        if (isModelSpeaking) return;
        const { pcmData, level } = event.data;
        setAudioLevel(level);

        const pcmArray = new Uint8Array(pcmData);
        const b64Data = Base64.fromUint8Array(pcmArray);
        geminiWsRef.current?.sendMediaChunk(b64Data, "audio/pcm");
      };

      source.connect(audioWorkletNodeRef.current);
    } catch (error) {
      console.error("[Celestial] Audio setup failure:", error);
      showMessage('Oscillation Failure', 'Failed to access audio frequency.', 'error');
      handleDisconnect(); // Fail safe
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMessage = text.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    if (mode === 'chat' && geminiChatRef.current) {
        setIsTyping(true);
        try {
            const response = await geminiChatRef.current.generateResponse(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            
            // Check for suggestions or offers in chat
            const suggestMatch = response.match(/\[SUGGEST:(.*?)\]/);
            const offerMatch = response.match(/\[OFFER:(.*?):(\d+)%?\]/);

            if (offerMatch || suggestMatch) {
              const rawName = offerMatch ? offerMatch[1] : suggestMatch![1];
              const itemName = rawName.replace(/_/g, ' ').trim();
              const discount = offerMatch ? parseInt(offerMatch[2]) : undefined;
              
              // Fetch product metadata from registry
              const products = await getAllProducts();
              const product = products.find(p => p.title.toLowerCase().includes(itemName.toLowerCase()));
              
              setSuggestedItem({ 
                name: product?.title || itemName, 
                id: product?.id,
                discount: discount,
                imageUrl: product?.imageUrl,
                price: product?.price,
                rarity: product?.rarity
              });
            }
        } catch (err) {
            console.error("[Celestial Chat] Failure:", err);
            showMessage('Transmission Error', 'Failed to reach the celestial chat frequency.', 'error');
        } finally {
            setIsTyping(false);
        }
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto relative w-32 h-32 rounded-full transition-all duration-700 hover:scale-110 flex items-center justify-center group ${isOpen ? 'scale-75 opacity-50' : 'scale-100'}`}
      >
        <div className={`absolute -inset-2 rounded-full border-2 transition-all duration-1000 ${isLinked ? 'border-system-accent opacity-20 animate-ping' : (isConnecting ? 'border-yellow-500 opacity-40 animate-pulse' : 'border-system-error opacity-40')}`}></div>
        <div className={`absolute inset-0 rounded-full blur-[30px] opacity-30 animate-pulse transition-all ${isLinked ? 'bg-system-accent' : (isConnecting ? 'bg-yellow-500' : 'bg-system-error')} group-hover:blur-[50px] group-hover:opacity-60`}></div>
        <div className="absolute inset-3 bg-gradient-to-br from-system-accent to-blue-900 rounded-full border border-white/20 shadow-system-glow group-hover:shadow-[0_0_40px_rgba(0,240,255,0.8)]"></div>
        <div className="absolute inset-0 w-full h-full border-2 border-system-accent/30 rounded-full animate-spin-slow pointer-events-none"></div>
        <div className="z-10 text-white font-orbitron text-[10px] font-black tracking-widest drop-shadow-md">CELESTIAL_CORE</div>
      </button>

      {isOpen && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 w-[450px] pointer-events-auto animate-fade-in-up">
          <div className="bg-system-bg border border-system-accent/50 rounded-sm shadow-system-glow overflow-hidden relative backdrop-blur-xl">
            <div className="bg-black/60 border-b border-system-accent/30 px-6 py-4 flex justify-between items-center">
              <div className="flex gap-4">
                <button 
                  onClick={() => setMode('conversation')}
                  className={`text-[10px] font-orbitron font-bold tracking-[0.2em] transition-all uppercase ${mode === 'conversation' ? 'text-system-accent border-b-2 border-system-accent' : 'text-system-muted hover:text-white'}`}
                >
                  Conversation
                </button>
                <button 
                  onClick={() => setMode('chat')}
                  className={`text-[10px] font-orbitron font-bold tracking-[0.2em] transition-all uppercase ${mode === 'chat' ? 'text-system-accent border-b-2 border-system-accent' : 'text-system-muted hover:text-white'}`}
                >
                  Chat Log
                </button>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-system-muted hover:text-system-error transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 h-[400px] flex flex-col relative overflow-hidden">
              {mode === 'chat' ? (
                <>
                  <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 pb-4">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-sm text-xs font-rajdhani whitespace-pre-wrap ${m.role === 'user' ? 'bg-system-accent/20 border border-system-accent/30 text-system-accent' : 'bg-black/40 border border-white/5 text-system-text'}`}>
                          {m.content.replace(/\[(SUGGEST|OFFER):.*?\]/g, '').split(/(\*\*.*?\*\*)/).map((part, index) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={index} className="text-system-accent font-black">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-black/40 border border-white/5 p-3 rounded-sm">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-system-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-1.5 h-1.5 bg-system-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 bg-system-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="mt-4 flex gap-2 pt-4 border-t border-white/5">
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend(input)}
                      placeholder="Transmit query..."
                      className="flex-1 bg-black/60 border border-system-accent/20 rounded-sm px-4 text-xs font-orbitron text-white focus:outline-none focus:border-system-accent transition-all"
                    />
                    <button 
                      disabled={!input.trim() || isTyping}
                      onClick={() => handleSend(input)}
                      className="p-3 bg-system-accent/20 border border-system-accent/50 text-system-accent rounded-sm hover:bg-system-accent hover:text-black transition-all disabled:opacity-20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                  <div className="w-48 h-12 flex flex-col items-center justify-center gap-2">
                    <AudioVisualizer level={isModelSpeaking ? outputAudioLevel : audioLevel} isRecording={isRecording} />
                  </div>
                  <div className="space-y-4">
                    <div className="text-lg font-orbitron font-black text-system-accent tracking-widest uppercase">
                      {isRecording ? 'CONTINUOUS_LINK_ACTIVE' : (isModelSpeaking ? 'MANIFESTING_AUDIO' : (isLinked ? 'LINK_ESTABLISHED' : (isConnecting ? 'SYNCHRONIZING...' : 'CORE_IDLE')))}
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      {isLinked ? (
                        <p className="text-xs text-system-muted font-rajdhani italic animate-pulse">
                          {isModelSpeaking ? 'Extracting registry links...' : 'Listening to your astral frequency...'}
                        </p>
                      ) : (
                        <p className="text-xs text-system-muted font-rajdhani italic px-8">
                          Press the core below to initiate a bidirectional link for persistent conversation.
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={toggleCelestialLink}
                    disabled={isConnecting}
                    className={`w-32 h-32 rounded-full border-2 transition-all duration-500 flex flex-col items-center justify-center gap-2 group ${isLinked ? 'bg-system-accent/20 border-system-accent shadow-[0_0_50px_rgba(0,240,255,0.4)]' : 'bg-black/40 border-system-accent/30 hover:bg-system-accent/10 hover:border-system-accent/60'}`}
                  >
                    <div className={`p-4 rounded-full transition-all ${isLinked ? 'bg-system-accent text-black animate-pulse' : 'text-system-accent group-hover:scale-110'}`}>
                      {isLinked ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-[10px] font-orbitron font-black tracking-widest text-system-accent">
                      {isLinked ? 'SEVER_LINK' : (isConnecting ? 'LINKING...' : 'INITIATE')}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Universal Manifestation Panel (Premium Side-Card) */}
          {suggestedItem && (
            <div className="absolute top-0 -right-[340px] w-[320px] h-full pointer-events-auto animate-card-manifest z-[110]">
              <div className="h-full bg-black/80 backdrop-blur-2xl border-2 border-system-accent/40 rounded-sm shadow-[0_0_80px_rgba(0,240,255,0.4)] overflow-hidden flex flex-col relative">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-system-accent to-transparent opacity-60"></div>
                
                {/* Visual Section */}
                <div className="relative w-full aspect-[4/3] bg-black group overflow-hidden">
                    {suggestedItem.imageUrl ? (
                       <Image 
                          src={suggestedItem.imageUrl} 
                          alt={suggestedItem.name} 
                          fill 
                          className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-[2000ms]" 
                        />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-system-accent/30 font-orbitron">
                          <svg className="w-12 h-12 opacity-20 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] tracking-widest uppercase italic">Resolving_Visual...</span>
                       </div>
                    )}
                    
                    {/* Rarity & Status Overlays */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className={`px-3 py-1 text-[10px] font-orbitron font-black uppercase tracking-[0.2em] border backdrop-blur-md ${
                          suggestedItem.rarity?.toLowerCase() === 'mythical' ? 'bg-red-500/20 border-red-500 text-red-500' :
                          suggestedItem.rarity?.toLowerCase() === 'legendary' ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
                          suggestedItem.rarity?.toLowerCase() === 'epic' ? 'bg-purple-500/20 border-purple-500 text-purple-500' :
                          'bg-system-accent/20 border-system-accent text-system-accent'
                        }`}>
                            {suggestedItem.rarity || 'Common'}
                        </div>
                    </div>

                    {suggestedItem.discount && (
                        <div className="absolute top-4 right-4 bg-system-error px-3 py-1 border border-white/20 shadow-lg rotate-3 animate-pulse">
                            <span className="text-white font-orbitron font-black text-sm tracking-widest">{suggestedItem.discount}%_OFF</span>
                        </div>
                    )}
                    
                    {/* Scanning Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-system-accent/50 shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-scan-slow pointer-events-none"></div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/60">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-system-accent text-[9px] font-orbitron tracking-[0.4em] uppercase font-black opacity-60">Celestial_Item_ID</span>
                            <h2 className="text-2xl font-orbitron font-black text-white tracking-widest leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                {suggestedItem.name.replace(/_/g, ' ')}
                            </h2>
                        </div>

                        {suggestedItem.price && (
                            <div className="space-y-1">
                                <span className="text-system-muted text-[8px] font-orbitron tracking-widest uppercase">Exchange_Value</span>
                                <div className="flex items-baseline gap-3">
                                    {suggestedItem.discount ? (
                                        <>
                                            <span className="text-white font-orbitron text-2xl font-black">
                                                {(suggestedItem.price * (1 - suggestedItem.discount / 100)).toFixed(0)} <span className="text-xs text-system-accent opacity-60">G</span>
                                            </span>
                                            <span className="text-system-muted line-through text-xs font-rajdhani italic">{suggestedItem.price} G</span>
                                        </>
                                    ) : (
                                        <span className="text-white font-orbitron text-2xl font-black">
                                            {suggestedItem.price} <span className="text-xs text-system-accent opacity-60">G</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 mt-8">
                        <button 
                            onClick={() => {
                                const targetId = suggestedItem.id || encodeURIComponent(suggestedItem.name);
                                const url = `/product/${targetId}${suggestedItem.discount ? `?off=${suggestedItem.discount}` : ''}`;
                                router.push(url);
                                setSuggestedItem(null);
                            }}
                            className="w-full py-4 bg-system-accent text-black font-orbitron font-black text-xs tracking-[0.3em] uppercase hover:bg-white transition-all transform hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,240,255,0.6)] flex items-center justify-center gap-3 active:scale-95"
                        >
                            {suggestedItem.discount ? 'Acquire_Offer' : 'Manifest_Details'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => setSuggestedItem(null)}
                            className="w-full py-2 bg-transparent border border-white/10 text-[9px] font-orbitron text-system-muted hover:text-white hover:border-white/30 tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-2"
                        >
                            Close_Manifestation
                        </button>
                    </div>
                </div>

                {/* Cyber Corner Decorations */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-system-accent"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-system-accent"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CelestialOrb;

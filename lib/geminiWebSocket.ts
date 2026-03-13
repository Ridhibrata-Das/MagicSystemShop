import { pcmToWav } from '@/utils/audio';
import { getCelestialVariables, refreshCelestialContext } from '@/services/celestialContext';
import { celestialAnalysisService, type AnalysisResult } from '@/services/celestialAnalysis';

const MODEL = "models/gemini-2.0-flash-exp"; // Using reliable model for WebSocket
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const HOST = "generativelanguage.googleapis.com";
const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

export class GeminiWebSocket {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private isSetupComplete: boolean = false;
  private onMessageCallback: ((text: string) => void) | null = null;
  private onSetupCompleteCallback: (() => void) | null = null;
  private audioContext: AudioContext | null = null;

  // Audio queue management
  private audioQueue: Float32Array[] = [];
  private isPlaying: boolean = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlayingResponse: boolean = false;
  private onPlayingStateChange: ((isPlaying: boolean) => void) | null = null;
  private onAudioLevelChange: ((level: number) => void) | null = null;
  private onTranscriptionCallback: ((text: string) => void) | null = null;
  private onSuggestedItemCallback: ((item: { name: string; id?: string }) => void) | null = null;
  
  private accumulatedPcmData: string[] = [];
  private lastUserQuery: string = '';
  private lastAgentResponse: string = '';

  constructor(
    onMessage: (text: string) => void,
    onSetupComplete: () => void,
    onPlayingStateChange: (isPlaying: boolean) => void,
    onAudioLevelChange: (level: number) => void,
    onTranscription: (text: string) => void,
    onSuggestedItem?: (item: { name: string; id?: string }) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onSetupCompleteCallback = onSetupComplete;
    this.onPlayingStateChange = onPlayingStateChange;
    this.onAudioLevelChange = onAudioLevelChange;
    this.onTranscriptionCallback = onTranscription;
    this.onSuggestedItemCallback = onSuggestedItem || null;
    
    // Initialize AudioContext only when needed on user interaction to avoid browser warnings
  }

  private initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[Celestial-WS] Already connected');
      return;
    }

    this.initAudio();

    if (!API_KEY) {
      console.error('[Celestial-WS] No Gemini API key manifested!');
      return;
    }

    console.log('[Celestial-WS] Establishing orbital link...');
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('[Celestial-WS] Orbital link established');
      this.isConnected = true;
      this.sendInitialSetup();
    };

    this.ws.onmessage = async (event) => {
      try {
        let messageText: string;
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          messageText = new TextDecoder('utf-8').decode(bytes);
        } else {
          messageText = event.data;
        }

        await this.handleMessage(messageText);
      } catch (error) {
        console.error("[Celestial-WS] Error processing transmission:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("[Celestial-WS] Link error:", error);
    };

    this.ws.onclose = () => {
      console.log('[Celestial-WS] Orbital link severed');
      this.isConnected = false;
      this.isSetupComplete = false;
    };
  }

  private async sendInitialSetup() {
    await refreshCelestialContext();
    const vars = getCelestialVariables();

    const setupMessage = {
      setup: {
        model: MODEL,
        generation_config: {
          response_modalities: ["AUDIO"]
        },
        system_instruction: {
          parts: [
            {
              text: `You are the CELESTIAL AI ORB, a mystical advisor for the MagicSystem Shop. 
              Your tone is ethereal, wise, and helpful. Speak with authority and confidence.
              You must advise users based on the magical registries provided.
              ALWAYS speak in the same language as the user.
              Do not speak more than 30 words at a time. 
              Add slight vocalizations like 'ahh' or 'hmmm' to sound more natural and thoughtful.
              If you recommend a specific product from the context, you MUST include the exact format [SUGGEST:item_name] in your response.
              
              CURRENT_REGISTRIES: ${vars.magicalRegistries}`
            }
          ]
        }
      }
    };

    this.ws?.send(JSON.stringify(setupMessage));
  }

  sendAudioChunk(b64Data: string) {
    if (!this.isConnected || !this.ws || !this.isSetupComplete) return;

    const message = {
      realtime_input: {
        media_chunks: [{
          mime_type: "audio/pcm;rate=24000",
          data: b64Data
        }]
      }
    };

    this.ws.send(JSON.stringify(message));
  }

  sendTextMessage(text: string) {
    if (!this.isConnected || !this.ws || !this.isSetupComplete) return;

    const message = {
      client_content: {
        turns: [{
            role: "user",
            parts: [{ text }]
        }],
        turn_complete: true
      }
    };

    this.ws.send(JSON.stringify(message));
    this.lastUserQuery = text;
  }

  private async playAudioResponse(base64Data: string) {
    if (!this.audioContext) return;

    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcmData = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }

      this.audioQueue.push(float32Data);
      this.playNextInQueue();
    } catch (error) {
      console.error("[Celestial-WS] Audio processing error:", error);
    }
  }

  private async playNextInQueue() {
    if (!this.audioContext || this.isPlaying || this.audioQueue.length === 0) return;

    try {
      this.isPlaying = true;
      this.isPlayingResponse = true;
      this.onPlayingStateChange?.(true);
      const float32Data = this.audioQueue.shift()!;

      // Calculate level for visualizer
      let sum = 0;
      for (let i = 0; i < float32Data.length; i++) {
        sum += Math.abs(float32Data[i]);
      }
      const level = Math.min((sum / float32Data.length) * 100 * 8, 100);
      this.onAudioLevelChange?.(level);

      const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);

      const source = this.currentSource;
      source.onended = () => {
        if (this.currentSource === source) {
            this.isPlaying = false;
            this.currentSource = null;
            if (this.audioQueue.length === 0) {
              this.isPlayingResponse = false;
              this.onPlayingStateChange?.(false);
              this.onAudioLevelChange?.(0);
            }
            this.playNextInQueue();
        }
      };

      source.start();
    } catch (error) {
      console.error("[Celestial-WS] Audio playback error:", error);
      this.isPlaying = false;
      this.isPlayingResponse = false;
      this.onPlayingStateChange?.(false);
      this.currentSource = null;
      this.playNextInQueue();
    }
  }

  private async handleMessage(message: string) {
    try {
      const messageData = JSON.parse(message);

      if (messageData.setupComplete) {
        this.isSetupComplete = true;
        this.onSetupCompleteCallback?.();
        return;
      }

      if (messageData.serverContent?.modelTurn?.parts) {
        const parts = messageData.serverContent.modelTurn.parts;
        for (const part of parts) {
          if (part.inlineData?.mimeType === "audio/pcm;rate=24000") {
            this.accumulatedPcmData.push(part.inlineData.data);
            this.playAudioResponse(part.inlineData.data);
          }

          if (part.text) {
            this.lastAgentResponse += part.text;
            this.onMessageCallback?.(part.text);
          }
        }
      }

      if (messageData.serverContent?.turnComplete === true) {
        // Run analysis for potential suggestions
        const analysis = await celestialAnalysisService.analyzeConversation(this.lastUserQuery, this.lastAgentResponse);
        if (analysis.suggested_item) {
            this.onSuggestedItemCallback?.(analysis.suggested_item);
        }
        
        this.accumulatedPcmData = [];
        this.lastAgentResponse = '';
      }
    } catch (error) {
      console.error("[Celestial-WS] Parsing error:", error);
    }
  }

  disconnect() {
    this.isSetupComplete = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.currentSource) {
        this.currentSource.stop();
        this.currentSource = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }
}

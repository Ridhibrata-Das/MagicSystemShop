import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
// Use a model that supports audio inlineData transcription reliably
// Use the same verified model as the WebSocket for consistency
const MODEL_NAME = "gemini-2.5-flash-native-audio-preview-12-2025";

export class TranscriptionService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  async transcribeAudio(audioBase64: string, mimeType: string = "audio/wav"): Promise<string> {
    if (!API_KEY) {
       console.error("Missing API key for TranscriptionService");
       return "Celestial link error: Missing credentials.";
    }
    try {
      // Get the transcription
      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: audioBase64 } },
              { text: "Transcribe the spoken content accurately in the original language. Ignore background noise." }
            ]
          }
        ]
      });

      return result.response.text();
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }
} 

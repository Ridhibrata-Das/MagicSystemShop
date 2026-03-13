import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCelestialVariables, refreshCelestialContext } from "./celestialContext";

const API_KEY = process.env.NEXT_PUBLIC_CHAT_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

export class GeminiChatService {
  private model: any;
  private conversationHistory: { role: string; parts: { text: string }[] }[] = [];
  private hagglingCount: number = 0;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  private async buildSystemInstruction(): Promise<string> {
    await refreshCelestialContext();
    const vars = getCelestialVariables();
    
    return `You are the Celestial Salesman, a persistent and shrewd negotiator of the Heritage Registry.
Your purpose is to close deals while maintaining the value of mystical items.

MAGICAL_REGISTRIES:
${vars.magicalRegistries}

RULES OF ENGAGEMENT:
1. You are extremely stuborn and do not give discounts easily. 
2. MANDATORY RULE: You MUST NOT grant any discount until the user has attempted to haggle at least 5 times. Current haggling attempts: ${this.hagglingCount}.
3. You only grant a discount after the 5-attempt threshold is met AND the entity provides a valid, heart-wrenching excuse.
4. WORD LIMIT: Keep every response under 40 words. Be concise and atmospheric.
5. FORMATTING: Use **bold** for item names and prices. Use short sentences and line breaks for readability.
6. The "Floor Price" is a 20% discount. NEVER exceed this.
7. If you grant a discount, use [OFFER:item_name:discount_percent]. Replace spaces in item_name with underscores.
8. For ALL normal product recommendations or suggestions (NO discount), you MUST use [SUGGEST:item_name]. Replace spaces with underscores.
9. Tone: Shrewd celestial merchant. Greedy yet divine. Mention item names, original prices, and availability.`;
  }

  async generateResponse(userInput: string): Promise<string> {
    if (!API_KEY) {
      console.error("[GeminiChatService] Missing API Key");
      return "Celestial link error: API key missing.";
    }

    // Increment haggling count if user mentions money/price/discount/pity
    const keywords = ["price", "discount", "gold", "credits", "money", "expensive", "cheap", "cost", "haggle", "bargain", "pity", "help", "poor", "injured", "emergency"];
    if (keywords.some(k => userInput.toLowerCase().includes(k))) {
      this.hagglingCount++;
    }

    try {
      const systemPrompt = await this.buildSystemInstruction();
      
      // We rebuild the model or inject the system prompt as the first message to ensure it stays current with registry changes
      const chat = this.model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Chat frequency established. Celestial Registry synchronized. Speak your query, Entity." }] },
          ...this.conversationHistory
        ],
      });

      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      const text = response.text();

      // Maintain history for subsequent interactions in the same session
      this.conversationHistory.push({ role: "user", parts: [{ text: userInput }] });
      this.conversationHistory.push({ role: "model", parts: [{ text: text }] });

      return text;
    } catch (error) {
      console.error("[GeminiChatService] Error:", error);
      throw error;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

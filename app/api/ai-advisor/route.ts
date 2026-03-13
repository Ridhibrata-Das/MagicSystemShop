import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getAllProducts } from "@/services/products";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch Product Catalog from Firestore
    const products = await getAllProducts();
    
    // 2. Format Restricted Product Context for Gemini
    const productContext = products.map(p => {
      return `Item: ${p.title} | Price: ${p.price} G | Stock: ${p.stock <= 0 ? 'NOT AVAILABLE' : p.stock}`;
    }).join('\n');

    // 3. Initialize Model (User specific: gemini-2.5-flash-native-audio-preview-12-2025)
    const modelStr = "gemini-2.5-flash-native-audio-preview-12-2025"; 
    const model = genAI.getGenerativeModel({ model: modelStr });

    // 4. Construct System Prompt
    const systemPrompt = `You are the Celestial System Advisor, a high-level intelligence entity.
Your purpose is to assist users in acquiring items from the Heritage Registry.

CONSTRAINTS:
1. You can ONLY recommend items from the provided registry list below.
2. Registry data contains only Item Name, Price, and Stock Status. Use this for all decisions.
3. If an item is NOT AVAILABLE, do not suggest it.
4. Maintain a serious, mystical, and authoritative celestial tone.
5. If you recommend an item, MUST wrap its ID/Title in a special tag for detection, e.g., [SUGGEST:item_name].

REGISTRY DATA:
${productContext}

Begin the transmission.`;

    console.log("DEBUG: Starting Celestial Chat...");
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Celestial Intelligence initialized. Registry link established. Speak your requirements, Entity." }] },
        ...(history || []).map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        }))
      ],
    });

    console.log("DEBUG: Processing query:", message);
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
    console.log("DEBUG: AI Success.");

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Advisor ERROR CRITICAL:", error.message);
    if (error.response) console.error("Gemini Response Error:", error.response);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}

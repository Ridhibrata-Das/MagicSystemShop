import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_VISION_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AestheticAnalysis {
  style: string;
  colors: string[];
  materials: string[];
  keywords: string[];
}

export const analyzeAesthetic = async (base64Image: string): Promise<AestheticAnalysis | null> => {
    if (!API_KEY) {
        console.error("Vision API Key missing. Ensure NEXT_PUBLIC_VISION_GEMINI_API_KEY is set.");
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Remove data:image/xxx;base64, prefix if present
        const b64Data = base64Image.includes('base64,') 
            ? base64Image.split('base64,')[1] 
            : base64Image;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: b64Data,
                    mimeType: "image/jpeg" // Assuming jpeg, model handles most common formats
                }
            },
            {
                text: `
                    Analyze the uploaded image and extract its core aesthetic features.
                    Identify the dominant style, color palette, materials used, and general design vibe.
                    Return ONLY a valid JSON object with the following structure:
                    {
                        "style": "Brief style name (e.g., Minimalist, Steampunk, Gothic)",
                        "colors": ["list", "of", "dominant", "color", "names"],
                        "materials": ["wood", "metal", "stone", "etc"],
                        "keywords": ["vibe", "theme", "aesthetic", "descriptors"]
                    }
                    Be precise and ensure the response contains nothing but the JSON object.
                `
            }
        ]);

        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response (handling potential markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (pErr) {
                console.error("JSON Parse Error in Vision Service:", pErr, text);
                return null;
            }
        }
        
        return null;
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return null;
    }
};

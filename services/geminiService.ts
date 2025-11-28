import { GoogleGenAI } from "@google/genai";
import { BlockType } from "../types";

// Initialize Gemini Client
// CRITICAL: process.env.API_KEY is guaranteed to be available in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBlockContent = async (
  prompt: string,
  targetType: BlockType,
  context?: string
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    let systemInstruction = "You are a helpful assistant for a documentation editor.";
    
    if (targetType === BlockType.CODE) {
      systemInstruction += " You are an expert frontend engineer. Generate valid HTML/CSS/JS code that can run directly in an iframe. Do not use markdown backticks. Just return the raw code.";
    } else {
      systemInstruction += " You are a professional technical writer. Keep it concise and engaging.";
    }

    const response = await ai.models.generateContent({
      model,
      contents: `Context: ${context || 'None'}\n\nTask: ${prompt}`,
      config: {
        systemInstruction,
      }
    });

    const text = response.text || "";
    
    // Cleanup basic markdown code fences if Gemini adds them despite instructions
    if (targetType === BlockType.CODE) {
      return text.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '').trim();
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};
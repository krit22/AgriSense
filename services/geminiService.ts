import { GoogleGenAI } from "@google/genai";
import { AgentResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generic identification (for random objects)
export const identifyObject = async (base64Image: string): Promise<string> => {
  try {
    const base64Data = base64Image.split(',')[1];
    if (!base64Data) throw new Error("Invalid base64 image data");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: 'Identify the single most prominent object in this image. Return only the object name (e.g. "Water Bottle"). Keep it concise (1-3 words).' }
        ]
      }
    });

    return response.text ? response.text.trim() : "Unknown Object";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "";
  }
};

// Agentic Agronomist Logic
export const analyzeCropHealth = async (base64Image: string, detectionClass: string): Promise<AgentResponse> => {
  try {
    const base64Data = base64Image.split(',')[1];
    
    let prompt = "";
    
    if (detectionClass.toLowerCase().includes('healthy')) {
       prompt = `You are a friendly AI Agronomist. This tomato leaf looks healthy. 
       Return a JSON object with:
       - diagnosis: "Healthy Crop"
       - advice: A short, happy sentence praising the farmer's care.
       - remedies: [] (empty array)
       - productMatch: "N/A"
       `;
    } else {
       // Pre-symptomatic or Symptomatic
       prompt = `You are an expert AI Agronomist. This tomato leaf has been flagged as "${detectionClass}" (likely Tomato Blight).
       Analyze the visual severity.
       Return a JSON object with:
       - diagnosis: A clear, human-readable medical name for the issue.
       - advice: A 1-2 sentence spoken-style advice for the farmer on what to do immediately.
       - remedies: An array of 2 objects (one organic, one chemical) with fields: "name" (e.g. Neem Oil), "type" (organic/chemical), "action" (e.g. Spray every 7 days).
       - productMatch: A generic name of a product they should buy (e.g. "Copper Fungicide").
       
       Ensure the tone is helpful and calm, not alarming.
       `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AgentResponse;

  } catch (error) {
    console.error("Agronomist Error:", error);
    // Fallback response if API fails
    return {
      diagnosis: detectionClass,
      advice: "I'm having trouble connecting to the lab, but please inspect this plant manually.",
      remedies: [],
      productMatch: "Consult Local Expert"
    };
  }
};

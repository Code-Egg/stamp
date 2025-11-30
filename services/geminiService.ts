import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateBehavior = async (behavior: string, childName: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The child, ${childName}, did the following behavior: "${behavior}". 
      
      Your task:
      1. Determine if this is a positive behavior that deserves a reward stamp (true/false).
      2. Write a short, enthusiastic, child-friendly compliment (max 15 words).
      3. Select a single fun emoji related to the behavior or celebration.
      
      If the behavior is negative or harmful, set approved to false and give a gentle encouragement to try again.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            approved: { type: Type.BOOLEAN },
            praise: { type: Type.STRING },
            emoji: { type: Type.STRING },
          },
          required: ["approved", "praise", "emoji"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText) as AIResponse;
  } catch (error) {
    console.error("Error evaluating behavior:", error);
    // Fallback if AI fails
    return {
      approved: true,
      praise: "Great job! Keep it up!",
      emoji: "🌟",
    };
  }
};
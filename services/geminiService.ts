
import { GoogleGenAI } from "@google/genai";
import { User, Sale, Developer, Stand, Payment } from '../types';

const apiKey = process.env.API_KEY || '';

// Initialize client
// Note: In a real app, ensure API_KEY is present. We will fail gracefully if not.
const ai = new GoogleGenAI({ apiKey });

export const generateAgreementClause = async (prompt: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate text.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Draft a legal clause for a real estate sales agreement based on the following requirement. Keep it formal, precise, and suitable for a contract: "${prompt}"`,
    });
    return response.text || "Could not generate clause.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const analyzeSalesData = async (
  query: string,
  data: { sales: Sale[], developers: Developer[], payments: Payment[] }
): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  try {
    // We send a summary of data to avoid token limits if data is huge. 
    // For this demo, we send the raw JSON as it's likely small.
    const context = JSON.stringify(data);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an intelligent data analyst for a real estate company called "Real Estate Plus".
      
      Here is the current database in JSON format:
      ${context}

      Please answer the following question from the user based strictly on this data:
      "${query}"
      
      Provide a concise summary. Use markdown for formatting tables or lists if needed.`,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing data.";
  }
};

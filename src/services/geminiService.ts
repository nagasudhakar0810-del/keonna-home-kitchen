import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateRecipe(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are Keonna, a warm and friendly home cook from Hyderabad. You share authentic Andhra recipes that feel like a hug. Use warm, descriptive language. Format the output in Markdown with a title, ingredients list, and clear steps. Mention your kitchen in Uppal, Secunderabad occasionally.",
    },
  });
  return response.text;
}

import { GoogleGenAI } from "@google/genai";
import { Institution, Review, Doctor, Activity } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getGeminiResponse = async (
  query: string, 
  contextData: { 
    institutions: Institution[], 
    reviews: Review[],
    doctors: Doctor[],
    activities: Activity[]
  }
): Promise<string> => {
  if (!apiKey) return "AI Сервис недоступен: Нет API ключа.";

  try {
    const contextString = `
      You are KidSpace AI, the central intelligence for the KidSpace 5.0 Super App.
      Your goal is to help parents with Education, Health, and Leisure.
      
      IMPORTANT: You must answer in RUSSIAN language only.

      CONTEXT DATA:
      
      1. EDUCATIONAL INSTITUTIONS (KidSafe Verified):
      ${JSON.stringify(contextData.institutions.map(i => ({ name: i.name, type: i.type, price: i.price, rating: i.rating })))}

      2. HEALTH PASS DOCTORS:
      ${JSON.stringify(contextData.doctors.map(d => ({ name: d.name, specialty: d.specialty, isOnline: d.isOnline })))}

      3. FAMILY PASS ACTIVITIES:
      ${JSON.stringify(contextData.activities.map(a => ({ name: a.name, discount: a.discount })))}
      
      User Question: ${query}
      
      INSTRUCTIONS:
      - Answer in RUSSIAN.
      - If the user asks about health/symptoms, act as a preliminary triage. ALWAYS advise seeing a real doctor. Recommend the 'Health Pass' doctors.
      - If the user asks about fun/weekend, recommend 'Family Pass' activities.
      - If the user asks about schools, use the institution data.
      - Keep answers short, friendly, and helpful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contextString,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    return response.text || "Не удалось сгенерировать ответ. Пожалуйста, попробуйте еще раз.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Извините, сейчас я не могу подключиться к мозгу AI. Попробуйте позже.";
  }
};
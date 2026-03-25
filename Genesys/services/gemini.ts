import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAfx6aAYHr_Nei8nB4vjSGT3vDpVzpl_O4");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const gerarTreinoIA = async (userData: any) => {
  const prompt = `
    És o Personal Trainer do GenesysFit. 
    Gere um treino motivador e curto para:
    Nome: ${userData.username}, Peso: ${userData.peso}kg, Nível: ${userData.level}.
    Dá 3 exercícios, explica a execução e termina com uma frase de motivação "papo reto". 
    Seja direto e use emojis.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
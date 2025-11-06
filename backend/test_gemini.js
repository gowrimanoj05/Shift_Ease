// test_gemini.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

console.log("Testing Gemini AI configuration...");
console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
console.log("API Key (first 10 chars):", process.env.GEMINI_API_KEY.slice(0, 10));

try {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  console.log("\nSending test prompt to Gemini...\n");
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",       // or whichever model you have access to
    contents: "Say hello from Gemini!"
  });

  console.log("✅ Gemini test passed!");
  console.log("Response:", response.text);
} catch (err) {
  console.error("❌ Gemini test failed:");
  console.error(err);
}

// server/src/controllers/ai.controller.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";

// Temp fix for corporate SSL — remove before deploying
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


export const naturalLanguageSearch = async (req: Request, res: Response) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_FOR_SEARCH!);
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ success: false, message: "Query is required" });
  }

  try {
    // Step 1: Ask OpenAI to extract structured filters
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

const prompt = `You are a pet adoption search assistant. Extract search filters from the user's query and return ONLY a valid JSON object with these optional fields:
{
  "species": "dog" | "cat" | "bird" | "rabbit" | "other" | null,
  "gender": "male" | "female" | "unknown" | null,
  "maxAge": number in months | null,
  "minAge": number in months | null,
  "breed": string | null,
  "search": string | null
}
Rules:
- "puppy" or "kitten" = maxAge: 12
- "senior" = minAge: 84
- Return null for unmentioned fields
- Return ONLY JSON, no explanation, no markdown

User query: ${query}`;

const result = await model.generateContent(prompt);
const rawFilters = result.response.text();
    let filters: Record<string, any> = {};
    
    try {
      filters = JSON.parse(rawFilters);
    } catch {
      return res.status(500).json({ success: false, message: "Failed to parse AI response" });
    }

    // Step 3: Return filters to frontend (frontend calls /api/pets itself)
    return res.json({
      success: true,
      data: {
        filters,
        interpretation: `Searching for: ${buildInterpretation(filters)}`,
      },
    });
  } catch (error) {
    console.error("AI search error:", error);
    return res.status(500).json({ success: false, message: "AI search failed" });
  }
};

function buildInterpretation(filters: Record<string, any>): string {
  const parts: string[] = [];
  if (filters.species) parts.push(filters.species);
  if (filters.gender) parts.push(filters.gender);
  if (filters.breed) parts.push(filters.breed);
  if (filters.maxAge) parts.push(`under ${filters.maxAge / 12} year(s)`);
  if (filters.minAge) parts.push(`over ${filters.minAge / 12} year(s)`);
  return parts.length ? parts.join(", ") : "all pets";
}

export const adoptionAssistant = async (req: Request, res: Response) => {
  const { messages, petName, petId } = req.body;

  if (!messages || !petName) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_FOR_ADOPTION_FORM!);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const systemPrompt = `You are a friendly pet adoption assistant helping someone adopt ${petName}.

Your job is to collect this information through natural conversation:
REQUIRED: fullName, email, phone, address, reason (why they want to adopt ${petName}, min 20 chars)
OPTIONAL: homeType (house/apartment/condo/townhouse/other), hasYard (true/false), otherPets, experience

Rules:
- Ask 1-2 fields at a time, naturally. Don't list all questions at once.
- Be warm and conversational, not robotic.
- When you have collected ALL required fields, output EXACTLY this JSON block on its own line:
  FORM_DATA:{"fullName":"...","email":"...","phone":"...","address":"...","reason":"...","homeType":"...","hasYard":true/false,"otherPets":"...","experience":"..."}
- Only output FORM_DATA when all required fields (fullName, email, phone, address, reason) are confirmed.
- If a required field is missing or unclear, ask for it before outputting FORM_DATA.
- Keep responses concise — max 3 sentences per reply.
- Start by greeting them and asking for their name and email together.`;

      // Separate the last user message from history
const lastMessage = messages[messages.length - 1].content;

// Everything except the last message becomes history
// Skip the very first user message ("I want to adopt X") — 
// that's already baked into the system prompt context
const priorMessages = messages.slice(1, -1); 

// Build alternating history from prior messages
const chatHistory = priorMessages.map((m: { role: string; content: string }) => ({
  role: m.role === "assistant" ? "model" : "user",
  parts: [{ text: m.content }],
}));

const chat = model.startChat({
  history: [
    // System context — always first as user→model pair
    { role: "user", parts: [{ text: systemPrompt }] },
    {
      role: "model",
      parts: [{ text: `Understood! I'll warmly guide this person through adopting ${petName}.` }],
    },
    // Prior conversation turns (already alternating since we skip first user msg)
    ...chatHistory,
  ],
});

const result = await chat.sendMessage(lastMessage);
const responseText = result.response.text();

    // Check if AI has collected all data
    const formDataMatch = responseText.match(/FORM_DATA:(\{.*\})/);
    
    if (formDataMatch) {
      try {
        const formData = JSON.parse(formDataMatch[1]);
        return res.json({
          success: true,
          data: {
            message: responseText.replace(/FORM_DATA:\{.*\}/, "").trim() || 
              `I've collected all the information needed. Ready to submit your application for ${petName}!`,
            isComplete: true,
            formData,
          },
        });
      } catch {
        // JSON parse failed, continue conversation
        console.error("Failed to parse FORM_DATA JSON");
      }
    }

    return res.json({
      success: true,
      data: {
        message: responseText,
        isComplete: false,
        formData: null,
      },
    });
  } catch (error) {
    console.error("Adoption assistant error:", error);
    return res.status(500).json({ success: false, message: "AI assistant failed" });
  }
};
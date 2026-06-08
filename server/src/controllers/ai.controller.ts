// server/src/controllers/ai.controller.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";

// Temp fix for corporate SSL — remove before deploying
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const naturalLanguageSearch = async (req: Request, res: Response) => {
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
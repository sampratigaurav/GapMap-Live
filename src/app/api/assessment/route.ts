import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { skill } = await req.json();

        if (!skill) {
            return NextResponse.json(
                { error: "Skill is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are a senior technical interviewer. 
      Generate a 3-question multiple-choice technical assessment for the skill: ${skill}. 
      The questions should test practical, intermediate-level knowledge. 
      Return ONLY a valid JSON array of objects with this exact structure: 
      [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..."}]. 
      Do not use markdown code blocks like \`\`\`json in the output.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present (just in case)
        const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch (e) {
            console.error("Failed to parse AI assessment response:", text);
            return NextResponse.json(
                { error: "Failed to parse assessment results" },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("Assessment Generation Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

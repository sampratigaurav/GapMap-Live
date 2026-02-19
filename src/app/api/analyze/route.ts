
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { currentSkills, targetRole } = await req.json();

        if (!currentSkills || !targetRole) {
            return NextResponse.json(
                { error: "Missing skills or target role" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set");
            // For development/demo purposes without a key, we might want to return a mock response
            // or error out. Given the strict instructions, I'll error out but with a helpful message log.
            return NextResponse.json(
                { error: "Server configuration error: API Key missing" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Act as an expert technical career coach.
      Analyze the gap between a candidate's current skills and their target role.
      
      Current Skills: ${currentSkills}
      Target Role: ${targetRole}
      
      Output a strict JSON response with the following structure:
      {
        "matchPercentage": number (0-100),
        "missingSkills": string[] (array of critical missing skills),
        "actionableRoadmap": [{ "stepName": string, "description": string }] (array of 3-5 concrete steps)
      }
      Do not include any markdown formatting or extra text, just the JSON string.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch (e) {
            console.error("Failed to parse AI response:", text);
            return NextResponse.json(
                { error: "Failed to parse analysis results" },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

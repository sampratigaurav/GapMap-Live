
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { currentSkills, targetRole, resumeContent, resumeType, linkedinUrl, githubUrl } = await req.json();

        if (!currentSkills || !targetRole) {
            return NextResponse.json(
                { error: "Missing skills or target role" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set");
            return NextResponse.json(
                { error: "Server configuration error: API Key missing" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = `
      Act as an elite technical recruiter.
      Analyze the candidate's fit for the [${targetRole}] role.
      
      Claimed Skills: ${currentSkills}
      Professional Profiles:
      - LinkedIn: ${linkedinUrl || "Not provided"}
      - GitHub: ${githubUrl || "Not provided"}

      ${resumeContent ? `RESUME CONTENT (Base64 Encoded): [Attached]` : "No resume provided."}

      Task: Determine the candidate's actual skill level by cross-referencing these sources.
      
      Output a strict JSON response with the following structure:
      {
        "matchPercentage": number (0-100),
        "missingSkills": string[] (array of critical missing skills),
        "actionableRoadmap": [
          {
            "stepName": string,
            "description": string,
            "estimated_time": string (e.g. "1-2 Weeks"),
            "resources": [
              { "title": string, "type": "Video" | "Article" | "Course", "url": string }
            ]
          }
        ]
      }

      CRITICAL INSTRUCTIONS FOR RESOURCES:
      1. Provide 2 highly relevant, FREE resources per step.
      2. For Videos: Use a generic YouTube search URL: "https://www.youtube.com/results?search_query=React+Hooks+Crash+Course". DO NOT hallucinate specific video IDs.
      3. For Articles: Use official documentation URLs (react.dev, developer.mozilla.org) where possible.

      Do not include any markdown formatting or extra text, just the JSON string.
    `;

        const parts: any[] = [{ text: prompt }];

        if (resumeContent) {
            parts.push({
                inlineData: {
                    mimeType: resumeType || "application/pdf",
                    data: resumeContent
                }
            });
        }

        const result = await model.generateContent(parts);
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

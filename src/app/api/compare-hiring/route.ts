import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

// Initialize Gemini with Flash 1.5 for speed and lower cost/token usage
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
    try {
        const { jobTitle, jobDescription } = await req.json();

        // 1. Fetch Data (Same as before, but we'll slice strictly in memory)
        const { data: internalCandidates } = await supabase.from('employees').select('*');
        const { data: externalCandidates } = await supabase.from('roadmaps').select('*').order('match_percentage', { ascending: false }).limit(10);

        // 2. AGGRESSIVE TOKEN OPTIMIZATION
        // Only take the top 2 of each to save context window and prevent 429s
        const slimInternal = (internalCandidates || [])
            .slice(0, 2)
            .map((e: any) => ({
                id: e.id,
                name: e.full_name,
                role: e.designation,
                skills: e.skills
            }));

        const slimExternal = (externalCandidates || [])
            .slice(0, 2)
            .map((c: any) => ({
                id: c.id,
                role: c.target_role,
                skills: c.current_skills
            }));

        // 3. Minimalist AI Prompt
        const prompt = `
        Act as an HR analyst. Compare these 2 internal employees against the 2 external candidates for the role of "${jobTitle}".
        
        Job Desc: ${jobDescription.substring(0, 200)}... (truncated)

        Internal: ${JSON.stringify(slimInternal)}
        External: ${JSON.stringify(slimExternal)}

        Return ONLY a JSON object with this exact structure:
        {
            "recommendation": "Internal Upskill" | "External Hire",
            "match_score": number,
            "best_internal_candidate": { "name": string, "id": any, "reason": string } | null,
            "best_external_candidate": { "id": any, "reason": string } | null,
            "financial_analysis": { "hiring_cost": number, "upskilling_cost": number, "savings": number },
            "strategy_summary": "One sentence summary."
        }
        Do not use markdown backticks.
        `;

        // 4. Generate & Parse
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Robust JSON Extraction
        const startIndex = text.indexOf('{') !== -1 && text.indexOf('[') !== -1
            ? Math.min(text.indexOf('{'), text.indexOf('['))
            : Math.max(text.indexOf('{'), text.indexOf('['));
        const endIndex = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));

        if (startIndex === -1 || endIndex === -1) {
            throw new Error("No JSON object found in response");
        }

        const cleanText = text.substring(startIndex, endIndex + 1);

        try {
            const analysis = JSON.parse(cleanText);
            return NextResponse.json(analysis);
        } catch (parseError) {
            console.error("JSON Parse Failed. Raw Text:", text);
            return NextResponse.json({ error: "AI response was not valid JSON. Please try again." }, { status: 500 });
        }

    } catch (error: any) {
        console.error("🔥 BACKEND AI ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

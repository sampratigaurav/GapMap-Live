"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, Calculator, CheckCircle, DollarSign, TrendingUp, Users, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AnalysisResult {
    recommendation: "Internal Upskill" | "External Hire";
    match_score: number;
    best_internal_candidate: {
        name: string;
        id: any;
        reason: string;
        skill_gap?: string; // AI might provide this
        time_to_readiness?: string; // AI might provide this
    } | null;
    best_external_candidate: {
        id: any;
        reason: string;
        target_role?: string;
    } | null;
    financial_analysis: {
        hiring_cost: number;
        upskilling_cost: number;
        savings: number;
    };
    strategy_summary: string;
}

export default function FeasibilityPage() {
    const router = useRouter();
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/compare-hiring", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobTitle, jobDescription }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Analysis failed");
            }

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white px-4 py-8 md:px-8 pt-24">
            <div className="mx-auto max-w-5xl space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Calculator className="h-8 w-8 text-indigo-500" />
                        Hiring Feasibility Engine
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Compare the ROI of upskilling your internal talent vs. recruiting from the external market.
                        Our AI analyzes skill gaps, ramp-up time, and financial impact.
                    </p>
                </div>

                {/* Input Form */}
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-1 space-y-6">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">New Position Details</h2>
                            <form onSubmit={handleAnalyze} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Job Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g. Senior React Developer"
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Job Description / Key Skills</label>
                                    <textarea
                                        required
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        rows={6}
                                        placeholder="Paste the JD here..."
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-indigo-600 py-3 font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Analyzing Market...
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="h-4 w-4" />
                                            Run Feasibility Analysis
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="md:col-span-2 space-y-6">
                        {error && (
                            <div className="rounded-xl border border-red-500/50 bg-red-900/20 p-4 text-red-200 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Analysis Failed</p>
                                    <p className="text-sm opacity-90">{error}</p>
                                </div>
                            </div>
                        )}

                        {!result && !loading && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-800 rounded-2xl">
                                <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                    <Briefcase className="h-8 w-8 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Ready to Analyze</h3>
                                <p className="text-slate-400 max-w-sm">
                                    Enter a job title and description to see our AI-driven recommendation on Hiring vs. Upskilling.
                                </p>
                            </div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Financial Verdict Banner */}
                                <div className={cn(
                                    "rounded-2xl p-6 border flex items-center justify-between",
                                    result.recommendation === "Internal Upskill"
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                                        : "bg-blue-500/10 border-blue-500/30 text-blue-100"
                                )}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {result.recommendation === "Internal Upskill" ? (
                                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                                <Users className="h-5 w-5 text-blue-400" />
                                            )}
                                            <h3 className="text-lg font-bold">Recommended Strategy: {result.recommendation}</h3>
                                        </div>
                                        <p className="opacity-90">{result.strategy_summary}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm uppercase tracking-wider opacity-70 font-semibold mb-1">Estimated Savings</p>
                                        <p className="text-3xl font-bold flex items-center justify-end">
                                            <DollarSign className="h-6 w-6" />
                                            {result.financial_analysis.savings.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Comparison Cards */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Internal Candidate Card */}
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white">Internal Best Fit</h4>
                                                <p className="text-xs text-slate-400">From Employee Database</p>
                                            </div>
                                        </div>

                                        {result.best_internal_candidate ? (
                                            <div className="space-y-4 flex-1">
                                                <div>
                                                    <p className="text-xl font-bold text-white">{result.best_internal_candidate.name}</p>
                                                    <p className="text-sm text-indigo-400 font-medium">Match Confidence: {result.match_score > 60 ? "High" : "Moderate"}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300">
                                                    <p className="font-medium text-white mb-1">Why them?</p>
                                                    {result.best_internal_candidate.reason}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                                    <div className="p-2 bg-slate-800 rounded-lg">
                                                        <span className="block text-slate-400 mb-0.5">Upskill Cost</span>
                                                        <span className="font-bold text-white">${result.financial_analysis.upskilling_cost.toLocaleString()}</span>
                                                    </div>
                                                    <div className="p-2 bg-slate-800 rounded-lg">
                                                        <span className="block text-slate-400 mb-0.5">Time to Readiness</span>
                                                        <span className="font-bold text-white">~1 Month</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
                                                No suitable internal candidates found.
                                            </div>
                                        )}
                                    </div>

                                    {/* External Market Card */}
                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                                <Briefcase className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white">External Market</h4>
                                                <p className="text-xs text-slate-400">From GapMap Talent Pool</p>
                                            </div>
                                        </div>

                                        {result.best_external_candidate ? (
                                            <div className="space-y-4 flex-1">
                                                <div>
                                                    <p className="text-xl font-bold text-white">Top Candidate Found</p>
                                                    <p className="text-sm text-emerald-400 font-medium">GapMap Verified</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300">
                                                    <p className="font-medium text-white mb-1">Market Insight</p>
                                                    {result.best_external_candidate.reason}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                                    <div className="p-2 bg-slate-800 rounded-lg">
                                                        <span className="block text-slate-400 mb-0.5">Hiring Cost</span>
                                                        <span className="font-bold text-white">${result.financial_analysis.hiring_cost.toLocaleString()}</span>
                                                    </div>
                                                    <div className="p-2 bg-slate-800 rounded-lg">
                                                        <span className="block text-slate-400 mb-0.5"> onboarding Time</span>
                                                        <span className="font-bold text-white">~2.5 Months</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
                                                No matching external candidates found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

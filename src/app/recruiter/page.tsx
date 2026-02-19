"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Award, CheckCircle, Briefcase, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Roadmap {
    id: number;
    user_id: string;
    target_role: string;
    current_skills: string;
    match_percentage: number;
    missing_skills: string[];
    verified_skills?: string[];
    created_at: string;
}

export default function RecruiterPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("Cyber Security");
    const [candidates, setCandidates] = useState<Roadmap[]>([]);
    const [loading, setLoading] = useState(false);
    const [requestedCandidates, setRequestedCandidates] = useState<number[]>([]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else if (user.user_metadata?.role !== 'Enterprise') {
                router.push("/dashboard");
            } else {
                fetchCandidates("Cyber Security"); // Initial fetch
            }
        };
        checkUser();
    }, [router]);

    const fetchCandidates = async (query: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('roadmaps')
            .select('*')
            .ilike('target_role', `%${query}%`)
            .order('match_percentage', { ascending: false });

        if (error) {
            console.error("Error fetching candidates:", error);
        } else {
            setCandidates(data || []);
        }
        setLoading(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCandidates(searchQuery);
    };

    const handleRequest = (id: number) => {
        if (requestedCandidates.includes(id)) return;

        // Simulate Request
        setRequestedCandidates(prev => [...prev, id]);
        alert("Introduction requested! Our team will verify this match and connect you.");
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white px-4 py-8 md:px-8">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Header & Search */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Talent Discovery Engine
                    </h1>
                    <p className="text-slate-400">
                        Find verified candidates actively upskilling for your open roles.
                    </p>

                    <form onSubmit={handleSearch} className="relative max-w-2xl flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by target role (e.g. Security Analyst)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-white shadow-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-500"
                        >
                            Find Talent
                        </button>
                    </form>
                </div>

                {/* Candidates List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"></div>
                            <p className="mt-4 text-slate-400">Scanning talent database...</p>
                        </div>
                    ) : candidates.length > 0 ? (
                        candidates.map((candidate) => (
                            <motion.div
                                key={candidate.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5"
                            >
                                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                                    {/* Candidate Info */}
                                    <div className="flex gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">Anonymous Candidate</h3>
                                                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">
                                                    {candidate.match_percentage}% Match
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Briefcase className="h-4 w-4" />
                                                <span>Targeting: {candidate.target_role}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <MapPin className="h-4 w-4" />
                                                <span>Remote / Hybrid</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills & Action */}
                                    <div className="flex flex-col gap-4 md:items-end">
                                        <div className="flex flex-wrap gap-2 md:justify-end">
                                            {candidate.current_skills.split(',').slice(0, 4).map((skill, i) => {
                                                const skillName = skill.trim();
                                                const isVerified = candidate.verified_skills?.includes(skillName);

                                                return (
                                                    <span
                                                        key={i}
                                                        className={cn(
                                                            "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border",
                                                            isVerified
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                : "bg-slate-800 text-slate-300 border-slate-700"
                                                        )}
                                                    >
                                                        {skillName}
                                                        {isVerified && <CheckCircle className="h-3 w-3" />}
                                                    </span>
                                                );
                                            })}
                                            {candidate.current_skills.split(',').length > 4 && (
                                                <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                                                    +{candidate.current_skills.split(',').length - 4} more
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleRequest(candidate.id)}
                                            disabled={requestedCandidates.includes(candidate.id)}
                                            className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {requestedCandidates.includes(candidate.id) ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4" />
                                                    Request Sent
                                                </>
                                            ) : (
                                                <>
                                                    Request Introduction
                                                    <ChevronRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-800">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50 mb-4">
                                <Search className="h-6 w-6 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white">No candidates found</h3>
                            <p className="text-slate-400">Try adjusting your search terms.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

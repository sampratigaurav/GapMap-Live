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

                {/* Results Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {candidates.map((candidate, index) => (
                        <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white">Anonymous Candidate</h3>
                                                <p className="text-xs text-slate-500">ID: #{candidate.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-bold",
                                        candidate.match_percentage >= 75 ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"
                                    )}>
                                        {candidate.match_percentage >= 75 ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                                        <span>{candidate.match_percentage}% Match</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center text-sm text-indigo-400 font-medium mt-1">
                                        <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                                        {candidate.target_role}
                                    </div>
                                </div>

                                {/* Skills Mapping */}
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Current Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.current_skills.split(',').slice(0, 5).map((skill, i) => (
                                            <span
                                                key={i}
                                                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                        {candidate.current_skills.split(',').length > 5 && (
                                            <span className="rounded-md px-2 py-1 text-xs font-medium text-slate-500">
                                                +{candidate.current_skills.split(',').length - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="mt-6 pt-4 border-t border-slate-800">
                                <button
                                    onClick={() => handleRequest(candidate.id)}
                                    disabled={requestedCandidates.includes(candidate.id)}
                                    className={cn(
                                        "flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-all",
                                        requestedCandidates.includes(candidate.id)
                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                                    )}
                                >
                                    {requestedCandidates.includes(candidate.id) ? (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Request Sent
                                        </>
                                    ) : (
                                        <>
                                            Request Introduction <ChevronRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {candidates.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                            <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No candidates found for "{searchQuery}".</p>
                            <p className="text-sm">Try searching for a different role or skill.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
                            <p>Searching database...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

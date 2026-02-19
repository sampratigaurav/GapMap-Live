"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { BadgeCheck, BrainCircuit, ExternalLink, MapPin, Share2, Shield, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PublicProfile {
    target_role: string;
    verified_skills: string[];
}

export default function PublicPortfolioPage() {
    const params = useParams();
    const userId = params.id as string;
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('roadmaps')
                .select('target_role, verified_skills')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                setProfile({
                    target_role: data[0].target_role,
                    verified_skills: data[0].verified_skills || []
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
                <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <User className="h-8 w-8 text-slate-500" />
                </div>
                <h1 className="text-xl font-bold text-white mb-2">Profile Not Found</h1>
                <p className="text-slate-400 mb-6">This user hasn't created a public portfolio yet.</p>
                <Link
                    href="/"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                >
                    Go Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header / Banner */}
            <div className="relative h-48 bg-gradient-to-r from-indigo-900/50 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
            </div>

            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-32 w-32 rounded-full ring-4 ring-slate-950 bg-slate-800 flex items-center justify-center shadow-2xl"
                    >
                        <User className="h-16 w-16 text-slate-400" />
                    </motion.div>

                    <div className="flex-1 space-y-2 pb-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">Verified Candidate</h1>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                                <BadgeCheck className="h-3 w-3" />
                                Vetted
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
                            <div className="flex items-center gap-1">
                                <BrainCircuit className="h-4 w-4" />
                                <span>Targeting: <span className="text-white font-medium">{profile.target_role}</span></span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>Open to Remote</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pb-2">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-950 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                        >
                            Hire on GapMap
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <BadgeCheck className="h-5 w-5 text-emerald-500" />
                                Verified Skill Stack
                            </h2>

                            {profile.verified_skills.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {profile.verified_skills.map((skill, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20 flex items-center justify-between group hover:border-emerald-500/40 transition-all"
                                        >
                                            <span className="font-medium text-slate-200">{skill}</span>
                                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <BadgeCheck className="h-4 w-4" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
                                    <p className="text-slate-500">No verified skills yet.</p>
                                </div>
                            )}
                        </section>

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                            <h3 className="font-semibold text-white mb-4">About GapMap Verification</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Skills on this profile have been verified through rigorous AI-generated technical assessments.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-indigo-400">
                                <Shield className="h-4 w-4" />
                                <span>Anti-cheat protected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        getUser();
    }, [router]);

    const copyProfileLink = () => {
        if (!user) return;
        const link = `${window.location.origin}/p/${user.id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white px-4 py-8 md:px-8 pt-24 flex items-center justify-center">
            <div className="w-full max-w-2xl space-y-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Your Profile</h1>
                    <p className="text-slate-400">Manage your account and public presence.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl"
                >
                    <div className="flex flex-col items-center space-y-6">
                        <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700">
                            <User className="h-12 w-12 text-slate-400" />
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-indigo-400" />
                                    <div>
                                        <p className="text-sm text-slate-400">Email Address</p>
                                        <p className="font-medium text-white">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center space-x-3">
                                    <Shield className="h-5 w-5 text-emerald-400" />
                                    <div>
                                        <p className="text-sm text-slate-400">Account Type</p>
                                        <p className="font-medium text-white capitalize">{user?.user_metadata?.role || "User"}</p>
                                    </div>
                                </div>
                            </div>

                            {user?.user_metadata?.role === 'Candidate' && (
                                <div className="pt-6 border-t border-slate-800">
                                    <h3 className="text-lg font-medium text-white mb-4">Public Portfolio</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Share your verified skills with recruiters or on social media.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                readOnly
                                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/p/${user.id}`}
                                                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-4 pr-10 text-sm text-slate-300 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={copyProfileLink}
                                            className="flex items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-all"
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            <span>{copied ? "Copied!" : "Copy Link"}</span>
                                        </button>
                                        <Link
                                            href={`/p/${user.id}`}
                                            target="_blank"
                                            className="flex items-center justify-center space-x-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-all"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            <span>View</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

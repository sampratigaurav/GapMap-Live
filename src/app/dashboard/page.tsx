"use client";

import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, ChevronRight, BarChart3, Clock, AlertCircle, AlertTriangle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface RoadmapStep {
    stepName: string;
    description: string;
}

interface AnalysisResult {
    matchPercentage: number;
    missingSkills: string[];
    actionableRoadmap: RoadmapStep[];
}

interface Roadmap {
    id: number;
    user_id: string;
    target_role: string;
    current_skills: string;
    match_percentage: number;
    missing_skills: string[] | string; // Handle potential JSON string
    actionable_steps: RoadmapStep[] | string; // Handle potential JSON string
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);

    const [currentSkills, setCurrentSkills] = useState("");
    const [targetRole, setTargetRole] = useState("Cyber Security Analyst");
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // Context State
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };
    // Effect to check user authentication on component mount
    const fetchRoadmaps = async (userId: string) => {
        const { data, error } = await supabase
            .from('roadmaps')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching roadmaps:", error);
        } else {
            setRoadmaps(data || []);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            console.log("DASHBOARD AUTH CHECK: Full User Object", user);
            console.log("DASHBOARD AUTH CHECK: User Role", user?.user_metadata?.role);

            if (!user) {
                router.replace("/login");
                return;
            }

            // High Priority Check: If Enterprise, kick them out immediately
            // We use '==' to be safe, but checks strictly for the string 'Enterprise'
            if (user.user_metadata?.role === 'Enterprise') {
                console.log("🚨 ENTERPRISE USER DETECTED IN DASHBOARD -> REDIRECTING TO RECRUITER");
                router.replace("/recruiter");
                return; // Crucial: Do NOT setIsAuthChecking(false)
            }

            // If we are here, we are a Candidate (or generic user)
            setUser(user);
            fetchRoadmaps(user.id);
            setIsAuthChecking(false); // Only now allow UI to render
        };
        checkUser();
    }, [router]);

    if (isAuthChecking) {
        return null; // Render nothing while checking role to prevent ghosting
    }



    const analyzeSkills = async () => {
        if (!currentSkills || !targetRole || !user) return;
        setLoading(true);
        setAnalysisResult(null);

        try {
            let resumeContent = null;
            let resumeType = null;
            if (resumeFile) {
                resumeType = resumeFile.type;
                const reader = new FileReader();
                resumeContent = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target?.result?.toString().split(',')[1]); // Get base64 content
                    reader.readAsDataURL(resumeFile);
                });
            }

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentSkills,
                    targetRole,
                    resumeContent,
                    resumeType,
                    linkedinUrl,
                    githubUrl
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAnalysisResult(data);

                // Save to Supabase
                const { error } = await supabase.from('roadmaps').insert({
                    user_id: user.id,
                    target_role: targetRole,
                    current_skills: currentSkills,
                    match_percentage: data.matchPercentage,
                    missing_skills: data.missingSkills,
                    actionable_steps: data.actionableRoadmap,
                    linkedin_url: linkedinUrl,
                    github_url: githubUrl
                });

                if (error) {
                    console.error("Error saving roadmap:", error);
                } else {
                    fetchRoadmaps(user.id);
                }

            } else {
                console.error("Analysis failed:", data.error);
                alert("Analysis failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pt-24">
            <div className="mx-auto max-w-7xl space-y-12">

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                        Candidate Dashboard
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Your personalized gap analysis and upskilling roadmaps. Track your progress and bridge the gap to your dream role.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Section 1: Gap Analysis Input */}
                    <section className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="h-5 w-5 text-indigo-400" />
                            <h2 className="text-xl font-semibold text-white">AI Skill Gap Analysis</h2>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Target Role</label>
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* Profile Context */}
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Profile Context</h3>

                                {/* Resume Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Resume / CV (PDF or Image)</label>
                                    <div className="relative flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className={cn(
                                            "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                            resumeFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700 bg-slate-900 hover:bg-slate-800"
                                        )}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {resumeFile ? (
                                                    <>
                                                        <CheckCircle className="w-8 h-8 mb-2 text-emerald-500" />
                                                        <p className="text-sm text-emerald-400 font-medium">{resumeFile.name}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                                        <p className="text-sm text-slate-400">Click to upload resume</p>
                                                    </>
                                                )}
                                            </div>
                                            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
                                        </label>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">LinkedIn URL</label>
                                        <input
                                            type="text"
                                            value={linkedinUrl}
                                            onChange={(e) => setLinkedinUrl(e.target.value)}
                                            placeholder="linkedin.com/in/..."
                                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">GitHub URL</label>
                                        <input
                                            type="text"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            placeholder="github.com/..."
                                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Current Skills</label>
                                <textarea
                                    value={currentSkills}
                                    onChange={(e) => setCurrentSkills(e.target.value)}
                                    placeholder="e.g. Python, C++, HTML, JavaScript, Git..."
                                    rows={4}
                                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
                                />
                            </div>

                            <button
                                onClick={analyzeSkills}
                                disabled={loading || !currentSkills || !user}
                                className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-3 font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                                        Analyzing...
                                    </span>
                                ) : (
                                    <>
                                        Generate Analysis <BarChart3 className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Analysis Result Card */}
                    <section className="space-y-6">
                        {analysisResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6 shadow-2xl shadow-indigo-500/10"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                    <h3 className="text-lg font-semibold text-white">Analysis Report</h3>
                                    <div className={cn(
                                        "flex items-center px-3 py-1 rounded-full text-sm font-bold",
                                        analysisResult.matchPercentage >= 70 ? "bg-emerald-500/10 text-emerald-500" :
                                            analysisResult.matchPercentage >= 40 ? "bg-yellow-500/10 text-yellow-500" :
                                                "bg-red-500/10 text-red-500"
                                    )}>
                                        {analysisResult.matchPercentage}% Match
                                    </div>
                                </div>

                                {/* Missing Skills */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Missing Critical Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.missingSkills.map((skill, idx) => (
                                            <span key={idx} className="flex items-center rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-sm text-red-400">
                                                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                                                {skill}
                                            </span>
                                        ))}
                                        {analysisResult.missingSkills.length === 0 && (
                                            <span className="text-sm text-emerald-400 flex items-center">
                                                <CheckCircle className="mr-2 h-4 w-4" /> No critical gaps found!
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Roadmap */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Recommended Roadmap</h4>
                                    <div className="relative space-y-4 pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                                        {analysisResult.actionableRoadmap.map((step, idx) => (
                                            <div key={idx} className="relative">
                                                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                                                <h5 className="font-semibold text-white">{step.stepName}</h5>
                                                <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {!analysisResult && !loading && (
                            <div className="h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 p-12 text-center text-slate-500">
                                <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
                                <p>Fill out the form to generate your<br />personalized gap analysis.</p>
                            </div>
                        )}
                        {!analysisResult && loading && (
                            <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
                                <p className="text-slate-400 animate-pulse">Consulting AI Career Coach...</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Section 2: Active Roadmaps */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-emerald-400" />
                        <h2 className="text-xl font-semibold text-white">Active Roadmaps</h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {roadmaps.map((map) => (
                            <motion.div
                                key={map.id}
                                whileHover={{ y: -5 }}
                                className="group rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                            {map.target_role}
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-1">Skills: {map.current_skills}</p>
                                    </div>
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                                        map.match_percentage >= 70 ? "bg-emerald-500/10 text-emerald-500" :
                                            map.match_percentage >= 40 ? "bg-yellow-500/10 text-yellow-500" :
                                                "bg-red-500/10 text-red-500"
                                    )}>
                                        {map.match_percentage}%
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Match</span>
                                        <span className="text-white font-medium">{map.match_percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                map.match_percentage >= 70 ? "bg-emerald-500" :
                                                    map.match_percentage >= 40 ? "bg-yellow-500" :
                                                        "bg-red-500"
                                            )}
                                            style={{ width: `${map.match_percentage}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedRoadmap(map)}
                                    className="flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:text-white"
                                >
                                    View Roadmap <ChevronRight className="ml-2 h-4 w-4" />
                                </button>
                            </motion.div>
                        ))}

                        {roadmaps.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-500">
                                No active roadmaps found. Generate your first analysis above!
                            </div>
                        )}
                    </div>
                </section>
            </div>


            {/* Roadmap Viewer Modal */}
            {
                selectedRoadmap && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-500/10"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedRoadmap.target_role}</h2>
                                    <p className="text-sm text-slate-400">Roadmap Details</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRoadmap(null)}
                                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Match Score */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 font-medium">Current Match Score</span>
                                        <span className={cn(
                                            "font-bold",
                                            selectedRoadmap.match_percentage >= 70 ? "text-emerald-400" :
                                                selectedRoadmap.match_percentage >= 40 ? "text-yellow-400" : "text-red-400"
                                        )}>{selectedRoadmap.match_percentage}%</span>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                selectedRoadmap.match_percentage >= 70 ? "bg-emerald-500" :
                                                    selectedRoadmap.match_percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${selectedRoadmap.match_percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Missing Skills */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Skill Gaps Identified</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            try {
                                                const skills = typeof selectedRoadmap.missing_skills === 'string'
                                                    ? JSON.parse(selectedRoadmap.missing_skills)
                                                    : selectedRoadmap.missing_skills;

                                                if (!Array.isArray(skills) || skills.length === 0) {
                                                    return (
                                                        <span className="text-sm text-emerald-400 flex items-center">
                                                            <CheckCircle className="mr-2 h-4 w-4" /> No critical gaps found!
                                                        </span>
                                                    );
                                                }

                                                return skills.map((skill: string, idx: number) => (
                                                    <span key={idx} className="flex items-center rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-sm text-red-400">
                                                        <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                                                        {skill}
                                                    </span>
                                                ));
                                            } catch (e) {
                                                return <span className="text-sm text-red-500">Error parsing skills data.</span>;
                                            }
                                        })()}
                                    </div>
                                </div>

                                {/* Actionable Steps */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Your Action Plan</h3>
                                    <div className="relative space-y-6 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                                        {(() => {
                                            try {
                                                const steps = typeof selectedRoadmap.actionable_steps === 'string'
                                                    ? JSON.parse(selectedRoadmap.actionable_steps)
                                                    : selectedRoadmap.actionable_steps;

                                                return Array.isArray(steps) && steps.map((step: any, idx: number) => (
                                                    <div key={idx} className="relative group">
                                                        <div className="absolute -left-[25px] top-1.5 h-4 w-4 rounded-full bg-slate-900 border-2 border-indigo-500 group-hover:bg-indigo-500 transition-colors" />
                                                        <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                                            {step.stepName || step.step}
                                                        </h4>
                                                        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                                            {step.description || step.desc}
                                                        </p>
                                                    </div>
                                                ));
                                            } catch (e) {
                                                return <span className="text-sm text-red-500">Error parsing roadmap steps.</span>;
                                            }
                                        })()}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800 flex justify-end">
                                    <button
                                        onClick={() => setSelectedRoadmap(null)}
                                        className="px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors font-medium"
                                    >
                                        Close Roadmap
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, BrainCircuit, ChevronRight, Lock, PlayCircle, X, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface AssessmentState {
    skill: string;
    questions: Question[];
    currentIndex: number;
    score: number;
    completed: boolean;
}

export default function VerifyPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [claimedSkills, setClaimedSkills] = useState<string[]>([]);
    const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [roadmapId, setRoadmapId] = useState<number | null>(null);

    // Assessment State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingAssessment, setLoadingAssessment] = useState<string | null>(null);
    const [assessment, setAssessment] = useState<AssessmentState | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            if (user.user_metadata?.role === 'Enterprise') {
                router.push("/recruiter");
                return;
            }
            setUser(user);
            fetchClaimedSkills(user.id);
        };
        checkUser();
    }, [router]);

    const fetchClaimedSkills = async (userId: string) => {
        const { data, error } = await supabase
            .from('roadmaps')
            .select('id, current_skills, verified_skills')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (data && data.length > 0) {
            const latestRoadmap = data[0];
            setRoadmapId(latestRoadmap.id);
            const skills = latestRoadmap.current_skills.split(',').map((s: string) => s.trim());
            setClaimedSkills(skills);
            setVerifiedSkills(latestRoadmap.verified_skills || []);
        }
        setLoading(false);
    };

    const startAssessment = async (skill: string) => {
        setLoadingAssessment(skill);
        try {
            const response = await fetch("/api/assessment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skill }),
            });
            const questions = await response.json();

            if (questions && Array.isArray(questions)) {
                setAssessment({
                    skill,
                    questions,
                    currentIndex: 0,
                    score: 0,
                    completed: false
                });
                setIsModalOpen(true);
            } else {
                alert("Failed to load assessment. Please try again.");
            }
        } catch (error) {
            console.error("Error starting assessment:", error);
            alert("Error starting assessment.");
        } finally {
            setLoadingAssessment(null);
        }
    };

    const handleAnswer = (option: string) => {
        setSelectedOption(option);
    };

    const nextQuestion = () => {
        if (!assessment || !selectedOption) return;

        const isCorrect = selectedOption === assessment.questions[assessment.currentIndex].correctAnswer;
        const newScore = isCorrect ? assessment.score + 1 : assessment.score;
        const nextIndex = assessment.currentIndex + 1;

        if (nextIndex < assessment.questions.length) {
            setAssessment({
                ...assessment,
                score: newScore,
                currentIndex: nextIndex
            });
            setSelectedOption(null);
        } else {
            completeAssessment(newScore);
        }
    };

    const completeAssessment = async (finalScore: number) => {
        if (!assessment) return;

        const passed = finalScore === assessment.questions.length;
        setAssessment({
            ...assessment,
            score: finalScore,
            completed: true
        });

        if (passed) {
            const newVerifiedSkills = [...verifiedSkills, assessment.skill];
            setVerifiedSkills(newVerifiedSkills);

            if (roadmapId) {
                const { error } = await supabase
                    .from('roadmaps')
                    .update({ verified_skills: newVerifiedSkills })
                    .eq('id', roadmapId);

                if (error) {
                    console.error("Error updating verified skills:", error);
                }
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setAssessment(null);
        setSelectedOption(null);
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white px-4 py-8 md:px-8 pt-24">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <BrainCircuit className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Skill Verification Center
                            </h1>
                            <p className="text-slate-400">
                                Prove your expertise. Verified skills rank you higher in enterprise recruiter searches.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Skills Grid */}
                {claimedSkills.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {claimedSkills.map((skill, index) => {
                            const isVerified = verifiedSkills.includes(skill);
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "group relative flex flex-col justify-between rounded-xl border p-6 shadow-xl transition-all hover:shadow-2xl",
                                        isVerified
                                            ? "border-emerald-500/20 bg-slate-900 hover:border-emerald-500/40"
                                            : "border-slate-800 bg-slate-900 hover:border-indigo-500/40"
                                    )}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{skill}</h3>
                                            </div>
                                            {isVerified ? (
                                                <div className="flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
                                                    <BadgeCheck className="h-4 w-4" />
                                                    <span>Verified</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                                                    <Lock className="h-3 w-3" />
                                                    <span>Unverified</span>
                                                </div>
                                            )}
                                        </div>

                                        {isVerified ? (
                                            <div className="flex items-center text-emerald-400 text-sm font-medium">
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Skill Verified
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-slate-500 text-sm">
                                                <AlertCircle className="mr-2 h-4 w-4" />
                                                Pending Verification
                                            </div>
                                        )}
                                    </div>

                                    {/* Action */}
                                    <div className="mt-6 pt-4 border-t border-slate-800">
                                        {isVerified ? (
                                            <button className="flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-300 cursor-default opacity-75">
                                                Assessment Passed
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startAssessment(skill)}
                                                disabled={loadingAssessment === skill}
                                                className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-70"
                                            >
                                                {loadingAssessment === skill ? (
                                                    <span className="flex items-center">
                                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                                                        Loading...
                                                    </span>
                                                ) : (
                                                    <>
                                                        Start Assessment <PlayCircle className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                        <p className="text-slate-500">No skills found. <br /> Run a gap analysis in the Dashboard first.</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>

            {/* Assessment Modal */}
            <AnimatePresence>
                {isModalOpen && assessment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
                        >
                            {!assessment.completed ? (
                                <>
                                    <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {assessment.skill} Assessment
                                            </h2>
                                            <p className="text-sm text-slate-400">
                                                Question {assessment.currentIndex + 1} of {assessment.questions.length}
                                            </p>
                                        </div>
                                        <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="mb-8 space-y-6">
                                        <p className="text-lg font-medium text-white">
                                            {assessment.questions[assessment.currentIndex].question}
                                        </p>
                                        <div className="space-y-3">
                                            {assessment.questions[assessment.currentIndex].options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(option)}
                                                    className={cn(
                                                        "flex w-full items-center rounded-lg border px-4 py-3 text-left transition-all",
                                                        selectedOption === option
                                                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                            : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "mr-3 flex h-5 w-5 items-center justify-center rounded-full border",
                                                        selectedOption === option
                                                            ? "border-indigo-500 bg-indigo-500"
                                                            : "border-slate-500"
                                                    )}>
                                                        {selectedOption === option && <div className="h-2 w-2 rounded-full bg-white" />}
                                                    </div>
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={nextQuestion}
                                            disabled={!selectedOption}
                                            className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                                        >
                                            {assessment.currentIndex === assessment.questions.length - 1 ? "Finish" : "Next Question"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
                                        {assessment.score === assessment.questions.length ? (
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        ) : (
                                            <AlertCircle className="h-10 w-10 text-yellow-500" />
                                        )}
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold text-white">
                                        {assessment.score === assessment.questions.length ? "Assessment Passed!" : "Assessment Failed"}
                                    </h2>
                                    <p className="mb-8 text-slate-400">
                                        You scored {assessment.score} out of {assessment.questions.length}.
                                        {assessment.score === assessment.questions.length
                                            ? " This skill has been verified."
                                            : " You need 100% to verify this skill. Try again later."}
                                    </p>
                                    <button
                                        onClick={closeModal}
                                        className="rounded-lg bg-slate-800 px-6 py-2 font-medium text-white hover:bg-slate-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

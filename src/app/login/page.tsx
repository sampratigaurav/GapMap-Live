"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Chrome, ArrowRight, CheckCircle2 } from "lucide-react"; // Chrome as Google placeholder
import { cn } from "@/lib/utils";
import Link from "next/link"; // Added missing import
import { supabase } from "@/lib/supabase";


function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialRole = searchParams.get("role") === "enterprise" ? "enterprise" : "candidate";

    const [role, setRole] = useState<"candidate" | "enterprise">(initialRole);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [companyName, setCompanyName] = useState("");

    // Sync state with URL param if it changes (optional, but good for UX)
    useEffect(() => {
        const roleParam = searchParams.get("role");
        if (roleParam === "enterprise") setRole("enterprise");
        else if (roleParam === "candidate") setRole("candidate");
    }, [searchParams]);

    const handleAuth = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role,
                            full_name: fullName,
                            company_name: role === "enterprise" ? companyName : null,
                        },
                    },
                });
                if (error) throw error;
                // Ideally show a verification message here, but for now we might auto-login or redirect
                alert("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Successful login
                if (role === "candidate") {
                    router.push("/dashboard");
                } else {
                    router.push("/recruiter");
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md space-y-8"
        >
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    {isSignUp
                        ? (role === "candidate" ? "Join the Network." : "Start Hiring.")
                        : (role === "candidate" ? "Verify Your Impact." : "Find Proven Talent.")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {role === "candidate"
                        ? "Join the network of verified professionals."
                        : "Access the database of qualified candidates."}
                </p>
            </div>

            {/* Role Toggle */}
            <div className="space-y-3">
                <p className="text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    I am a
                </p>
                <div className="flex rounded-full bg-secondary p-1">
                    <button
                        onClick={() => setRole("candidate")}
                        className={cn(
                            "flex-1 rounded-full py-2 text-sm font-medium transition-all",
                            role === "candidate"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Candidate
                    </button>
                    <button
                        onClick={() => setRole("enterprise")}
                        className={cn(
                            "flex-1 rounded-full py-2 text-sm font-medium transition-all",
                            role === "enterprise"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Enterprise
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
                <div className="space-y-4">
                    {/* Full Name - Only for Sign Up */}
                    <AnimatePresence mode="popLayout">
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative overflow-hidden"
                            >
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="peer w-full border-b border-border bg-transparent py-2 text-foreground placeholder-transparent focus:border-primary focus:outline-none"
                                    id="fullname"
                                />
                                <label
                                    htmlFor="fullname"
                                    className="absolute left-0 -top-3.5 text-sm text-muted-foreground transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary"
                                >
                                    Full Name
                                </label>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Company Name - Enterprise Only (Sign Up or Login if needed, usually just Sign Up but kept for both based on previous requirement, strictly bound to Sign Up makes more sense but abiding by 'dynamic' request) */}
                    <AnimatePresence mode="popLayout">
                        {role === "enterprise" && isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative overflow-hidden"
                            >
                                <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="peer w-full border-b border-border bg-transparent py-2 text-foreground placeholder-transparent focus:border-primary focus:outline-none"
                                    id="company"
                                />
                                <label
                                    htmlFor="company"
                                    className="absolute left-0 -top-3.5 text-sm text-muted-foreground transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary"
                                >
                                    Company Name
                                </label>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="peer w-full border-b border-border bg-transparent py-2 text-foreground placeholder-transparent focus:border-primary focus:outline-none"
                            id="email"
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-0 -top-3.5 text-sm text-muted-foreground transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary"
                        >
                            Email Address
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="peer w-full border-b border-border bg-transparent py-2 text-foreground placeholder-transparent focus:border-primary focus:outline-none"
                            id="password"
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-0 -top-3.5 text-sm text-muted-foreground transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary"
                        >
                            Password
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-red-500 font-medium text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleAuth}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isLoading ? "Processing..." : (isSignUp ? "Create Account" : (role === "candidate" ? "Sign In to Qualify" : "Access Dashboard"))}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center rounded-lg border border-border bg-card py-2.5 transition-colors hover:bg-secondary">
                        <Github className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">GitHub</span>
                    </button>
                    <button className="flex items-center justify-center rounded-lg border border-border bg-card py-2.5 transition-colors hover:bg-secondary">
                        <Chrome className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Google</span>
                    </button>
                </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-semibold text-foreground hover:underline"
                >
                    {isSignUp ? "Sign in" : "Sign up"}
                </button>
            </p>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 py-12">
            <Suspense fallback={<div className="text-foreground">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}

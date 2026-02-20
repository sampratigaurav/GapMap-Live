"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, BarChart3, Users, LayoutDashboard, LogOut, CheckCircle, BrainCircuit, User, Database, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setRole(user?.user_metadata?.role || null);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            setRole(session?.user?.user_metadata?.role || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const routes = [
        ...(role === 'Candidate' ? [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/verify", label: "Verify Skills", icon: ShieldCheck },
        ] : []),
        ...(role === 'Enterprise' ? [
            { href: "/recruiter", label: "Talent Search", icon: Database },
        ] : []),
    ];

    if (pathname === '/login' || pathname === '/signup') return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <BrainCircuit className="h-8 w-8 text-indigo-500" />
                            <span className="text-xl font-bold text-white">GapMap</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <ThemeToggle />
                                    {routes.map((route) => (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            className={cn(
                                                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                                pathname === route.href
                                                    ? "bg-slate-800 text-white"
                                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                            )}
                                        >
                                            <route.icon className="mr-2 h-4 w-4" />
                                            {route.label}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/profile"
                                        className={cn(
                                            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            pathname === "/profile"
                                                ? "bg-slate-800 text-white"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <ThemeToggle />
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center rounded-md bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-slate-950 border-b border-white/10"
                >
                    <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                        {user ? (
                            <>
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center block px-3 py-2 rounded-md text-base font-medium",
                                            pathname === route.href
                                                ? "bg-slate-800 text-white"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <route.icon className="mr-2 h-4 w-4" />
                                        {route.label}
                                    </Link>
                                ))}
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center block px-3 py-2 rounded-md text-base font-medium",
                                        pathname === "/profile"
                                            ? "bg-slate-800 text-white"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="space-y-2 p-2">
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-base font-medium text-slate-300 hover:text-white"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsOpen(false)}
                                    className="block rounded-lg bg-indigo-600 px-4 py-2 text-center text-base font-medium text-white hover:bg-indigo-500"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
}

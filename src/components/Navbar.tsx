"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShieldCheck, Building2, Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Verify Skills", href: "/verify", icon: ShieldCheck },
    { name: "Enterprise", href: "/recruiter", icon: Building2 }, // Assuming /recruiter is Enterprise view
];

export function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2 font-bold text-xl tracking-tight">
                        <span className="bg-gradient-to-tr from-white to-gray-400 bg-clip-text text-transparent">GapMap</span>
                    </Link>
                </div>

                {/* Mobile Logo */}
                <div className="flex md:hidden">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-lg">
                        <span className="bg-gradient-to-tr from-white to-gray-400 bg-clip-text text-transparent">GapMap</span>
                    </Link>
                </div>


                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === item.href ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right Side (Auth/Profile placeholders) */}
                <div className="flex items-center space-x-4">
                    <Link href="/login">
                        <button className="hidden md:inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                            Sign In
                        </button>
                    </Link>
                    <button
                        className="md:hidden p-2 text-foreground/60 hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="md:hidden border-b border-border/40 bg-background px-4 py-4"
                >
                    <div className="flex flex-col space-y-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground",
                                    pathname === item.href ? "text-foreground" : "text-foreground/60"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="flex items-center space-x-2 text-sm font-medium text-foreground/60 hover:text-foreground pt-2">
                                Sign In
                            </span>
                        </Link>
                    </div>
                </motion.div>
            )}
        </nav>
    );
}

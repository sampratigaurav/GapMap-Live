"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Target, ShieldCheck, Zap, Search, BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'Enterprise' | 'Candidate' | 'Guest' | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user) {
          console.log("LANDING PAGE CHECK: User Found", user.id);
          // Safe Role Extraction with Fallback
          const rawRole = user.user_metadata?.role || 'Candidate';
          const role = rawRole === 'Enterprise' ? 'Enterprise' : 'Candidate'; // Normalize

          console.log("LANDING PAGE CHECK: Assigned Role", role);
          setUserRole(role);
        } else {
          console.log("LANDING PAGE CHECK: No User (Guest)");
          setUserRole('Guest');
        }
      } catch (err) {
        console.error("LANDING PAGE AUTH ERROR:", err);
        setUserRole('Guest'); // Fallback to guest on error
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500 shadow-xl shadow-indigo-500/20"></div>
        <p className="text-slate-500 text-sm animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  // Enterprise Portal
  if (userRole === 'Enterprise') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-4">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl text-center space-y-8 relative z-10"
        >
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300">
            <Users className="mr-2 h-4 w-4" />
            Enterprise Account
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
            Welcome to your <span className="text-indigo-400">Talent Hub.</span>
          </h1>

          <p className="text-xl text-slate-400">
            Discover verified upskillers or analyze your internal workforce.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/recruiter"
              className="group flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              <Search className="h-5 w-5" />
              Talent Discovery
            </Link>

            <Link
              href="/recruiter/feasibility"
              className="group flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-8 py-4 text-lg font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
            >
              <BarChart3 className="h-5 w-5" />
              Feasibility Engine
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Candidate Portal
  if (userRole === 'Candidate') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-4">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl text-center space-y-8 relative z-10"
        >
          <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
            <Zap className="mr-2 h-4 w-4" />
            Candidate Account
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
            Ready to <span className="text-emerald-400">level up?</span>
          </h1>

          <p className="text-xl text-slate-400">
            Continue your skill gap analysis or explore your personalized roadmaps.
          </p>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-10 py-4 text-lg font-bold text-white shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-105 hover:bg-emerald-500 hover:shadow-[0_0_50px_-5px_rgba(16,185,129,0.6)]"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Guest View (Original Landing Page)
  return (
    <>
      <div className="flex min-h-screen flex-col bg-slate-950 text-white selection:bg-indigo-500/30">

        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 text-center md:py-32">

          {/* Background Gradients */}
          <div className="absolute top-20 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[100px]" />
          <div className="absolute bottom-0 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[80px]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl space-y-8"
          >
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
              The Future of Technical Hiring
            </div>

            <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              Don&apos;t Just Apply. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Qualify.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-slate-400 md:text-xl">
              The AI-driven talent engine that maps candidate skills, bridges the gaps, and connects verified engineers with top-tier organizations.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login?role=candidate"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]"
              >
                I&apos;m a Candidate
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/login?role=enterprise"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/50 px-8 py-4 text-lg font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-sm"
              >
                I&apos;m Hiring
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Value Proposition Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-12 lg:grid-cols-2">

            {/* For Talent */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:p-12 hover:border-blue-500/30 transition-colors"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-[60px] group-hover:bg-blue-500/20 transition-all" />

              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Target className="h-6 w-6" />
              </div>

              <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">AI Skill Gap Analysis</h3>
              <p className="mb-8 text-lg text-slate-400 leading-relaxed">
                Stop guessing what employers want. Paste your current skills and your dream role, and our AI builds a personalized, step-by-step upskilling roadmap to get you hired.
              </p>

              <ul className="space-y-3">
                {["Identify missing critical skills", "Get actionable learning resources", "Track your progress visually"].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-300">
                    <CheckIcon className="mr-3 h-5 w-5 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Enterprise */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:p-12 hover:border-emerald-500/30 transition-colors"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-[60px] group-hover:bg-emerald-500/20 transition-all" />

              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">Verified Talent Discovery</h3>
              <p className="mb-8 text-lg text-slate-400 leading-relaxed">
                No more resume spam. Search a database of highly motivated candidates who are actively upskilling for your exact technical requirements.
              </p>

              <ul className="space-y-3">
                {["Filter by verified skill gaps", "Target specific roles & tech stacks", "Connect with motivated learners"].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-300">
                    <CheckIcon className="mr-3 h-5 w-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* How It Works Flow */}
        <section className="border-t border-slate-900 bg-slate-950/50 py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 space-y-4"
            >
              <h2 className="text-3xl font-bold text-white md:text-4xl">How GapMap Works</h2>
              <p className="text-slate-400">From analysis to hired in three simple steps.</p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: BarChart3, title: "1. Analyze Skills", desc: "Our AI scans your profile against market data." },
                { icon: Zap, title: "2. Bridge the Gap", desc: "Follow a custom roadmap to master missing skills." },
                { icon: Users, title: "3. Get Recruited", desc: "Showcase your growth to top hiring managers." }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative flex flex-col items-center p-6"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-slate-800 shadow-xl">
                    <step.icon className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="text-slate-400 max-w-xs">{step.desc}</p>

                  {/* Connector Line (Desktop Only) */}
                  {idx !== 2 && (
                    <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-slate-800 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-12 text-center">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} GapMap. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

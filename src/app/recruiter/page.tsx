import Link from "next/link";
import { BriefcaseBusiness, ShieldCheck } from "lucide-react";

export default function RecruiterPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Recruiter Portal
            </p>
            <h1 className="text-3xl font-bold text-white">Enterprise Access</h1>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed">
          This area is reserved for enterprise recruiters. Please contact the GapMap
          team to enable recruiter access for your organization.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-white px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-indigo-50"
          >
            Return Home
          </Link>
          <a
            className="rounded-lg border border-slate-700 px-5 py-2.5 font-semibold text-white transition hover:border-indigo-500"
            href="mailto:support@gapmap.ai"
          >
            Contact Support
          </a>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Verified enterprise users only</span>
        </div>
      </div>
    </div>
  );
}

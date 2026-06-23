"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const BRAND_FEATURES = [
  "AI-powered bug detection in seconds",
  "Security vulnerability scanning",
  "N+1 query & performance analysis",
  "Team collaboration & review history",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 900);
  };

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 700);
  };

  return (
    <div className="relative min-h-screen bg-[--bg-base] flex overflow-hidden">
      {/* ── Left: Hero panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1a] to-[#08080d] p-12 relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-50" />

        {/* Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[--brand-500]/10 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-purple-500/8 blur-[60px]" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[--brand-500] to-purple-600 flex items-center justify-center shadow-lg shadow-[--brand-500]/30 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-[17px] tracking-tight">Reviewer.AI</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight text-balance">
              Ship code you
              <br />
              <span className="gradient-text">actually trust</span>
            </h1>
            <p className="text-[--text-tertiary] mt-4 text-[14px] leading-relaxed max-w-xs">
              AI-powered pull request reviews that catch bugs, security issues, and performance problems before they reach production.
            </p>
          </div>

          <div className="space-y-3">
            {BRAND_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-[13px] text-[--text-secondary]"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[--brand-500] shrink-0" />
                {f}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-[--text-tertiary]">
          Trusted by engineering teams at early-stage startups to Fortune 500s.
        </div>
      </div>

      {/* ── Right: Auth form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-[--bg-base] to-[--bg-surface]" />
        <div className="absolute inset-0 hero-glow lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[--brand-500] to-purple-600 flex items-center justify-center shadow-lg shadow-[--brand-500]/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-[17px] tracking-tight text-[--text-primary]">Reviewer.AI</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight text-[--text-primary]">Welcome back</h2>
            <p className="text-[13px] text-[--text-tertiary] mt-1">Sign in to your code review dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[--text-tertiary]">Email</label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused === "email" ? "text-[--brand-500]" : "text-[--text-tertiary]"}`} />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="developer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="input-premium pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[--text-tertiary]">Password</label>
                <button type="button" className="text-[11px] text-[--brand-500] hover:text-[--brand-600] transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused === "password" ? "text-[--brand-500]" : "text-[--text-tertiary]"}`} />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="input-premium pl-10"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-[13px] mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{loading ? "Signing in…" : "Sign In"}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-[--border-subtle]" />
            <span className="relative bg-[--bg-base] px-3 text-[10px] uppercase font-bold text-[--text-tertiary] tracking-widest">
              or
            </span>
          </div>

          <button
            id="demo-login"
            onClick={handleDemo}
            disabled={loading}
            className="btn-secondary w-full justify-center py-3 text-[13px]"
          >
            <Sparkles className="h-4 w-4 text-[#f59e0b]" />
            <span>{loading ? "Loading…" : "Explore with Demo Account"}</span>
          </button>

          <p className="mt-6 text-center text-[12px] text-[--text-tertiary]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[--brand-500] hover:text-[--brand-600] font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

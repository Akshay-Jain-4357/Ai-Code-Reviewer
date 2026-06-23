"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, User, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
  const [error, setError]       = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Auto login after signup
      const signinRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signinRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email: "alex@acme.com",
        password: "demo123",
        redirect: false,
      });

      if (res?.error) {
        setError("Demo login failed.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[--bg-base] flex overflow-hidden">
      {/* ── Left: Hero panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1a] to-[#08080d] p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full bg-[--brand-500]/10 blur-[80px]" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-purple-500/8 blur-[60px]" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[--brand-500] to-purple-600 flex items-center justify-center shadow-lg shadow-[--brand-500]/30 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-[17px] tracking-tight">Reviewer.AI</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight text-balance">
              Your first review
              <br />
              <span className="gradient-text">starts now</span>
            </h1>
            <p className="text-[--text-tertiary] mt-4 text-[14px] leading-relaxed max-w-xs">
              Join thousands of developers who ship code 10× faster with AI-powered code review automation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Bugs caught",     value: "2.4M+" },
              { label: "PRs reviewed",    value: "890K+" },
              { label: "Teams using AI",  value: "12K+" },
              { label: "Hours saved",     value: "3.2M+" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="bg-white/5 border border-white/8 rounded-xl p-3"
              >
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-[10px] text-[--text-tertiary] mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-[--text-tertiary]">
          Free tier includes 50 PR reviews per month. No credit card required.
        </div>
      </div>

      {/* ── Right: Signup form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-[--bg-base] to-[--bg-surface]" />
        <div className="absolute inset-0 hero-glow lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[--brand-500] to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-[17px] tracking-tight text-[--text-primary]">Reviewer.AI</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight text-[--text-primary]">Create your account</h2>
            <p className="text-[13px] text-[--text-tertiary] mt-1">Start automating PR reviews in minutes</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] rounded-xl flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[--text-tertiary]">Full Name</label>
              <div className="relative">
                <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused === "name" ? "text-[--brand-500]" : "text-[--text-tertiary]"}`} />
                <input
                  id="signup-name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  className="input-premium pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[--text-tertiary]">Email</label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused === "email" ? "text-[--brand-500]" : "text-[--text-tertiary]"}`} />
                <input
                  id="signup-email"
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
              <label className="text-[10px] uppercase font-bold tracking-widest text-[--text-tertiary]">Password</label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused === "password" ? "text-[--brand-500]" : "text-[--text-tertiary]"}`} />
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="input-premium pl-10"
                />
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-[13px] mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{loading ? "Creating account…" : "Create Account"}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-[--border-subtle]" />
            <span className="relative bg-[--bg-base] px-3 text-[10px] uppercase font-bold text-[--text-tertiary] tracking-widest">or</span>
          </div>

          <button
            id="signup-demo"
            onClick={handleDemo}
            disabled={loading}
            className="btn-secondary w-full justify-center py-3 text-[13px]"
          >
            <Sparkles className="h-4 w-4 text-[#f59e0b]" />
            <span>{loading ? "Loading…" : "Explore Demo Account"}</span>
          </button>

          <p className="mt-6 text-center text-[12px] text-[--text-tertiary]">
            Already have an account?{" "}
            <Link href="/login" className="text-[--brand-500] hover:text-[--brand-600] font-semibold transition-colors">
              Sign in
            </Link>
          </p>

          <p className="mt-3 text-center text-[10px] text-[--text-tertiary]">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:text-[--text-secondary] transition-colors">Terms</a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-[--text-secondary] transition-colors">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

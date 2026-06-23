"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  Terminal,
  Check,
  ShieldCheck,
  Zap,
  Code2,
  Play,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import MagicBento from "@/components/shared/MagicBento";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TERMINAL ANIMATION DATA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const TERMINAL_STEPS = [
  {
    lines: [
      { text: "$ git push origin feature/auth-middleware", color: "text-[--text-tertiary]" },
      { text: "✔ Branch synchronized. Syncing PR #87…", color: "text-[--brand-500]" },
      { text: "⚡ Webhook parsed. Reading diff coordinates…", color: "text-[#f59e0b]" },
      { text: "⚙ Routing to Gemini 2.5 Pro inference engine…", color: "text-purple-400" },
    ],
  },
  {
    lines: [
      { text: "Analyzing: src/middleware/auth.ts  [SECURITY mode]", color: "text-[#10b981] font-semibold" },
      { text: "  18 |  export async function checkSession(req, res) {", color: "text-[--text-tertiary]" },
      { text: "  19 |    const token = req.headers.authorization;", color: "text-[--text-tertiary]" },
      { text: "- 20 |    const secret = process.env.JWT_SECRET || \"fallback\";", color: "text-[#ef4444] bg-[#ef4444]/8 block px-2 border-l-2 border-[#ef4444]" },
      { text: "+ 20 |    const secret = process.env.JWT_SECRET;", color: "text-[#10b981] bg-[#10b981]/8 block px-2 border-l-2 border-[#10b981]" },
      { text: "+ 21 |    if (!secret) throw new Error(\"JWT_SECRET not set\");", color: "text-[#10b981] bg-[#10b981]/8 block px-2 border-l-2 border-[#10b981]" },
    ],
  },
  {
    lines: [
      { text: "⚠ SECURITY (HIGH): Hardcoded fallback JWT secret detected.", color: "text-[#f59e0b] font-semibold" },
      { text: "  Risk: An attacker can forge JWT tokens using the fallback key.", color: "text-[--text-secondary]" },
      { text: "  Fix: Remove fallback and require JWT_SECRET in environment.", color: "text-[--text-secondary]" },
      { text: "", color: "" },
      { text: "+ const secret = process.env.JWT_SECRET;", color: "text-[#10b981] font-mono text-[11px]" },
      { text: "+ if (!secret) throw new Error(\"JWT_SECRET not set\");", color: "text-[#10b981] font-mono text-[11px]" },
    ],
  },
  {
    lines: [
      { text: "✔ Review completed in 3.21 seconds", color: "text-[#10b981] font-semibold" },
      { text: "  Tokens: 1,240   Cost: $0.0032", color: "text-[--text-tertiary]" },
      { text: "  Health Score: 74%   Comments: 3", color: "text-[--text-tertiary]" },
      { text: "✕ Decision: CHANGES_REQUESTED — posted to PR #87", color: "text-[#ef4444] font-semibold" },
    ],
  },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FEATURES DATA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const FEATURES = {
  bugs: {
    tab: { title: "Logic & Bug Detection", icon: Code2, desc: "Catch race conditions, null dereferences, unhandled edge cases, and crashes before production." },
    title: "Semantic Bug Detection",
    desc: "Detect race conditions, null reference dereferences, missing edge validation, and logic errors before they reach production.",
    before: `// BEFORE: SQL Injection Risk
async function getUserSessions(userId) {
  const sessions = await db.query(
    "SELECT * FROM sessions WHERE id = " + userId
  );
  return sessions.map(s => s.token);
}`,
    after: `// AFTER: Parameterized & Validated
async function getUserSessions(userId) {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user identity");
  }
  const sessions = await db.query(
    "SELECT token FROM sessions WHERE id = $1",
    [userId]
  );
  return sessions.map(s => s.token);
}`,
    comment: "⚠️ Critical: Unsanitized dynamic SQL. Added validation and parameterization.",
  },
  security: {
    tab: { title: "Security Scanning", icon: ShieldCheck, desc: "Find exposed secrets, SSRF points, broken access control, and unsafe dependencies." },
    title: "Security Threat Detection",
    desc: "Automated analysis for exposed secrets, vulnerable libraries, broken access control, SSRF entry points, and unsanitized input.",
    before: `// BEFORE: Exposed API Secret
const STRIPE_SECRET = "sk_live_51Ny89H...";
const stripe = require("stripe")(STRIPE_SECRET);`,
    after: `// AFTER: Environment Variable
const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}
const stripe = require("stripe")(stripeSecret);`,
    comment: "🔒 High Risk: Live API key hardcoded. Moved to environment variable.",
  },
  performance: {
    tab: { title: "Performance Auditing", icon: Zap, desc: "Stop N+1 queries, blocking calls, memory leaks, and redundant database operations." },
    title: "N+1 & Performance Optimization",
    desc: "Identify heavy blocking queries, memory leaks, and redundant database calls that kill throughput.",
    before: `// BEFORE: N+1 Query Loop
const users = await db.users.findMany();
for (let user of users) {
  user.posts = await db.posts.findMany({
    where: { userId: user.id }
  });
}`,
    after: `// AFTER: Relation Inlining
const users = await db.users.findMany({
  include: {
    posts: true
  }
});`,
    comment: "⚡ Bottleneck: Nested query in a loop. Consolidated into a single query.",
  },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRICING DATA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const PRICING = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For solo developers and open source projects.",
    features: ["10 reviews per month", "Fast Scan mode", "GitHub integration", "Basic analytics"],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    desc: "For growing teams shipping code fast.",
    features: ["Unlimited reviews", "All review modes", "Custom review rules", "Priority processing", "Team analytics dashboard", "Security audit mode"],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    desc: "Self-hosted and custom LLM routing.",
    features: ["Everything in Pro", "SSO & SAML", "Self-hosted option", "Custom LLM routing", "Advanced audit logs", "SLA & dedicated support"],
    cta: "Contact Sales",
    href: "/signup",
    highlight: false,
  },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANDING PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof FEATURES>("bugs");
  const [termStep, setTermStep]   = useState(0);
  const [scrolled, setScrolled]   = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTermStep((p) => (p + 1) % 4), 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const feature = FEATURES[activeTab];

  return (
    <div className="relative min-h-screen bg-[#06060c] text-white selection:bg-[--brand-500]/30 overflow-x-hidden">
      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,110,247,0.12),transparent_60%)]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[--brand-500]/6 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-600/5 blur-[100px]" />
        <div className="absolute inset-0 grid-pattern opacity-[0.4]" />
      </div>

      {/* ══════════════════════════ NAVBAR ══════════════════════════ */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "py-3" : "py-5"}`}>
        <div className={`max-w-6xl mx-auto px-4 transition-all duration-300 ${scrolled ? "px-2" : ""}`}>
          <div className={`flex items-center justify-between rounded-2xl transition-all duration-300 px-5 py-3 ${
            scrolled
              ? "glass-nav shadow-lg"
              : "bg-transparent"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[--brand-500] to-purple-600 flex items-center justify-center shadow-lg shadow-[--brand-500]/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-[15px] tracking-tight">Reviewer.AI</span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-[13px] text-white/60 font-medium">
              <a href="#features"    className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="#pricing"     className="hover:text-white transition-colors">Pricing</a>
              <Link href="/pricing"  className="hover:text-white transition-colors">Full Plans</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-[13px] text-white/70 hover:text-white transition-colors font-medium px-3 py-1.5">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary text-[12px] py-2 px-4">
                Start Free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 badge badge-blue mb-6 py-1.5 px-3"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[12px]">Next-Generation AI Code Review</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-balance"
        >
          AI reviews your PRs
          <br />
          <span className="gradient-text">in seconds, not hours.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[15px] md:text-[17px] text-white/55 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Integrate GitHub & GitLab webhook-powered reviews that catch security vulnerabilities, logic bugs, and performance issues before they reach production — with inline fix suggestions.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white text-[#06060c] hover:bg-white/90 font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-white/10 active:scale-95 text-[14px]"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/6 hover:bg-white/10 border border-white/10 font-semibold px-7 py-3.5 rounded-xl transition-all active:scale-95 text-[14px]"
          >
            <GithubIcon className="h-4.5 w-4.5" />
            Install GitHub App
          </Link>
        </motion.div>

        {/* Terminal mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mx-auto rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/60"
          style={{ background: "rgba(8,8,14,0.96)", backdropFilter: "blur(20px)" }}
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
              <span className="text-[11px] text-white/30 font-mono pl-3">reviewer.ai — acme-corp/api-gateway</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/25 font-mono">
              <Terminal className="h-3 w-3" />
              <span>review-stream</span>
            </div>
          </div>

          {/* Terminal body */}
          <div className="p-6 font-mono text-[12px] md:text-[13px] min-h-[240px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={termStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="space-y-1.5"
              >
                {TERMINAL_STEPS[termStep].lines.map((line, i) => (
                  <div key={i} className={`leading-relaxed ${line.color}`}>{line.text}</div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Stepper */}
            <div className="absolute bottom-4 right-5 flex gap-1.5">
              {[0, 1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setTermStep(s)}
                  className={`h-1.5 rounded-full transition-all ${
                    termStep === s ? "w-5 bg-[--brand-500]" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════ SOCIAL PROOF ══════════════════════════ */}
      <section className="py-14 border-y border-white/5" style={{ background: "rgba(6,6,12,0.6)" }}>
        <p className="text-center text-[11px] text-white/30 uppercase tracking-widest font-bold mb-8">
          Trusted by engineering teams at
        </p>
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {["VERCEL", "LINEAR", "STRIPE", "NOTION", "RAYCAST", "FRAMER"].map((brand, i) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.1 * i }}
              className="font-black text-[15px] tracking-tight text-white"
            >
              {brand}
            </motion.span>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ FEATURES ══════════════════════════ */}
      <section id="features" className="py-28 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="badge badge-blue inline-flex mb-4">Code Intelligence</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-balance">
              Five review modes. <span className="gradient-text">One platform.</span>
            </h2>
            <p className="text-[15px] text-white/50 max-w-xl mx-auto">
              Our AI engine specializes across discrete review tracks to deliver contextual, actionable feedback every time.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Tab selectors */}
          <div className="md:col-span-4 space-y-2">
            {(Object.keys(FEATURES) as Array<keyof typeof FEATURES>).map((key) => {
              const { tab } = FEATURES[key];
              const Icon = tab.icon;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isActive
                      ? "bg-[--brand-500]/8 border-[--brand-500]/25 shadow-lg"
                      : "bg-transparent border-transparent text-white/40 hover:bg-white/4 hover:text-white/70"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isActive ? "bg-[--brand-500]/15 text-[--brand-500]" : "bg-white/5 text-white/30"}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className={`font-semibold text-[13px] ${isActive ? "text-white" : ""}`}>{tab.title}</div>
                    <div className="text-[11px] text-white/40 mt-0.5 leading-normal">{tab.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feature card */}
          <div className="md:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/8 overflow-hidden"
                style={{ background: "rgba(10,10,18,0.9)" }}
              >
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-[15px] text-white">{feature.title}</h3>
                    <p className="text-[13px] text-white/50 mt-1 leading-relaxed">{feature.desc}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 font-mono text-[11px]">
                    <div className="bg-[#ef4444]/6 border border-[#ef4444]/15 p-4 rounded-xl">
                      <div className="text-[10px] text-[#ef4444] font-bold mb-2 uppercase tracking-wider">Before</div>
                      <pre className="text-white/50 whitespace-pre-wrap leading-relaxed">{feature.before}</pre>
                    </div>
                    <div className="bg-[#10b981]/6 border border-[#10b981]/15 p-4 rounded-xl">
                      <div className="text-[10px] text-[#10b981] font-bold mb-2 uppercase tracking-wider">AI Fix</div>
                      <pre className="text-white/70 whitespace-pre-wrap leading-relaxed">{feature.after}</pre>
                    </div>
                  </div>

                  <div className="bg-[#f59e0b]/8 border border-[#f59e0b]/15 px-4 py-3 rounded-xl flex items-start gap-2.5 text-[12px] text-[#f59e0b]">
                    <Check className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{feature.comment}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ BENTO SHOWCASE ══════════════════════════ */}
      <section className="py-28 px-4 border-t border-white/5" style={{ background: "rgba(6,6,12,0.4)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="badge badge-purple inline-flex mb-4">Platform</div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-balance">
                Everything you need, <span className="gradient-text">beautifully organized.</span>
              </h2>
              <p className="text-[15px] text-white/50 max-w-xl mx-auto">
                A unified control center for analytics, automation, security, and team collaboration — all in one platform.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex justify-center"
          >
            <MagicBento
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={210}
              particleCount={12}
              glowColor="79, 110, 247"
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════ HOW IT WORKS ══════════════════════════ */}
      <section id="how-it-works" className="py-24 border-t border-white/5" style={{ background: "rgba(6,6,10,0.5)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="badge badge-purple inline-flex mb-4">Integration</div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Up and running in 2 minutes.</h2>
              <p className="text-[15px] text-white/50 max-w-xl mx-auto">No configuration overhead. Connect your repo and push your first commit.</p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Connect GitHub", desc: "Authorize our secure bot to sync repositories with a single OAuth click." },
              { num: "02", title: "Push Changes",   desc: "Commit code and push branches. Webhooks detect push events automatically." },
              { num: "03", title: "Get AI Review",  desc: "In under 15 seconds, the AI reviews code diff and posts inline comments." },
              { num: "04", title: "Merge Safely",   desc: "Apply fix suggestions, resolve status checks, and merge with confidence." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-2xl border border-white/6 transition-all hover:border-[--brand-500]/25 hover:bg-[--brand-500]/3"
                style={{ background: "rgba(10,10,18,0.6)" }}
              >
                <div className="text-[11px] text-[--brand-500] font-black font-mono mb-4">{step.num}</div>
                <h3 className="font-bold text-[14px] text-white mb-2">{step.title}</h3>
                <p className="text-[12px] text-white/45 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PRICING ══════════════════════════ */}
      <section id="pricing" className="py-28 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="badge badge-gray inline-flex mb-4">Pricing</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Simple, transparent pricing.</h2>
            <p className="text-[15px] text-white/50 max-w-lg mx-auto">No per-seat madness. No hidden fees. Start free and scale as you grow.</p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PRICING.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col rounded-2xl border p-6 relative ${
                plan.highlight
                  ? "border-[--brand-500] shadow-2xl shadow-[--brand-500]/15"
                  : "border-white/8"
              }`}
              style={{ background: plan.highlight ? "rgba(79,110,247,0.05)" : "rgba(10,10,18,0.7)" }}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[--brand-500] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-5">
                <div className={`text-[11px] font-black uppercase tracking-widest mb-3 ${plan.highlight ? "text-[--brand-500]" : "text-white/40"}`}>
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-[15px] text-white/40 mb-1">{plan.period}</span>}
                </div>
                <p className="text-[12px] text-white/45 leading-relaxed">{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-[13px] text-white/70">
                    <Check className="h-3.5 w-3.5 text-[--brand-500] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full text-center font-semibold py-3 rounded-xl text-[13px] transition-all ${
                  plan.highlight
                    ? "btn-primary justify-center"
                    : "bg-white/6 hover:bg-white/10 border border-white/10 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ CTA BANNER ══════════════════════════ */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl border border-[--brand-500]/20 p-16 relative overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(79,110,247,0.12), rgba(10,10,18,0.95))" }}
        >
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[--brand-500] to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[--brand-500]/30">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Ship code you actually trust.
            </h2>
            <p className="text-[15px] text-white/50 mb-8 max-w-md mx-auto">
              Join thousands of engineering teams who catch bugs before production, not after.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="btn-primary px-8 py-3.5 text-[14px]">
                Start Free — No credit card
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="bg-white/6 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl text-[14px] transition-all">
                Open Demo Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="border-t border-white/5 py-12 px-6" style={{ background: "rgba(4,4,8,0.8)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[12px] text-white/35">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-[--brand-500] to-purple-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-[14px] text-white">Reviewer.AI</span>
          </div>
          <div>© 2026 Reviewer.AI Inc. Built for security & speed.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

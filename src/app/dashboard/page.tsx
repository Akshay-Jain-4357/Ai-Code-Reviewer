"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  ShieldAlert,
  Bug,
  Clock,
  Activity,
  Search,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Cpu,
  Inbox,
  Plus,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Skeleton loader
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Animated counter
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AnimatedCount({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const duration = 900;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.floor(ease * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <>{display}{suffix}</>;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   KPI Card
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
type KpiCardProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  trend?: string;
  color: "blue" | "amber" | "red" | "green";
  delay?: number;
};

const COLOR_MAP = {
  blue:  { icon: "text-[#4f6ef7]", bg: "bg-[#4f6ef7]/10", dot: "bg-[#4f6ef7]", trend: "text-[#4f6ef7]" },
  amber: { icon: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", dot: "bg-[#f59e0b]", trend: "text-[#f59e0b]" },
  red:   { icon: "text-[#ef4444]", bg: "bg-[#ef4444]/10", dot: "bg-[#ef4444]", trend: "text-[#ef4444]" },
  green: { icon: "text-[#10b981]", bg: "bg-[#10b981]/10", dot: "bg-[#10b981]", trend: "text-[#10b981]" },
};

function KpiCard({ icon: Icon, label, value, suffix, trend, color, delay = 0 }: KpiCardProps) {
  const c = COLOR_MAP[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className={`h-9 w-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`h-4.5 w-4.5 ${c.icon}`} />
        </div>
        <div className={`h-1.5 w-1.5 rounded-full ${c.dot} mt-1.5`} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-[--text-tertiary]">{label}</div>
        <div className="text-2xl font-black tracking-tight text-[--text-primary] mt-0.5">
          <AnimatedCount value={value} suffix={suffix} />
        </div>
        {trend && (
          <div className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${c.trend}`}>
            <TrendingUp className="h-3 w-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Mini bar chart (from real data)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MiniBarChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const pct = Math.max((d.count / max) * 100, d.count > 0 ? 8 : 4);
        return (
          <motion.div
            key={i}
            className="flex-1 flex flex-col items-center gap-1.5 group"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom" }}
          >
            <div className="relative w-full flex-1 flex items-end">
              <div
                style={{ height: `${pct}%` }}
                className="w-full rounded-t-md bg-gradient-to-t from-[--brand-600]/70 to-[--brand-500] group-hover:from-[--brand-500] transition-all duration-300"
              />
            </div>
            <span className="text-[9px] text-[--text-tertiary] font-mono">{d.day}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Empty State
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function EmptyPRs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center gap-3"
    >
      <div className="h-14 w-14 rounded-2xl bg-[--brand-500]/8 flex items-center justify-center">
        <Inbox className="h-7 w-7 text-[--text-tertiary]" />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-[--text-primary]">No pull requests yet</div>
        <div className="text-[11px] text-[--text-tertiary] mt-1">
          Connect a repository to start receiving AI reviews
        </div>
      </div>
      <Link href="/repositories" className="btn-primary text-xs mt-1 px-4 py-2">
        <Plus className="h-3.5 w-3.5" />
        Connect Repository
      </Link>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Dashboard skeleton
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 mt-8 space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-surface p-5 space-y-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-12 rounded" />
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 card-surface p-6 space-y-4">
          <Skeleton className="h-4 w-48 rounded" />
          <div className="flex items-end gap-1.5 h-20">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1">
                <Skeleton className="w-full rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-4 card-surface p-6 space-y-3">
          <Skeleton className="h-4 w-32 rounded" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-5 w-full rounded" />)}
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DASHBOARD PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<{
    repos: any[];
    prs: any[];
    reviews: any[];
    usage: any[];
    logs: any[];
    org?: any;
  }>({ repos: [], prs: [], reviews: [], usage: [], logs: [] });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { if (json) setData(json); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* --- Derived metrics from real data only --- */
  const totalReviewed = data.reviews.length;

  const bugsCaught = data.reviews.reduce(
    (acc: number, r: any) =>
      acc + (r.comments?.filter((c: any) => c.category === "BUG").length ?? 0),
    0
  );

  const securityThreats = data.reviews.reduce(
    (acc: number, r: any) =>
      acc + (r.comments?.filter((c: any) => c.category === "SECURITY").length ?? 0),
    0
  );

  // 1.8 hrs saved per review is a reasonable product estimate
  const hoursSaved = Math.round(totalReviewed * 1.8);

  const activeReposCount = data.repos.filter((r: any) => r.isActive === "true").length;

  // Build weekly chart from actual review timestamps
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = weekdayLabels.map((day, idx) => {
    const count = data.reviews.filter((r: any) => {
      const d = new Date(r.createdAt);
      // 0=Sun, 1=Mon... convert to Mon=0
      return ((d.getDay() + 6) % 7) === idx;
    }).length;
    return { day, count };
  });

  // Active provider
  const activeProvider = data.reviews.length > 0
    ? (data.reviews[data.reviews.length - 1] as any)?.providerId ?? null
    : null;

  // Filter PRs by search
  const filteredPRs = data.prs.filter((pr: any) =>
    !query || pr.title?.toLowerCase().includes(query.toLowerCase()) ||
    pr.author?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="lg:ml-0 min-h-screen bg-[--bg-base] pb-24 lg:pb-12">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 glass-nav px-6 py-4 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {data.org?.name && (
            <div className="text-[9px] text-[--text-tertiary] uppercase tracking-widest font-bold mb-0.5">
              {data.org.name}
            </div>
          )}
          <h1 className="text-[15px] font-bold tracking-tight text-[--text-primary]">
            Dashboard
          </h1>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--text-tertiary]" />
            <input
              type="text"
              placeholder="Search pull requests…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-premium pl-9 pr-4 py-2 w-56 text-[12px]"
            />
          </div>

          <button
            onClick={() => window.location.reload()}
            className="btn-secondary p-2 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <DashboardSkeleton key="skeleton" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto px-6 mt-8 space-y-8"
          >
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard icon={GitPullRequest} label="Reviews Done"   value={totalReviewed} color="blue"  delay={0}   />
              <KpiCard icon={Bug}            label="Bugs Caught"    value={bugsCaught}    color="amber" delay={80}  />
              <KpiCard icon={ShieldAlert}    label="Security Risks" value={securityThreats} color="red" delay={160} />
              <KpiCard icon={Clock}          label="Hours Saved"    value={hoursSaved}    suffix="h"    color="green" delay={240} />
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-12 gap-6">
              {/* Weekly chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="md:col-span-8 card-surface p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[--text-primary]">PR Review Activity</h3>
                    <p className="text-[10px] text-[--text-tertiary] mt-0.5">
                      {totalReviewed > 0 ? "Reviews by day of week" : "No review activity yet"}
                    </p>
                  </div>
                  <div className="badge badge-blue gap-1">
                    <Activity className="h-3 w-3" />
                    Live
                  </div>
                </div>
                {totalReviewed > 0 ? (
                  <MiniBarChart data={weeklyData} />
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-[--text-tertiary]">
                      <BarChart3 className="h-5 w-5 opacity-40" />
                      <span className="text-[11px]">Activity will appear after first reviews</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Core telemetry */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="md:col-span-4 card-surface p-6 flex flex-col justify-between"
              >
                <h3 className="text-[13px] font-bold text-[--text-primary] mb-4">System Status</h3>

                <div className="space-y-3 flex-1 text-[12px]">
                  <div className="flex items-center justify-between py-2 border-b border-[--border-subtle]">
                    <span className="text-[--text-tertiary]">AI Provider</span>
                    <span className="font-semibold text-[--text-primary] flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-[--brand-500]" />
                      {activeProvider ?? "Not configured"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[--border-subtle]">
                    <span className="text-[--text-tertiary]">Repositories</span>
                    <span className="font-semibold text-[--text-primary]">
                      {activeReposCount} / {data.repos.length} Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[--border-subtle]">
                    <span className="text-[--text-tertiary]">Open PRs</span>
                    <span className="font-semibold text-[--text-primary]">
                      {data.prs.filter((p: any) => p.status === "OPEN").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[--text-tertiary]">Total Reviews</span>
                    <span className="font-semibold text-[--text-primary]">{totalReviewed}</span>
                  </div>
                </div>

                <Link
                  href="/repositories"
                  className="btn-primary w-full justify-center mt-4 text-[12px] py-2.5"
                >
                  <span>Manage Repos</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            </div>

            {/* PRs + Activity Row */}
            <div className="grid md:grid-cols-12 gap-6">
              {/* Pull requests */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="md:col-span-8 card-surface p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold text-[--text-primary]">Pull Requests</h3>
                  <span className="badge badge-gray font-mono">
                    {data.prs.filter((p: any) => p.status === "OPEN").length} open
                  </span>
                </div>

                {filteredPRs.length === 0 ? (
                  query ? (
                    <div className="py-8 text-center text-[12px] text-[--text-tertiary]">No results for "{query}"</div>
                  ) : (
                    <EmptyPRs />
                  )
                ) : (
                  <div className="space-y-2">
                    {filteredPRs.map((pr: any, i: number) => {
                      const latestReview = pr.reviews?.[pr.reviews.length - 1];
                      const score = latestReview?.healthScore ?? 0;
                      const decision = latestReview?.decision ?? null;

                      const scoreColor =
                        score >= 90 ? "text-[#10b981] bg-[#10b981]/10 ring-[#10b981]/25"
                        : score >= 70 ? "text-[#f59e0b] bg-[#f59e0b]/10 ring-[#f59e0b]/25"
                        : score > 0  ? "text-[#ef4444] bg-[#ef4444]/10 ring-[#ef4444]/25"
                        : "text-[--text-tertiary] bg-[--bg-surface] ring-[--border-subtle]";

                      return (
                        <motion.div
                          key={pr.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="card-surface p-4 flex items-center justify-between gap-4 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Health circle */}
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-[11px] ring-1 shrink-0 ${scoreColor}`}>
                              {score > 0 ? `${score}` : "—"}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] text-[--text-tertiary] font-mono">#{pr.number}</span>
                                <span className="text-[12px] font-semibold text-[--text-primary] truncate">{pr.title}</span>
                              </div>
                              <div className="text-[10px] text-[--text-tertiary] flex items-center gap-1.5">
                                <span>{pr.author}</span>
                                <span>·</span>
                                <span className="truncate">{pr.repository?.name}</span>
                                <span>·</span>
                                <span className="font-mono text-[--brand-500] truncate">{pr.sourceBranch}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {decision && (
                              <span className={`badge ${
                                decision === "APPROVED" ? "badge-green"
                                : decision === "CHANGES_REQUESTED" ? "badge-red"
                                : "badge-gray"
                              }`}>
                                {decision === "CHANGES_REQUESTED" ? "Changes" : decision.toLowerCase()}
                              </span>
                            )}
                            <Link
                              href={`/pr/${pr.id}`}
                              className="btn-secondary p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Audit logs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="md:col-span-4 card-surface p-6 space-y-4"
              >
                <h3 className="text-[13px] font-bold text-[--text-primary]">Activity</h3>

                {data.logs.length === 0 ? (
                  <div className="py-8 flex flex-col items-center gap-2 text-center">
                    <div className="h-10 w-10 rounded-xl bg-[--bg-elevated] flex items-center justify-center">
                      <Activity className="h-5 w-5 text-[--text-tertiary] opacity-50" />
                    </div>
                    <span className="text-[11px] text-[--text-tertiary]">No activity yet</span>
                  </div>
                ) : (
                  <div className="space-y-4 overflow-y-auto max-h-72 pr-1">
                    {data.logs.map((log: any, i: number) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[--brand-500] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-[--text-primary]">
                            {log.action.replace(/_/g, " ")}
                          </div>
                          <div className="text-[10px] text-[--text-tertiary] mt-0.5 truncate">{log.details}</div>
                          <div className="text-[9px] text-[--text-tertiary] font-mono mt-0.5">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

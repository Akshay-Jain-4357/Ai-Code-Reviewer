"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  Calendar,
  Cpu,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Coins,
  Inbox,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function ReviewHistory() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setReviews(json.reviews || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredReviews = reviews.filter((rev) => {
    const prTitle = rev.pullRequest?.title || "";
    const repoName = rev.pullRequest?.repository?.name || "";
    const matchesSearch =
      prTitle.toLowerCase().includes(search.toLowerCase()) ||
      repoName.toLowerCase().includes(search.toLowerCase());
    if (decisionFilter === "all") return matchesSearch;
    return matchesSearch && rev.decision === decisionFilter;
  });

  return (
    <div className="min-h-screen bg-[--bg-base] pb-24 lg:pb-12">
      <header className="sticky top-0 z-30 glass-nav px-6 py-4 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[9px] text-[--text-tertiary] uppercase tracking-widest font-bold mb-0.5">Audit Ledger</div>
          <h1 className="text-[15px] font-bold tracking-tight text-[--text-primary]">Review History</h1>
        </motion.div>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-6 pb-8">
        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-4 flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--text-tertiary]" />
            <input
              type="text"
              placeholder="Filter by PR title or repository..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium pl-9 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-[--text-tertiary] shrink-0" />
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="input-premium w-full sm:w-44"
            >
              <option value="all" className="bg-[#0a0a0f] text-[--text-primary]">All Decisions</option>
              <option value="APPROVED" className="bg-[#0a0a0f] text-[--text-primary]">Approved</option>
              <option value="CHANGES_REQUESTED" className="bg-[#0a0a0f] text-[--text-primary]">Changes Requested</option>
              <option value="COMMENTED" className="bg-[#0a0a0f] text-[--text-primary]">Commented</option>
            </select>
          </div>
        </motion.div>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-surface p-6 flex flex-col gap-3">
                <Skeleton className="h-3 w-48 rounded" />
                <Skeleton className="h-5 w-3/4 rounded" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-surface p-16 flex flex-col items-center gap-4 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-[--bg-elevated] flex items-center justify-center">
              {search || decisionFilter !== "all" ? (
                <Search className="h-8 w-8 text-[--text-tertiary] opacity-40" />
              ) : (
                <History className="h-8 w-8 text-[--text-tertiary] opacity-40" />
              )}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[--text-primary]">
                {search || decisionFilter !== "all" ? "No matching reviews" : "No review history yet"}
              </div>
              <div className="text-[11px] text-[--text-tertiary] mt-1">
                {search || decisionFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Run your first AI review from the PR Workspace"}
              </div>
            </div>
            {!search && decisionFilter === "all" && (
              <Link href="/pr/pr-1" className="btn-primary text-[12px] px-4 py-2 mt-1">
                Open PR Workspace
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((rev, i) => {
              const pr = rev.pullRequest;
              const scoreColor =
                rev.healthScore >= 90 ? "text-[#10b981]"
                : rev.healthScore >= 70 ? "text-[#f59e0b]"
                : "text-[#ef4444]";

              return (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="card-surface p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-3 text-[10px] text-[--text-tertiary] font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-[--text-secondary]">{pr?.repository?.name ?? "Repository"}</span>
                      <span>·</span>
                      <span>PR #{pr?.number ?? 0}</span>
                    </div>

                    <h3 className="text-[13px] font-bold text-[--text-primary] truncate">
                      {pr?.title ?? "Review"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="badge badge-blue gap-1">
                        <Cpu className="h-3 w-3" />
                        {rev.mode}
                      </span>
                      <span className="text-[10px] text-[--text-tertiary] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rev.durationMs}ms
                      </span>
                      <span className="text-[10px] text-[--text-tertiary] flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {rev.tokensUsed} tokens · ${rev.cost}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0 border-[--border-subtle] shrink-0">
                    {/* Health score */}
                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-[--text-tertiary] mb-0.5">Score</div>
                      <div className={`text-xl font-black ${scoreColor}`}>{rev.healthScore}%</div>
                    </div>

                    {/* Decision */}
                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-[--text-tertiary] mb-0.5">Decision</div>
                      <div className={`text-[11px] font-bold flex items-center gap-1.5 ${
                        rev.decision === "APPROVED" ? "text-[#10b981]"
                        : rev.decision === "CHANGES_REQUESTED" ? "text-[#ef4444]"
                        : "text-[--text-tertiary]"
                      }`}>
                        {rev.decision === "APPROVED" && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {rev.decision === "CHANGES_REQUESTED" && <XCircle className="h-3.5 w-3.5" />}
                        {rev.decision === "COMMENTED" && <MessageSquare className="h-3.5 w-3.5" />}
                        {rev.decision?.replace("_", " ")}
                      </div>
                    </div>

                    {pr && (
                      <Link
                        href={`/pr/${pr.id}`}
                        className="btn-secondary p-2 rounded-xl"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

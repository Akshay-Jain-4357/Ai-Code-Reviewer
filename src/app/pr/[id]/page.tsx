"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  ArrowLeft,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Bug,
  Cpu,
  Clock,
  RefreshCw,
  FileCode,
  Check,
  Info,
  Zap,
  Coins,
  GitMerge,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ━━━ Skeleton ━━━ */
function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

/* ━━━ Health gauge SVG ━━━ */
function HealthGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="64" cy="64" r={r}
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div className="text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-black"
          style={{ color }}
        >
          {score}%
        </motion.div>
        <div className="text-[9px] text-[--text-tertiary] font-medium mt-0.5">Health</div>
      </div>
    </div>
  );
}

/* ━━━ Mode options ━━━ */
const MODES = [
  { value: "FAST",     label: "Fast Scan",    icon: "⚡" },
  { value: "DEEP",     label: "Deep Review",  icon: "🔬" },
  { value: "SECURITY", label: "Security",     icon: "🛡️" },
  { value: "STYLE",    label: "Style",        icon: "🎨" },
  { value: "JUNIOR",   label: "Mentor Mode",  icon: "🎓" },
];

/* ━━━ Mock diff data — displayed when no real diff exists ━━━ */
const MOCK_FILES: Record<string, Array<{ type: "normal" | "add" | "remove"; line: number; text: string; commentId?: string }>> = {
  "src/middleware/auth.ts": [
    { type: "normal", line: 18, text: "export async function checkSession(req, res) {" },
    { type: "normal", line: 19, text: "  const token = req.headers.authorization;" },
    { type: "remove", line: 20, text: "  const tokenSecret = process.env.JWT_SECRET || \"temp_secret_key\";", commentId: "cmt-1" },
    { type: "remove", line: 21, text: "  const decoded = jwt.verify(token, tokenSecret);", commentId: "cmt-2" },
    { type: "add",    line: 20, text: "  const tokenSecret = process.env.JWT_SECRET;" },
    { type: "add",    line: 21, text: "  if (!tokenSecret) throw new Error(\"JWT_SECRET not set\");" },
    { type: "add",    line: 22, text: "  const decoded = jwt.verify(token, tokenSecret);" },
    { type: "normal", line: 23, text: "  req.user = decoded;" },
  ],
  "src/components/AnalyticsPanel.tsx": [
    { type: "normal", line: 108, text: "export function AnalyticsPanel({ data }) {" },
    { type: "remove", line: 110, text: "  const sortedMetrics = data.map(d => computeHeavy(d)).sort(…);", commentId: "cmt-3" },
    { type: "add",    line: 110, text: "  const sortedMetrics = useMemo(() => data.map(d => computeHeavy(d)).sort(…), [data]);" },
    { type: "normal", line: 113, text: "  return (" },
    { type: "remove", line: 115, text: "    <div style={{ padding: 24 }}>" },
    { type: "add",    line: 115, text: "    <div className=\"p-6 rounded-xl\">" },
    { type: "normal", line: 116, text: "      <Chart data={sortedMetrics} />" },
    { type: "normal", line: 117, text: "    </div>" },
  ],
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PR WORKSPACE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function PRWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id: prId } = use(params);

  const [loading, setLoading]             = useState(true);
  const [pr, setPr]                       = useState<any>(null);
  const [selectedFile, setSelectedFile]   = useState(Object.keys(MOCK_FILES)[0]);
  const [selectedMode, setSelectedMode]   = useState<string>("DEEP");
  const [triggering, setTriggering]       = useState(false);
  const [appliedPatches, setAppliedPatches] = useState<Record<string, boolean>>({});

  async function loadPR() {
    try {
      const res = await fetch(`/api/pullrequests?id=${prId}`);
      if (res.ok) {
        const data = await res.json();
        setPr(data);
        const firstFile = data.reviews?.[0]?.comments?.[0]?.filePath;
        if (firstFile) setSelectedFile(firstFile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPR(); }, [prId]);

  const handleRunReview = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prId, mode: selectedMode }),
      });
      if (res.ok) {
        const updated = await fetch(`/api/pullrequests?id=${prId}`);
        if (updated.ok) {
          const data = await updated.json();
          setPr(data);
          const lastReview = data.reviews?.[data.reviews.length - 1];
          if (lastReview?.comments?.[0]) setSelectedFile(lastReview.comments[0].filePath);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[--bg-base] pb-12">
        <div className="sticky top-0 z-30 glass-nav px-6 py-4 h-[61px]">
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 grid md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-4">
            <div className="card-surface p-6 space-y-4">
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              <Skeleton className="h-3 w-24 rounded mx-auto" />
            </div>
            <div className="card-surface p-6 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-xl" />)}
            </div>
          </div>
          <div className="md:col-span-8">
            <div className="card-surface h-96 overflow-hidden">
              <div className="h-10 bg-[--bg-elevated] border-b border-[--border-subtle]" />
              <div className="p-4 space-y-2">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-4 rounded" style={{ width: `${40 + Math.random() * 60}%` }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!pr) {
    return (
      <div className="min-h-screen bg-[--bg-base] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-surface p-16 text-center max-w-sm"
        >
          <AlertTriangle className="h-12 w-12 text-[#f59e0b] mx-auto mb-4" />
          <div className="text-[15px] font-bold text-[--text-primary]">PR not found</div>
          <div className="text-[12px] text-[--text-tertiary] mt-2 mb-6">This pull request does not exist or hasn't been synced yet.</div>
          <Link href="/dashboard" className="btn-primary px-5 py-2.5 text-[12px]">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const latestReview = pr.reviews?.[pr.reviews.length - 1];
  const healthScore = latestReview?.healthScore ?? 0;
  const comments = latestReview?.comments ?? [];

  const commentsByFile = comments.reduce((acc: any, c: any) => {
    if (!acc[c.filePath]) acc[c.filePath] = [];
    acc[c.filePath].push(c);
    return acc;
  }, {});

  const activeDiff = MOCK_FILES[selectedFile] ?? MOCK_FILES[Object.keys(MOCK_FILES)[0]];

  return (
    <div className="min-h-screen bg-[--bg-base] pb-24 lg:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-nav px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="btn-secondary p-2 rounded-xl shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="text-[9px] text-[--text-tertiary] uppercase tracking-widest font-mono mb-0.5">
              {pr.repository?.name} / PR #{pr.number}
            </div>
            <h1 className="text-[13px] font-bold text-[--text-primary] truncate max-w-md">{pr.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="input-premium text-[12px] py-2 px-3 w-auto"
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value} className="bg-[#0a0a0f] text-[--text-primary]">
                {m.icon} {m.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunReview}
            disabled={triggering}
            className="btn-primary text-[12px] py-2 px-4"
          >
            {triggering ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            <span>{triggering ? "Analyzing…" : "Run Review"}</span>
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="max-w-6xl mx-auto px-6 mt-8 grid md:grid-cols-12 gap-6 pb-8">
        {/* Left panel */}
        <div className="md:col-span-4 space-y-5">
          {/* Health gauge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-surface p-6 text-center space-y-4"
          >
            <h3 className="text-[10px] uppercase font-bold text-[--text-tertiary] tracking-widest">Health Score</h3>
            <HealthGauge score={healthScore} />
            <div className="text-[11px] text-[--text-tertiary]">
              Decision:{" "}
              <span className={`font-bold ${
                latestReview?.decision === "APPROVED" ? "text-[#10b981]"
                : latestReview?.decision === "CHANGES_REQUESTED" ? "text-[#ef4444]"
                : "text-[--text-secondary]"
              }`}>
                {latestReview?.decision?.replace("_", " ") ?? "PENDING AUDIT"}
              </span>
            </div>
          </motion.div>

          {/* Review summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="card-surface p-5 space-y-4"
          >
            <div className="flex items-center gap-2 text-[12px] font-bold text-[--brand-500]">
              <Cpu className="h-4 w-4" />
              {latestReview?.provider?.name ?? "AI Review Engine"}
            </div>

            <p className="text-[11px] text-[--text-secondary] leading-relaxed">
              {latestReview
                ? healthScore >= 90
                  ? "✓ Code changes follow best practices. Minor suggestions noted but not blocking merge."
                  : "⚠️ Issues detected. Resolve inline suggestions before merging. Critical risks are flagged in the diff."
                : "No review has been run yet. Select a mode and click Run Review to start the AI analysis."}
            </p>

            {latestReview && (
              <div className="flex items-center justify-between text-[10px] text-[--text-tertiary] font-mono pt-2 border-t border-[--border-subtle]">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{latestReview.durationMs}ms</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{latestReview.tokensUsed} tokens</span>
                <span className="text-[#10b981]">${latestReview.cost}</span>
              </div>
            )}
          </motion.div>

          {/* File explorer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="card-surface p-5 space-y-3"
          >
            <h3 className="text-[10px] uppercase font-bold text-[--text-tertiary] tracking-widest">Modified Files</h3>
            <div className="space-y-1">
              {Object.keys(MOCK_FILES).map((file) => {
                const count = commentsByFile[file]?.length ?? 0;
                return (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-[12px] font-medium transition-all ${
                      selectedFile === file
                        ? "bg-[--brand-500]/10 text-[--brand-500] border border-[--brand-500]/20"
                        : "text-[--text-secondary] hover:bg-[--bg-elevated] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCode className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{file.split("/").pop()}</span>
                    </div>
                    {count > 0 && (
                      <span className="h-5 w-5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold flex items-center justify-center shrink-0">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right: diff viewer */}
        <div className="md:col-span-8 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="card-surface overflow-hidden"
          >
            {/* Diff header */}
            <div className="px-4 py-3 bg-[--bg-elevated] border-b border-[--border-subtle] flex items-center justify-between">
              <span className="font-mono text-[12px] font-semibold text-[--text-primary]">{selectedFile}</span>
              <span className="text-[10px] text-[--text-tertiary] font-mono">git diff</span>
            </div>

            {/* Diff content */}
            <div className="font-mono text-[12px] overflow-x-auto">
              {activeDiff.map((lineData, idx) => {
                const isRemoved = lineData.type === "remove";
                const isAdded   = lineData.type === "add";
                const lineComment = comments.find(
                  (c: any) => c.filePath === selectedFile && c.lineNumber === lineData.line
                );
                const isPatchApplied = lineComment ? appliedPatches[lineComment.id] : false;

                if (isPatchApplied && isRemoved) return null;

                const rowClass = isRemoved ? "diff-removed" : isAdded ? "diff-added" : "diff-neutral";
                const prefix   = isRemoved ? "−" : isAdded ? "+" : " ";
                const textColor = isRemoved ? "text-[#ef4444]/80" : isAdded ? "text-[#10b981]/90" : "text-[--text-secondary]";

                return (
                  <div key={idx}>
                    <div className={`flex items-start py-0.5 px-3 hover:bg-white/[0.02] transition-colors ${rowClass}`}>
                      <span className="w-10 text-right pr-3 text-[--text-tertiary] border-r border-[--border-subtle] font-mono text-[10px] select-none shrink-0 pt-0.5">
                        {lineData.line || ""}
                      </span>
                      <span className="w-5 text-center mx-2 text-[10px] select-none shrink-0 pt-0.5 font-bold">
                        {prefix}
                      </span>
                      <span className={`flex-1 whitespace-pre leading-relaxed ${textColor}`}>
                        {isPatchApplied && isAdded ? (lineComment?.suggestion?.split("\n")[0] ?? lineData.text) : lineData.text}
                      </span>
                    </div>

                    {/* Inline suggestion card */}
                    {lineComment && isRemoved && !isPatchApplied && (
                      <div className="px-6 py-4 bg-[--bg-elevated] border-y border-[--border-subtle]">
                        <div className="border border-[#f59e0b]/20 bg-[#f59e0b]/5 rounded-xl p-4 space-y-3 max-w-2xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-[11px]">
                              {lineComment.severity === "SECURITY" && <ShieldAlert className="h-4 w-4 text-[#ef4444]" />}
                              {lineComment.severity === "BUG"      && <Bug        className="h-4 w-4 text-[#f59e0b]" />}
                              {!["SECURITY","BUG"].includes(lineComment.severity) && <Info className="h-4 w-4 text-[--brand-500]" />}
                              <span className="text-[--text-primary] uppercase tracking-wide">
                                {lineComment.severity} · {lineComment.category}
                              </span>
                            </div>
                            <span className="badge badge-gray font-mono text-[10px]">Line {lineComment.lineNumber}</span>
                          </div>

                          <p className="text-[11px] text-[--text-secondary] leading-relaxed">{lineComment.content}</p>

                          {lineComment.suggestion && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold text-[--text-tertiary] uppercase tracking-wider">Suggested Fix</div>
                              <div className="bg-[--bg-base] rounded-lg p-3 border border-[--border-subtle] font-mono text-[10px] text-[#10b981] overflow-x-auto leading-relaxed">
                                {lineComment.suggestion.split("\n").map((l: string, i: number) => (
                                  <div key={i}>+ {l}</div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-[--text-tertiary] italic">Applied client-side only</span>
                            <button
                              onClick={() => setAppliedPatches((p) => ({ ...p, [lineComment.id]: true }))}
                              className="btn-primary text-[11px] px-3 py-1.5"
                            >
                              <Check className="h-3 w-3" />
                              Apply Patch
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Footer actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-surface p-4 flex items-center justify-between gap-4"
          >
            <span className="text-[11px] text-[--text-tertiary]">Review inline comments and apply patches to finalize</span>
            <div className="flex gap-2 shrink-0">
              <button className="btn-secondary text-[12px] px-4 py-2">
                Request Changes
              </button>
              <button className="btn-primary text-[12px] px-4 py-2 bg-[#10b981] hover:bg-[#059669]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

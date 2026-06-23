"use client";

import { useState, useEffect } from "react";
import {
  GitFork,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Check,
  FileCode,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const GitlabIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="m23.905 11.954-2.88-8.86a.715.715 0 0 0-1.36 0L16.8 11.954H7.2L4.335 3.094a.715.715 0 0 0-1.36 0l-2.88 8.86a.742.742 0 0 0 .27.83l11.135 8.1a.885.885 0 0 0 1.04 0l11.135-8.1a.742.742 0 0 0 .27-.83z" />
  </svg>
);

async function logAudit(action: string, details: string) {
  try {
    await fetch("/api/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details }),
    });
  } catch (e) {
    console.error(e);
  }
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function Repositories() {
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [newRepoName, setNewRepoName] = useState("");
  const [newProvider, setNewProvider] = useState("github");
  const [adding, setAdding] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [rulesText, setRulesText] = useState("");
  const [savingRules, setSavingRules] = useState(false);
  const [rulesSuccess, setRulesSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadRepos() {
    try {
      const res = await fetch("/api/repositories");
      if (res.ok) {
        const r = await res.json();
        setRepos(r);
        if (r.length > 0 && !selectedRepo) {
          setSelectedRepo(r[0]);
          setRulesText(r[0].customRules || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRepos(); }, []);

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!newRepoName.includes("/")) {
      setFormError("Use owner/repo format (e.g. facebook/react)");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRepoName, provider: newProvider }),
      });
      if (res.ok) {
        const newRepo = await res.json();
        await logAudit("REPO_CONNECTED", `Connected ${newProvider} repository ${newRepoName}`);
        setNewRepoName("");
        await loadRepos();
        setSelectedRepo(newRepo);
        setRulesText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "true" ? "false" : "true";
    try {
      const res = await fetch("/api/repositories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: nextStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        await logAudit("REPO_STATUS_CHANGE", `Toggled ${updated.name} to ${nextStatus === "true" ? "active" : "inactive"}`);
        await loadRepos();
        if (selectedRepo?.id === id) setSelectedRepo(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRules = async () => {
    if (!selectedRepo) return;
    setSavingRules(true);
    setRulesSuccess(false);
    try {
      const res = await fetch("/api/repositories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRepo.id, customRules: rulesText }),
      });
      if (res.ok) {
        const updated = await res.json();
        await logAudit("REPO_RULES_UPDATE", `Updated custom rules for ${selectedRepo.name}`);
        await loadRepos();
        setSelectedRepo(updated);
        setRulesSuccess(true);
        setTimeout(() => setRulesSuccess(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRules(false);
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[--bg-base] pb-24 lg:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-nav px-6 py-4 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[9px] text-[--text-tertiary] uppercase tracking-widest font-bold mb-0.5">Configuration</div>
          <h1 className="text-[15px] font-bold tracking-tight text-[--text-primary]">Repository Integrations</h1>
        </motion.div>

        <button
          onClick={() => { setLoading(true); loadRepos(); }}
          className="btn-secondary p-2 rounded-xl"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-8 pb-8">
        {loading ? (
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-6 space-y-6">
              <div className="card-surface p-6 space-y-4">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="card-surface p-6 space-y-3">
                <Skeleton className="h-4 w-32 rounded" />
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            </div>
            <div className="md:col-span-6">
              <div className="card-surface p-6 h-96">
                <Skeleton className="h-4 w-48 rounded mb-4" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-12 gap-8"
          >
            {/* Left */}
            <div className="md:col-span-6 space-y-6">
              {/* Connect form */}
              <div className="card-surface p-6 space-y-4">
                <h3 className="text-[13px] font-bold text-[--text-primary] flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[--brand-500]" />
                  Connect Repository
                </h3>

                <form onSubmit={handleAddRepo} className="space-y-4">
                  {/* Provider selector */}
                  <div className="flex gap-2">
                    {["github", "gitlab"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewProvider(p)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 border transition-all ${
                          newProvider === p
                            ? "bg-[--brand-500]/10 border-[--brand-500]/30 text-[--brand-500]"
                            : "bg-[--bg-elevated] border-[--border-subtle] text-[--text-secondary] hover:border-[--border-default]"
                        }`}
                      >
                        {p === "github" ? <GithubIcon className="h-4 w-4" /> : <GitlabIcon className="h-4 w-4 text-orange-500" />}
                        {p === "github" ? "GitHub" : "GitLab"}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="owner/repository-name"
                      value={newRepoName}
                      onChange={(e) => { setNewRepoName(e.target.value); setFormError(""); }}
                      className="input-premium flex-1"
                    />
                    <button type="submit" disabled={adding} className="btn-primary shrink-0 px-4">
                      {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      <span>Connect</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-[11px] text-red-500"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Repository list */}
              <div className="card-surface p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold text-[--text-primary]">
                    Integrations
                    <span className="ml-2 badge badge-gray">{repos.length}</span>
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--text-tertiary]" />
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input-premium pl-8 py-1.5 w-32 text-[12px]"
                    />
                  </div>
                </div>

                {filteredRepos.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-3 text-center">
                    <div className="h-12 w-12 rounded-xl bg-[--bg-elevated] flex items-center justify-center">
                      <Inbox className="h-6 w-6 text-[--text-tertiary] opacity-50" />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-[--text-primary]">No repositories connected</div>
                      <div className="text-[10px] text-[--text-tertiary] mt-0.5">Connect your first repo above</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {filteredRepos.map((repo, i) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => { setSelectedRepo(repo); setRulesText(repo.customRules || ""); }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedRepo?.id === repo.id
                            ? "border-[--brand-500]/30 bg-[--brand-500]/5"
                            : "border-[--border-subtle] hover:border-[--border-default] hover:bg-[--bg-elevated]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {repo.provider === "github" ? (
                            <GithubIcon className="h-4 w-4 text-[--text-tertiary] shrink-0" />
                          ) : (
                            <GitlabIcon className="h-4 w-4 text-orange-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold text-[--text-primary] truncate">{repo.name}</div>
                            <div className="text-[10px] text-[--text-tertiary]">
                              {repo.isActive === "true" ? (
                                <span className="text-[#10b981]">● Active</span>
                              ) : (
                                <span className="text-[--text-tertiary]">○ Inactive</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleActive(repo.id, repo.isActive); }}
                          className="shrink-0"
                          title={repo.isActive === "true" ? "Deactivate" : "Activate"}
                        >
                          {repo.isActive === "true" ? (
                            <ToggleRight className="h-6 w-6 text-[#10b981]" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-[--text-tertiary]" />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Rules editor */}
            <div className="md:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-surface p-6 flex flex-col h-full min-h-96"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[--border-subtle]">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4.5 w-4.5 text-[--brand-500]" />
                    <h3 className="text-[13px] font-bold text-[--text-primary]">Custom Review Standards</h3>
                  </div>
                  {selectedRepo && (
                    <span className="badge badge-blue font-mono text-[10px]">{selectedRepo.name}</span>
                  )}
                </div>

                {selectedRepo ? (
                  <div className="flex flex-col flex-1 gap-4">
                    <p className="text-[11px] text-[--text-tertiary] leading-relaxed">
                      Define coding standards for this repository. The AI engine enforces these on every incoming PR.
                    </p>
                    <textarea
                      value={rulesText}
                      onChange={(e) => setRulesText(e.target.value)}
                      placeholder={`Example rules:\n1. Require JSDoc headers above all exported functions.\n2. All API endpoints must have auth middleware.\n3. Wrap DB mutations in transactions.`}
                      className="input-premium flex-1 min-h-52 resize-none font-mono text-[12px] leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-[--border-subtle]">
                      <span className="text-[10px] text-[--text-tertiary]">Rules stored securely per repository</span>
                      <button
                        onClick={handleSaveRules}
                        disabled={savingRules}
                        className="btn-primary px-4 py-2 text-[12px]"
                      >
                        {savingRules ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : rulesSuccess ? (
                          <Check className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        <span>{savingRules ? "Saving..." : rulesSuccess ? "Saved!" : "Save Rules"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
                    <div className="h-14 w-14 rounded-2xl bg-[--bg-elevated] flex items-center justify-center">
                      <GitFork className="h-7 w-7 text-[--text-tertiary] opacity-40" />
                    </div>
                    <div className="text-[12px] font-semibold text-[--text-primary]">Select a repository</div>
                    <div className="text-[11px] text-[--text-tertiary]">Choose a repository from the left to edit its review standards</div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

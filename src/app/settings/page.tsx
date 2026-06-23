"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Key,
  Lock,
  User,
  Save,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [keysInput, setKeysInput] = useState<Record<string, string>>({});
  const [modelNames, setModelNames] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
  const [profileSaved, setProfileSaved] = useState(false);

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const provs = await res.json();
        setProviders(provs);
        const inputs: Record<string, string> = {};
        const models: Record<string, string> = {};
        provs.forEach((p: any) => {
          inputs[p.id] = p.apiKeySecure ? "••••••••••••••••" : "";
          models[p.id] = p.modelName;
        });
        setKeysInput(inputs);
        setModelNames(models);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSettings(); }, []);

  const handleToggleProvider = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      if (res.ok) {
        await logAudit("PROVIDER_TOGGLED", `Toggled provider ${id}`);
        await loadSettings();
      }
    } catch (e) { console.error(e); }
  };

  const handleToggleFallback = async (id: string, currentFallback: boolean) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFallback: !currentFallback }),
      });
      if (res.ok) await loadSettings();
    } catch (e) { console.error(e); }
  };

  const handleSaveProvider = async (id: string) => {
    setSavingId(id);
    setSaveSuccess((prev) => ({ ...prev, [id]: false }));
    const keyVal = keysInput[id];
    const payload: any = { id, modelName: modelNames[id] };
    if (keyVal && keyVal !== "••••••••••••••••") payload.apiKeySecure = keyVal;
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await logAudit("PROVIDER_KEYS_SAVED", `Updated ${id} model/key config`);
        await loadSettings();
        setSaveSuccess((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => setSaveSuccess((prev) => ({ ...prev, [id]: false })), 2500);
      }
    } catch (e) { console.error(e); }
    finally { setSavingId(null); }
  };

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[--bg-base] pb-24 lg:pb-12">
      <header className="sticky top-0 z-30 glass-nav px-6 py-4">
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[9px] text-[--text-tertiary] uppercase tracking-widest font-bold mb-0.5">Preferences</div>
          <h1 className="text-[15px] font-bold tracking-tight text-[--text-primary]">Settings</h1>
        </motion.div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-8 pb-8">
        {loading ? (
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-4">
              <div className="card-surface p-6 space-y-3">
                <Skeleton className="h-4 w-28 rounded" />
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
              </div>
            </div>
            <div className="md:col-span-8 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="card-surface p-6 space-y-4">
                  <Skeleton className="h-4 w-48 rounded" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-12 gap-8"
          >
            {/* Left: Profile */}
            <div className="md:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="card-surface p-6 space-y-4"
              >
                <h3 className="text-[13px] font-bold text-[--text-primary] flex items-center gap-2">
                  <User className="h-4 w-4 text-[--brand-500]" />
                  User Profile
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[--text-tertiary] font-bold uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your name"
                      className="input-premium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[--text-tertiary] font-bold uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="input-premium"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary w-full justify-center py-2.5 text-[12px] mt-2"
                  >
                    {profileSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    <span>{profileSaved ? "Saved!" : "Save Profile"}</span>
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="card-surface p-5 space-y-2"
              >
                <div className="flex items-center gap-2 text-[#f59e0b] font-semibold text-[12px]">
                  <AlertCircle className="h-4 w-4" />
                  Simulator Mode
                </div>
                <p className="text-[11px] text-[--text-tertiary] leading-relaxed">
                  Without provider API keys, the platform uses an offline rule-based scanner. Supply keys above to enable full AI reviews.
                </p>
              </motion.div>
            </div>

            {/* Right: Providers */}
            <div className="md:col-span-8 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-[--brand-500]" />
                <h2 className="text-[13px] font-bold text-[--text-primary]">LLM Provider Configuration</h2>
              </div>

              {providers.length === 0 ? (
                <div className="card-surface p-10 text-center">
                  <div className="text-[12px] text-[--text-tertiary]">No providers configured</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {providers.map((p, i) => {
                    const isSaving = savingId === p.id;
                    const isSuccess = saveSuccess[p.id];
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="card-surface p-5 space-y-4"
                      >
                        {/* Provider header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-2 w-2 rounded-full ${p.isActive ? "bg-[#10b981]" : "bg-[--text-tertiary]"}`} />
                            <span className="text-[13px] font-bold text-[--text-primary]">{p.name}</span>
                            {p.isActive && <span className="badge badge-green text-[10px]">Active</span>}
                            {p.isFallback && <span className="badge badge-blue text-[10px]">Fallback</span>}
                          </div>

                          <div className="flex items-center gap-4 text-[11px] text-[--text-tertiary]">
                            <div className="flex items-center gap-1.5">
                              <span>Router</span>
                              <button onClick={() => handleToggleProvider(p.id, p.isActive)}>
                                {p.isActive
                                  ? <ToggleRight className="h-5 w-5 text-[#10b981]" />
                                  : <ToggleLeft className="h-5 w-5 text-[--text-tertiary]" />}
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>Fallback</span>
                              <button onClick={() => handleToggleFallback(p.id, p.isFallback)}>
                                {p.isFallback
                                  ? <ToggleRight className="h-5 w-5 text-[--brand-500]" />
                                  : <ToggleLeft className="h-5 w-5 text-[--text-tertiary]" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Input fields */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[--text-tertiary] font-bold uppercase tracking-wider">Model Name</label>
                            <input
                              type="text"
                              value={modelNames[p.id] || ""}
                              onChange={(e) => setModelNames((prev) => ({ ...prev, [p.id]: e.target.value }))}
                              className="input-premium font-mono text-[12px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[--text-tertiary] font-bold uppercase tracking-wider">API Key</label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--text-tertiary]" />
                              <input
                                type="password"
                                value={keysInput[p.id] || ""}
                                onChange={(e) => setKeysInput((prev) => ({ ...prev, [p.id]: e.target.value }))}
                                placeholder="Not configured"
                                className="input-premium pl-9 font-mono text-[12px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleSaveProvider(p.id)}
                            disabled={isSaving}
                            className="btn-secondary text-[12px] px-4 py-2"
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isSuccess ? (
                              <Check className="h-3.5 w-3.5 text-[#10b981]" />
                            ) : (
                              <Lock className="h-3.5 w-3.5" />
                            )}
                            <span>{isSaving ? "Saving..." : isSuccess ? "Saved!" : "Save Config"}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

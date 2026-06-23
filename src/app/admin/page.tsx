"use client";

import { useState, useEffect } from "react";
import { 
  Lock, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Coins, 
  ShieldCheck, 
  UserX,
  TrendingUp,
  Loader2,
  RefreshCw
} from "lucide-react";

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

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [mrr, setMrr] = useState(489); // Mock monthly recurring revenue
  
  // Mock system errors list
  const [systemErrors, setSystemErrors] = useState<any[]>([
    { id: "err-1", source: "Groq API Router", msg: "API Rate limit reached - Falling back to Gemini", time: "10 mins ago" },
    { id: "err-2", source: "GitHub Webhook API", msg: "Invalid HMAC signature header verified - Refused trigger", time: "1 hr ago" },
    { id: "err-3", source: "Database Connector", msg: "Query pool load high (>80% capacity) - Auto-recovering", time: "2 hrs ago" }
  ]);

  async function loadAdminData() {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
        setProviders(json.providers || []);
      }
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleGlobalProviderChange = async (id: string) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: true }),
      });
      if (res.ok) {
        await logAudit("ADMIN_GLOBAL_PROVIDER_CHANGE", `SuperAdmin toggled global active AI provider to ${id}`);
        await loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearErrors = () => {
    setSystemErrors([]);
  };

  if (loading) {
    return (
      <div className="pl-0 lg:pl-64 min-h-screen bg-[#f3f4f6] dark:bg-[#050507] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="text-xs text-gray-500 font-mono">Loading Admin Control Panel...</span>
        </div>
      </div>
    );
  }

  const activeProvider = providers.find(p => p.isActive) || providers[0];

  return (
    <div className="pl-0 lg:pl-64 min-h-screen bg-[#f3f4f6] dark:bg-[#050507] pb-12 transition-all duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/40 dark:bg-[#050507]/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Internal Operations Console</div>
          <h1 className="text-lg font-bold tracking-tight text-gray-800 dark:text-white">Admin Control Panel</h1>
        </div>
      </header>

      {/* Grid Content */}
      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-purple-600/10 dark:bg-purple-600/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <Coins className="h-5 w-5" />
            </div>
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Connected MRR</div>
            <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">${mrr}</div>
            <div className="text-[9px] text-purple-500 font-semibold mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+18% month-over-month</span>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 dark:bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Active Engine</div>
            <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1 truncate">{activeProvider?.name.split(" ")[0]}</div>
            <div className="text-[9px] text-gray-400 mt-1 font-mono">{activeProvider?.modelName}</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-red-600/10 dark:bg-red-600/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Critical Errors</div>
            <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">{systemErrors.length}</div>
            <div className="text-[9px] text-red-500 font-semibold mt-1">Requires review check</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-green-600/10 dark:bg-green-600/10 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">System Status</div>
            <div className="text-2xl font-extrabold text-green-500 mt-1">99.98%</div>
            <div className="text-[9px] text-green-500 font-semibold mt-1">All engines healthy</div>
          </div>

        </div>

        {/* Global LLM Router Switcher */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center">
            <Cpu className="h-4.5 w-4.5 mr-2 text-blue-500" />
            <span>Global AI Provider Routing (SuperAdmin overrides)</span>
          </h3>
          <p className="text-xs text-gray-400 max-w-2xl leading-normal">
            Force all workspace audits across tenants to use a single designated model provider, overriding individual organization keys.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {providers.map((p) => (
              <div 
                key={p.id} 
                onClick={() => handleGlobalProviderChange(p.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between h-28 ${
                  p.isActive 
                    ? "border-blue-500 bg-blue-500/5 text-white" 
                    : "border-white/5 bg-white/5 text-gray-400 hover:border-white/10 hover:text-white"
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[9px] text-gray-500 font-mono mt-1">{p.modelName}</div>
                </div>
                {p.isActive && (
                  <span className="text-[8px] bg-green-500/15 text-green-500 font-extrabold px-1.5 py-0.5 rounded self-start uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Errors Log list & Audit Logs */}
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Errors Log */}
          <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center">
                <AlertTriangle className="h-4.5 w-4.5 mr-2 text-red-500 animate-pulse" />
                <span>Live System Error Feed</span>
              </h3>
              {systemErrors.length > 0 && (
                <button 
                  onClick={handleClearErrors}
                  className="text-[10px] text-gray-400 hover:text-white transition-colors"
                >
                  Clear Feed
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {systemErrors.length > 0 ? (
                systemErrors.map((err) => (
                  <div key={err.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-red-400 font-bold font-mono">
                      <span>{err.source}</span>
                      <span>{err.time}</span>
                    </div>
                    <p className="text-gray-300 leading-normal">{err.msg}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-gray-500 text-xs">
                  ✓ No system warning triggers compiled.
                </div>
              )}
            </div>
          </div>

          {/* Audit Logs ledger */}
          <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center">
                <Activity className="h-4.5 w-4.5 mr-2 text-blue-500" />
                <span>Global Audit Ledger (Last 10 Actions)</span>
              </h3>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex justify-between items-start text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{log.action}</div>
                    <div className="text-[10px] text-gray-500 leading-relaxed">{log.details}</div>
                  </div>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

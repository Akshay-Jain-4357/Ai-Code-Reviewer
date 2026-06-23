"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  Trash2, 
  Check, 
  Loader2, 
  CheckCircle2,
  Clock,
  UserPlus
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

export default function TeamManagement() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("DEVELOPER");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Pending invites mock list
  const [pendingInvites, setPendingInvites] = useState<any[]>([
    { id: "inv-1", email: "james@acme.com", role: "DEVELOPER", expires: "Expires in 3 days" },
    { id: "inv-2", email: "clara@acme.com", role: "TEAM_ADMIN", expires: "Expires in 5 days" }
  ]);

  useEffect(() => {
    async function loadTeamData() {
      try {
        const res = await fetch("/api/teams");
        if (res.ok) {
          const json = await res.json();
          const users = json.users || [];
          const t = json.teams || [];
          
          const formattedMembers = users.map((u: any, idx: number) => ({
            id: u.id,
            name: u.name || "Alex Rivera",
            email: u.email,
            avatarUrl: u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            role: idx === 0 ? "ORG_OWNER" : "DEVELOPER",
            status: "Active"
          }));

          setMembers(formattedMembers);
          setTeams(t);
        }
      } catch (e) {
        console.error("Failed to load team:", e);
      } finally {
        setLoading(false);
      }
    }
    loadTeamData();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteSuccess(false);

    // Simulate sending email api wait
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add to pending invites
    const newInv = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      expires: "Expires in 7 days"
    };

    setPendingInvites(prev => [...prev, newInv]);
    await logAudit("USER_INVITED", `Sent organization invite to ${inviteEmail} (Role: ${inviteRole})`);

    setInviteEmail("");
    setInviting(false);
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 2500);
  };

  const handleRevokeInvite = async (id: string, email: string) => {
    setPendingInvites(prev => prev.filter(inv => inv.id !== id));
    await logAudit("INVITE_REVOKED", `Revoked organization invitation for ${email}`);
  };

  const handleRemoveMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from this organization?`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
      await logAudit("MEMBER_REMOVED", `Removed team member ${name} from workspace`);
    }
  };

  if (loading) {
    return (
      <div className="pl-0 lg:pl-64 min-h-screen bg-[#f3f4f6] dark:bg-[#050507] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="text-xs text-gray-500 font-mono">Loading Team Roster...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-0 lg:pl-64 min-h-screen bg-[#f3f4f6] dark:bg-[#050507] pb-12 transition-all duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/40 dark:bg-[#050507]/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Workspace Directory</div>
          <h1 className="text-lg font-bold tracking-tight text-gray-800 dark:text-white">Team Management</h1>
        </div>
      </header>

      {/* Grid Content */}
      <div className="max-w-6xl mx-auto px-6 mt-8 grid md:grid-cols-12 gap-8">
        
        {/* Left Side: Member Roster List */}
        <div className="md:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center">
                <Users className="h-4.5 w-4.5 mr-2 text-blue-500" />
                <span>Active Members ({members.length})</span>
              </h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded-full">
                4 seats remaining
              </span>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-white/5">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group">
                  <div className="flex items-center space-x-3">
                    <img src={m.avatarUrl} alt={m.name} className="h-9 w-9 rounded-lg object-cover ring-2 ring-white/10" />
                    <div>
                      <div className="text-xs font-semibold text-gray-800 dark:text-white flex items-center">
                        <span>{m.name}</span>
                        {m.role === "ORG_OWNER" && (
                          <span className="ml-2 text-[8px] bg-blue-500/15 text-blue-500 border border-blue-500/20 font-bold px-1.5 py-0.2 rounded uppercase">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{m.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Role descriptor */}
                    <span className="text-[10px] text-gray-500 capitalize flex items-center font-mono">
                      <Shield className="h-3 w-3 mr-1 text-gray-500" />
                      {m.role.replace("ORG_", "").replace("_", " ")}
                    </span>

                    {m.role !== "ORG_OWNER" && (
                      <button
                        onClick={() => handleRemoveMember(m.id, m.name)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        title="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Invite Panel & Pending Invites */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Invite Member form */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center mb-4">
              <UserPlus className="h-4.5 w-4.5 mr-2 text-blue-500" />
              <span>Invite Member</span>
            </h3>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    placeholder="engineer@acme.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Security Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  <option value="DEVELOPER">Developer (Scan access)</option>
                  <option value="TEAM_ADMIN">Team Admin (Manage configurations)</option>
                  <option value="ORG_OWNER">Organization Owner (Billing & Super)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-md shadow-blue-500/10"
              >
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : inviteSuccess ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{inviting ? "Sending Invite..." : inviteSuccess ? "Invitation Sent!" : "Send Invite"}</span>
              </button>
            </form>
          </div>

          {/* Pending Invites ticker list */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
            <h3 className="font-bold text-xs uppercase text-gray-400 dark:text-gray-500 tracking-wider">Pending Invites</h3>
            
            <div className="space-y-3">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs group">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{inv.email}</div>
                    <div className="text-[9px] text-gray-400 mt-1 flex items-center font-mono">
                      <Clock className="h-3 w-3 mr-1" />
                      {inv.expires}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{inv.role.replace("TEAM_", "")}</span>
                    <button
                      onClick={() => handleRevokeInvite(inv.id, inv.email)}
                      className="p-1 rounded text-gray-500 hover:text-red-500 transition-colors"
                      title="Revoke invitation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GitPullRequest,
  History,
  Settings,
  CreditCard,
  Users,
  Lock,
  LogOut,
  Sparkles,
  GitFork,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { name: "Dashboard",      href: "/dashboard",    icon: LayoutDashboard, shortcut: "⌘D" },
  { name: "Integrations",   href: "/repositories", icon: GitFork,         shortcut: "⌘I" },
  { name: "PR Workspace",   href: "/pr/pr-1",      icon: GitPullRequest,  shortcut: "⌘P" },
  { name: "Review History", href: "/history",      icon: History,         shortcut: "⌘H" },
];

const SECONDARY_ITEMS = [
  { name: "Settings",    href: "/settings", icon: Settings,    shortcut: "⌘," },
  { name: "Pricing",     href: "/pricing",  icon: CreditCard },
  { name: "Team",        href: "/teams",    icon: Users },
  { name: "Admin",       href: "/admin",    icon: Lock },
];

const NO_SIDEBAR_PATHS = ["/", "/login", "/signup", "/pricing"];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [orgName, setOrgName] = useState("Your Organization");

  // Fetch org data from API for real display
  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.org?.name) setOrgName(d.org.name);
      })
      .catch(() => {});
  }, []);

  if (NO_SIDEBAR_PATHS.includes(pathname)) return null;

  const handleLogout = () => router.push("/");

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col h-screen sticky top-0 z-40 glass-sidebar shrink-0 overflow-hidden"
      >
        {/* macOS window controls */}
        <div className="flex items-center px-4 pt-4 pb-3 gap-2 shrink-0">
          <button
            onClick={handleLogout}
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-90 transition-all"
            title="Sign Out"
          />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-90 transition-all"
            title={collapsed ? "Expand" : "Collapse"}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="ml-2 text-[10px] text-[--text-tertiary] font-mono tracking-wide"
              >
                reviewer.ai
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Brand */}
        <div className="px-3 mb-4 shrink-0">
          <div className={`flex items-center gap-3 p-2.5 rounded-xl bg-[#4f6ef7]/10 border border-[#4f6ef7]/15 transition-all ${collapsed ? "justify-center" : ""}`}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#4f6ef7] to-[#7c3aed] flex items-center justify-center shrink-0 shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="text-[13px] font-semibold tracking-tight text-[--text-primary] whitespace-nowrap">Reviewer.AI</div>
                  <div className="text-[10px] text-[--brand-500] font-medium whitespace-nowrap">v2.0 · Pro Plan</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Org badge */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 mb-4 shrink-0"
            >
              <div className="text-[9px] uppercase tracking-widest font-bold text-[--text-tertiary] mb-1.5 px-2">Organization</div>
              <div className="w-full bg-[--bg-surface] border border-[--border-subtle] rounded-lg py-2 px-3 text-[12px] text-[--text-secondary] font-medium truncate">
                {orgName}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {!collapsed && (
            <div className="text-[9px] uppercase tracking-widest font-bold text-[--text-tertiary] px-2 mb-2">
              Workspace
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/pr/pr-1" && pathname.startsWith("/pr/")) ||
              (item.href !== "/dashboard" && item.href !== "/pr/pr-1" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 relative ${
                  isActive
                    ? "bg-[#4f6ef7]/10 text-[--brand-500]"
                    : "text-[--text-secondary] hover:bg-[--bg-surface] hover:text-[--text-primary]"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-xl bg-[#4f6ef7]/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-4 w-4 shrink-0 relative z-10 ${isActive ? "text-[--brand-500]" : "text-[--text-tertiary] group-hover:text-[--text-primary]"}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 flex-1 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.shortcut && (
                  <span className="text-[10px] text-[--text-tertiary] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.shortcut}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-[--border-subtle]" />

          {!collapsed && (
            <div className="text-[9px] uppercase tracking-widest font-bold text-[--text-tertiary] px-2 mb-2">
              More
            </div>
          )}

          {SECONDARY_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#4f6ef7]/10 text-[--brand-500]"
                    : "text-[--text-tertiary] hover:bg-[--bg-surface] hover:text-[--text-primary]"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 pb-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] text-[--text-tertiary] hover:bg-[--bg-surface] hover:text-[--text-primary] transition-all ${collapsed ? "justify-center" : ""}`}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>

        {/* User card */}
        <div className="px-3 pb-4 pt-2 border-t border-[--border-subtle] shrink-0">
          <div className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-[--bg-surface] transition-all ${collapsed ? "justify-center" : ""}`}>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[--brand-500] to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              U
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <div className="text-[12px] font-semibold text-[--text-primary] truncate">Your Account</div>
                  <div className="text-[10px] text-[--text-tertiary] truncate">Signed In</div>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[--text-tertiary] hover:text-red-500 hover:bg-red-500/10 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

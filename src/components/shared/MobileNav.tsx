"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitFork, GitPullRequest, History, Settings } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { name: "Home",     href: "/dashboard",    icon: LayoutDashboard },
  { name: "Repos",    href: "/repositories", icon: GitFork },
  { name: "PRs",      href: "/pr/pr-1",      icon: GitPullRequest },
  { name: "History",  href: "/history",      icon: History },
  { name: "Settings", href: "/settings",     icon: Settings },
];

const NO_NAV_PATHS = ["/", "/login", "/signup", "/pricing"];

export default function MobileNav() {
  const pathname = usePathname();

  if (NO_NAV_PATHS.includes(pathname)) return null;

  return (
    <nav className="mobile-nav lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-xl bg-[--brand-500]/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`h-5 w-5 relative z-10 transition-colors ${
                  isActive ? "text-[--brand-500]" : "text-[--text-tertiary]"
                }`}
              />
              <span
                className={`text-[10px] font-medium relative z-10 ${
                  isActive ? "text-[--brand-500]" : "text-[--text-tertiary]"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

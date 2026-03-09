"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/projects", label: "Projects", icon: "🏗️" },
  { href: "/projects/pipeline", label: "Pipeline", icon: "📋" },
  { href: "/organizations", label: "Organizations", icon: "🏢" },
  { href: "/contacts", label: "Contacts", icon: "👤" },
  { href: "/opportunities", label: "Opportunities", icon: "💰" },
  { href: "/outreach", label: "Outreach", icon: "📧" },
  { href: "/sources", label: "Sources", icon: "📡" },
  { href: "/newsletter", label: "Newsletter", icon: "📰" },
  { href: "/compliance", label: "Compliance", icon: "🛡️" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-sidebar-bg flex flex-col z-30">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Meridian Cap
        </h1>
        <p className="text-xs text-sidebar-text mt-0.5">Capital Placement Engine</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-active/15 text-white font-medium"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-xs text-sidebar-text/60">v0.8.0 — Sprint 8</p>
      </div>
    </aside>
  );
}

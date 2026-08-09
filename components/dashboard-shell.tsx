"use client";

import {
  BarChart3,
  Building2,
  Database,
  Grid2X2,
  HeartPulse,
  Menu,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";

const navigation = [
  { href: "/", label: "Overview", icon: Grid2X2 },
  { href: "/workforce", label: "Workforce", icon: UsersRound },
  { href: "/organization", label: "Organization", icon: Building2 },
  { href: "/lifecycle", label: "Lifecycle", icon: HeartPulse },
  { href: "/employees", label: "Employees", icon: BarChart3 },
  { href: "/data-hub", label: "Data hub", icon: Database },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function searchEmployees(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/employees?search=${encodeURIComponent(query)}`);
  }

  return (
    <div className="dashboard-frame">
      <button
        aria-label="Close navigation"
        className={`sidebar-scrim ${navigationOpen ? "is-visible" : ""}`}
        onClick={() => setNavigationOpen(false)}
        type="button"
      />

      <aside className={`sidebar ${navigationOpen ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark">W</div>
          <div>
            <strong>Workforce</strong>
            <span>Intelligence</span>
          </div>
          <button
            aria-label="Close navigation"
            className="sidebar-close"
            onClick={() => setNavigationOpen(false)}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Dashboard navigation">
          <p className="nav-eyebrow">Workspace</p>
          <div className="nav-list">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`nav-link ${active ? "active" : ""}`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setNavigationOpen(false)}
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

      </aside>

      <main className="main-shell">
        <header className="topbar">
          <button
            aria-label="Open navigation"
            className="menu-button"
            onClick={() => setNavigationOpen(true)}
            type="button"
          >
            <Menu size={20} />
          </button>
          <form aria-label="Search employee records" className="search-box" onSubmit={searchEmployees} role="search">
            <button aria-label="Run employee search" className="global-search-submit" type="submit">
              <Search aria-hidden="true" size={17} />
            </button>
            <input
              aria-label="Search employees"
              maxLength={80}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search ID, role, function…"
              value={searchQuery}
            />
          </form>
          <div aria-label="Workspace user" className="avatar">
            HR
          </div>
        </header>

        <div className="page-canvas" key={pathname}>
          {children}
        </div>
      </main>
    </div>
  );
}

"use client";

import {
  BarChart3,
  BookOpen,
  Building2,
  Database,
  Grid2X2,
  HeartPulse,
  Menu,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

const navigation = [
  { href: "/", label: "Overview", icon: Grid2X2 },
  { href: "/workforce", label: "Workforce", icon: UsersRound },
  { href: "/organization", label: "Organization", icon: Building2 },
  { href: "/lifecycle", label: "Lifecycle", icon: HeartPulse },
  { href: "/quality", label: "Data quality", icon: ShieldCheck },
  { href: "/employees", label: "Employees", icon: BarChart3 },
  { href: "/data-hub", label: "Data hub", icon: Database },
  { href: "/field-guide", label: "Field guide", icon: BookOpen },
];

const filterOptions = {
  Function: ["All", "Finance", "HR", "IT", "Manufacturing", "Sales"],
  Location: ["All", "Bengaluru", "Chennai", "Jaipur", "Nashik", "Pune"],
  "Employee group": ["All", "Direct", "Indirect"],
  Gender: ["All", "F", "M"],
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navigationOpen, setNavigationOpen] = useState(false);

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
          <label className="search-box">
            <Search aria-hidden="true" size={17} />
            <input aria-label="Search employees" placeholder="Search ID, role, function…" />
          </label>
          <div className="record-summary">
            <strong>100</strong> of 100 records
          </div>
          <div aria-label="Workspace user" className="avatar">
            HR
          </div>
        </header>

        <section aria-label="Dashboard filters" className="filterbar">
          {Object.entries(filterOptions).map(([label, options]) => (
            <label className="filter-control" key={label}>
              <span>{label}</span>
              <select aria-label={label} defaultValue="All">
                {options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
        </section>

        <div className="page-canvas" key={pathname}>
          {children}
        </div>
      </main>
    </div>
  );
}

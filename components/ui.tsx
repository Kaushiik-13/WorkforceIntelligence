import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="page-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action ? <div className="page-action">{action}</div> : null}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  note,
  tone = "navy",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "navy" | "coral" | "green" | "yellow";
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span className="metric-corner" />
      <div className="metric-content">
        <span className="metric-label">{label}</span>
        <strong>{value}</strong>
        <p>{note}</p>
      </div>
    </article>
  );
}

export function Panel({
  title,
  subtitle,
  badge,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {badge ? <span className="panel-badge">{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function ActionButton({ children, variant = "outline" }: { children: ReactNode; variant?: "outline" | "primary" }) {
  return (
    <button className={`action-button ${variant}`} type="button">
      {children}
    </button>
  );
}

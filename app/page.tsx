import { Sparkles } from "lucide-react";

import { EmployeeGroupDonut, FunctionBarChart, JoiningCohortChart } from "@/components/charts";
import { MetricCard, PageHeader, Panel } from "@/components/ui";

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        action={<div className="live-pill"><span />Live dataset · 100 records</div>}
        description="A decision-ready view of composition, lifecycle risk, and employee-master quality."
        eyebrow="Executive view"
        title="Workforce at a glance"
      />

      <section className="metric-grid metric-grid-four">
        <MetricCard label="Distinct headcount" note="Counted by Personnel Number" value="100" />
        <MetricCard label="Direct workforce" note="44 of 100 filtered records" tone="coral" value="44%" />
        <MetricCard label="Average age" note="Derived from Birth date" tone="green" value="43.7 yrs" />
        <MetricCard label="Retirement in 5 yrs" note="Planned retirement exposure" tone="yellow" value="18" />
      </section>

      <section className="overview-primary-grid">
        <Panel badge="5 functions" subtitle="The most reliable organizational view in this dataset" title="Headcount by function">
          <FunctionBarChart />
        </Panel>
        <Panel subtitle="Source-system Direct / Indirect mix" title="Employee group">
          <EmployeeGroupDonut />
          <div className="compact-legend">
            <div><span className="legend-dot coral" />Indirect <strong>56%</strong></div>
            <div><span className="legend-dot navy" />Direct <strong>44%</strong></div>
          </div>
        </Panel>
      </section>

      <section className="overview-secondary-grid">
        <Panel subtitle="Records by joining year; this is not recruitment performance" title="Joining cohorts">
          <JoiningCohortChart />
        </Panel>
        <aside className="insight-card">
          <div className="insight-icon"><Sparkles size={20} /></div>
          <p className="insight-eyebrow">Insight brief</p>
          <h2>Sales is the largest function</h2>
          <p>31 employees, representing 31% of the filtered workforce.</p>
          <div className="insight-divider" />
          <h3>25 records need attention</h3>
          <p>Most issues are created by unrealistic age-at-joining values. Treat tenure as illustrative until corrected.</p>
        </aside>
      </section>
    </>
  );
}

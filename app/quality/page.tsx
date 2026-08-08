import { Building2, Database, UsersRound } from "lucide-react";

import { IssueBarChart, QualityDonut } from "@/components/charts";
import { PageHeader, Panel } from "@/components/ui";

const warningCards = [
  { label: "Organizational Units", value: 96, icon: Building2, note: "96% unique · Nearly one unit per employee limits meaningful team analysis." },
  { label: "Cost Centres", value: 100, icon: Database, note: "100% unique · Codes can support audit, but not cost analysis without amounts." },
  { label: "Primary HRBP IDs", value: 68, icon: UsersRound, note: "68% unique · Coverage is fragmented; role definitions must be confirmed." },
];

const reviewRows = Array.from({ length: 12 }, (_, index) => ({
  personnel: String(100000 + index),
  function: "Sales",
  age: 16,
  issue: "Joined before age 18",
}));

export default function QualityPage() {
  return (
    <>
      <PageHeader
        description="Validation rules reveal unrealistic dates, suspicious uniqueness, and fields that cannot support conclusions."
        eyebrow="Data confidence"
        title="Trust the data before the chart"
      />

      <section className="quality-summary-grid">
        <section className="panel score-panel">
          <QualityDonut />
          <div className="score-copy">
            <p className="page-eyebrow">Quality score</p>
            <h2>Usable with warnings</h2>
            <p>25 of 100 records trigger at least one validation rule.</p>
          </div>
        </section>
        <Panel subtitle="Rule failures across the filtered records" title="Issue distribution">
          <IssueBarChart />
        </Panel>
      </section>

      <Panel className="structural-panel" subtitle="High uniqueness can make a field unsuitable for aggregation" title="Structural warnings">
        <div className="warning-card-grid">
          {warningCards.map((item) => {
            const Icon = item.icon;
            return (
              <article className="warning-card" key={item.label}>
                <div className="warning-card-top">
                  <span className="warning-icon"><Icon size={18} /></span>
                  <div><p>{item.label}</p><strong>{item.value}<small>/100</small></strong></div>
                </div>
                <span className="warning-progress"><i style={{ width: `${item.value}%` }} /></span>
                <em>{item.note}</em>
              </article>
            );
          })}
        </div>
      </Panel>

      <Panel className="review-panel" subtitle="Dates and identifiers are masked to the minimum needed for investigation" title="Records needing review">
        <div className="table-scroll">
          <table className="data-table review-table">
            <thead><tr><th>Personnel No.</th><th>Function</th><th>Age at joining</th><th>Issue</th><th>Status</th></tr></thead>
            <tbody>
              {reviewRows.map((row) => (
                <tr key={row.personnel}>
                  <td className="mono">{row.personnel}</td><td>{row.function}</td><td>{row.age}</td><td>{row.issue}</td>
                  <td><span className="status-badge">Review</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">Showing 12 of 25 flagged records.</p>
      </Panel>
    </>
  );
}

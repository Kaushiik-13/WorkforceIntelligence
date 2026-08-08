import { AlertTriangle } from "lucide-react";

import { AgeBandChart, JoiningCohortChart, TenureBandChart } from "@/components/charts";
import { MetricCard, PageHeader, Panel } from "@/components/ui";

const pipeline = [
  { label: "10+ years", value: 63, tone: "coral" },
  { label: "0–5 years", value: 18, tone: "navy" },
  { label: "6–10 years", value: 13, tone: "green" },
  { label: "Past date", value: 6, tone: "yellow" },
];

export default function LifecyclePage() {
  return (
    <>
      <PageHeader
        description="Derived metrics from birth, joining, and retirement dates—with quality warnings kept visible."
        eyebrow="People lifecycle"
        title="Age, tenure & retirement"
      />

      <div className="warning-banner">
        <AlertTriangle aria-hidden="true" size={20} />
        <div><strong>Tenure needs a quality caveat</strong><p>24 filtered records show joining before age 18. Charts remain visible, but should be treated as illustrative.</p></div>
      </div>

      <section className="metric-grid metric-grid-three">
        <MetricCard label="Average tenure" note="Derived from joining date" value="22.0 yrs" />
        <MetricCard label="Underage joins" note="Age at joining below 18" tone="coral" value="24" />
        <MetricCard label="Retirement ≤ 5 yrs" note="Planned retirement date" tone="yellow" value="18" />
      </section>

      <section className="lifecycle-grid">
        <Panel subtitle="Age as of today" title="Age bands"><AgeBandChart /></Panel>
        <Panel subtitle="Approximate length of service" title="Tenure bands"><TenureBandChart /></Panel>
        <Panel subtitle="Years remaining to planned retirement" title="Retirement pipeline">
          <div className="pipeline-list">
            {pipeline.map((item) => (
              <div className="pipeline-row" key={item.label}>
                <div><span className={`legend-dot ${item.tone}`} />{item.label}<strong>{item.value}</strong></div>
                <span className="pipeline-track"><i className={item.tone} style={{ width: `${item.value}%` }} /></span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="lifecycle-trend">
        <Panel subtitle="Historical join records—not hiring funnel data" title="Joining cohort trend">
          <JoiningCohortChart expanded />
        </Panel>
      </section>
    </>
  );
}

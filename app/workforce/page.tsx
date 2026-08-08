import { GenderDonut, WorkforceStackedChart } from "@/components/charts";
import { PageHeader, Panel } from "@/components/ui";

export default function WorkforcePage() {
  return (
    <>
      <PageHeader
        description="Compare functions, locations, employee groups, roles, and gender representation."
        eyebrow="Composition"
        title="How the workforce is shaped"
      />
      <section className="workforce-grid">
        <Panel subtitle="Useful as a source classification; confirm company rules before interpreting operations" title="Direct / Indirect by function">
          <WorkforceStackedChart />
          <div className="chart-legend centered">
            <span><i className="legend-dot coral" />Direct</span>
            <span><i className="legend-dot navy" />Indirect</span>
          </div>
        </Panel>
        <Panel subtitle="Aggregated F / M values from the source" title="Gender representation">
          <GenderDonut />
          <div className="compact-legend">
            <div><span className="legend-dot coral" />Male <strong>52</strong></div>
            <div><span className="legend-dot navy" />Female <strong>48</strong></div>
          </div>
        </Panel>
      </section>
    </>
  );
}

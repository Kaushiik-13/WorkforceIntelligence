import { AlertTriangle, Network, UsersRound } from "lucide-react";

import { LocationBarChart } from "@/components/charts";
import { MetricCard, PageHeader, Panel } from "@/components/ui";

const locationMatrix = [
  { function: "Sales", values: [6, 5, 8, 7, 5] },
  { function: "HR", values: [5, 1, 10, 3, 4] },
  { function: "Manufacturing", values: [6, 4, 2, 6, 3] },
  { function: "Finance", values: [2, 4, 4, 2, 2] },
  { function: "IT", values: [3, 1, 2, 4, 1] },
];

const locations = ["Bengaluru", "Chennai", "Jaipur", "Nashik", "Pune"];

const codeCards = [
  { label: "Organizational units", value: 96, note: "96 distinct codes across 100 records" },
  { label: "PA codes", value: 99, note: "99 distinct codes across 100 records" },
  { label: "Cost centres", value: 100, note: "Every record has a different code" },
];

const hrbpRows = [
  { assignment: "Primary HRBP", distinct: 68, average: "1.5", maximum: 4 },
  { assignment: "Secondary HRBP", distinct: 69, average: "1.4", maximum: 5 },
  { assignment: "Primary-secondary pairs", distinct: 99, average: "1.0", maximum: 2 },
];

function heatTone(value: number) {
  if (value >= 8) return "heat-strong";
  if (value >= 5) return "heat-medium";
  if (value >= 3) return "heat-light";
  return "heat-faint";
}

export default function OrganizationPage() {
  return (
    <>
      <PageHeader
        description="See where employees are positioned and where organization codes or HR support assignments are too fragmented for confident aggregation."
        eyebrow="Organization & location"
        title="Where the workforce sits"
      />

      <section className="metric-grid metric-grid-four">
        <MetricCard label="Locations" note="Distinct nonblank Location values" value="5" />
        <MetricCard label="Organizational units" note="96% unique across employee records" tone="coral" value="96" />
        <MetricCard label="Primary HRBP IDs" note="Average 1.5 employees per HRBP" tone="green" value="68" />
        <MetricCard label="HRBP assignment gaps" note="Both HRBP fields are populated" tone="yellow" value="0" />
      </section>

      <section className="organization-primary-grid">
        <Panel badge="100 records" subtitle="Distinct employees grouped by Location" title="Workforce by location">
          <LocationBarChart />
        </Panel>

        <Panel subtitle="Employee count at each function and site intersection" title="Function × location">
          <div className="heatmap-scroll">
            <div className="location-heatmap">
              <span />
              {locations.map((location) => <strong key={location}>{location}</strong>)}
              {locationMatrix.map((row) => (
                <div className="heatmap-row" key={row.function}>
                  <b>{row.function}</b>
                  {row.values.map((value, index) => (
                    <span className={heatTone(value)} key={locations[index]} title={`${row.function}, ${locations[index]}: ${value} employees`}>
                      {value}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="heatmap-legend"><span>Lower</span><i className="heat-faint" /><i className="heat-light" /><i className="heat-medium" /><i className="heat-strong" /><span>Higher</span></div>
        </Panel>
      </section>

      <section className="organization-secondary-grid">
        <Panel className="fragmentation-panel" subtitle="High uniqueness makes these fields poor executive grouping dimensions" title="Organization-code fragmentation">
          <div className="fragmentation-grid">
            {codeCards.map((item) => (
              <article key={item.label}>
                <div><Network size={16} /><span>{item.label}</span></div>
                <strong>{item.value}<small>% unique</small></strong>
                <span className="fragment-track"><i style={{ width: `${item.value}%` }} /></span>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
          <div className="governance-note"><AlertTriangle size={16} /><p><strong>Governance observation</strong>Do not display these codes as a hierarchy until their business meaning and relationships are confirmed.</p></div>
        </Panel>

        <Panel className="hrbp-panel" subtitle="Assignment coverage and workload dispersion" title="HRBP support model">
          <div className="hrbp-summary"><UsersRound size={18} /><div><strong>99 unique pairs</strong><span>across 100 employee records</span></div></div>
          <div className="table-scroll">
            <table className="data-table hrbp-table">
              <thead><tr><th>Assignment</th><th>Distinct</th><th>Avg. employees</th><th>Max</th></tr></thead>
              <tbody>
                {hrbpRows.map((row) => <tr key={row.assignment}><td>{row.assignment}</td><td>{row.distinct}</td><td>{row.average}</td><td>{row.maximum}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="table-note">HRBP identifiers describe assignment coverage, not HRBP performance.</p>
        </Panel>
      </section>
    </>
  );
}

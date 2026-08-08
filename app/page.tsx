import { Sparkles } from "lucide-react";
import { connection } from "next/server";

import {
  AgeTenureHeatmap,
  EmployeeGroupDonut,
  FunctionBarChart,
  LocationBarChart,
} from "@/components/charts";
import { MetricCard, PageHeader, Panel } from "@/components/ui";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type ExecutiveOverview = {
  as_of_date: string;
  kpis: {
    employee_records: number;
    function_count: number;
    location_count: number;
    average_age: number;
    average_tenure: number;
    retirement_exposure_5_years: number;
    quality_issue_records: number;
  };
  workforce_by_function: {
    function_name: string;
    employee_count: number;
    percentage: number;
  }[];
  workforce_by_location: {
    location_name: string;
    employee_count: number;
    percentage: number;
  }[];
  employee_group_mix: {
    employee_group: string;
    employee_count: number;
    percentage: number;
  }[];
  age_tenure_matrix: {
    age_band: string;
    tenure_band: string;
    employee_count: number;
    percentage: number;
  }[];
  insights: {
    largest_function: {
      function_name: string;
      employee_count: number;
      percentage: number;
    };
    largest_location: {
      location_name: string;
      employee_count: number;
      percentage: number;
    };
    majority_employee_group: {
      employee_group: string;
      employee_count: number;
      percentage: number;
    };
    experienced_workforce: {
      employee_count: number;
      percentage: number;
    };
    trust_qualifier: {
      quality_issue_records: number;
      quality_issue_rate: number;
    };
  };
};

export default async function OverviewPage() {
  await connection();

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_executive_overview");

  if (error || !data) {
    throw new Error("Unable to load Executive Overview data");
  }

  const overview = data as ExecutiveOverview;
  const { insights, kpis } = overview;

  return (
    <>
      <PageHeader
        action={<div className="live-pill"><span />Live dataset · {kpis.employee_records} records</div>}
        description="A decision-ready view of composition, lifecycle risk, and employee-master quality."
        eyebrow="Executive view"
        title="Workforce at a glance"
      />

      <section className="metric-grid metric-grid-six">
        <MetricCard
          label="Employee records"
          note="Counted by distinct Personnel Number"
          value={String(kpis.employee_records)}
        />
        <MetricCard
          label="Functions"
          note="Distinct nonblank functions"
          tone="coral"
          value={String(kpis.function_count)}
        />
        <MetricCard
          label="Locations"
          note="Distinct nonblank locations"
          tone="green"
          value={String(kpis.location_count)}
        />
        <MetricCard
          label="Average age"
          note={`Completed years · as of ${overview.as_of_date}`}
          value={`${kpis.average_age} yrs`}
        />
        <MetricCard
          label="Average tenure"
          note={`Completed service · as of ${overview.as_of_date}`}
          tone="green"
          value={`${kpis.average_tenure} yrs`}
        />
        <MetricCard
          label="Retirement in 5 yrs"
          note="Retirement date within five years"
          tone="yellow"
          value={String(kpis.retirement_exposure_5_years)}
        />
      </section>

      <section className="overview-primary-grid">
        <Panel
          badge={`${kpis.function_count} functions`}
          subtitle="Distinct employee records ranked by function"
          title="Workforce by function"
        >
          <FunctionBarChart data={overview.workforce_by_function} />
        </Panel>
        <Panel subtitle="Source-system Direct / Indirect mix" title="Employee group">
          <EmployeeGroupDonut data={overview.employee_group_mix} />
          <div className="compact-legend">
            {overview.employee_group_mix.map((item, index) => (
              <div key={item.employee_group}>
                <span className={`legend-dot ${index === 0 ? "coral" : "navy"}`} />
                {item.employee_group}
                <strong>{item.percentage}%</strong>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="overview-secondary-grid">
        <Panel
          subtitle="Employee counts across completed age and tenure bands"
          title="Age × tenure profile"
        >
          <AgeTenureHeatmap data={overview.age_tenure_matrix} />
        </Panel>
        <Panel
          badge={`${kpis.location_count} locations`}
          subtitle="Distinct employee records ranked by location"
          title="Workforce by location"
        >
          <LocationBarChart data={overview.workforce_by_location} />
        </Panel>
      </section>

      <section className="insight-card executive-insight-card">
        <header className="executive-insight-heading">
          <div className="insight-icon"><Sparkles size={20} /></div>
          <div>
            <p className="insight-eyebrow">Executive insight brief</p>
            <h2>What leadership should notice</h2>
          </div>
        </header>

        <div className="executive-insight-list">
          <article>
            <span>Largest function</span>
            <strong>{insights.largest_function.function_name}</strong>
            <p>{insights.largest_function.employee_count} employees · {insights.largest_function.percentage}% of the workforce</p>
          </article>
          <article>
            <span>Location concentration</span>
            <strong>{insights.largest_location.location_name}</strong>
            <p>{insights.largest_location.employee_count} employees · {insights.largest_location.percentage}% of the workforce</p>
          </article>
          <article>
            <span>Workforce mix</span>
            <strong>{insights.majority_employee_group.employee_group}</strong>
            <p>{insights.majority_employee_group.employee_count} employees · {insights.majority_employee_group.percentage}% of the workforce</p>
          </article>
          <article>
            <span>Experienced workforce</span>
            <strong>{insights.experienced_workforce.percentage}%</strong>
            <p>{insights.experienced_workforce.employee_count} employees have at least 10 completed years</p>
          </article>
        </div>

        <div className="executive-trust-note">
          <strong>{insights.trust_qualifier.quality_issue_records} records need review</strong>
          <span>{insights.trust_qualifier.quality_issue_rate}% of records trigger an Executive data-quality rule.</span>
        </div>
      </section>
    </>
  );
}

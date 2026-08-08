import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldAlert,
} from "lucide-react";
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
    throw new Error("Unable to load Executive Overview");
  }

  const overview = data as ExecutiveOverview;
  const { insights, kpis } = overview;
  const asOfLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${overview.as_of_date}T00:00:00Z`));
  const hasNearTermRetirementExposure = kpis.retirement_exposure_5_years > 0;

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
          label="Experienced workforce"
          note={`${insights.experienced_workforce.employee_count} employees with 10+ years`}
          tone="yellow"
          value={`${insights.experienced_workforce.percentage}%`}
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

      <section className="executive-brief" aria-labelledby="executive-brief-title">
        <header className="executive-brief-header">
          <div>
            <p className="page-eyebrow">Executive summary</p>
            <h2 id="executive-brief-title">
              {insights.largest_function.function_name} leads, with experience running deep
            </h2>
            <p className="executive-brief-lede">
              {insights.largest_function.function_name} is the largest function at {insights.largest_function.percentage}%.
              The workforce is spread across {kpis.location_count} locations, and {insights.experienced_workforce.percentage}%
              of employees bring at least 10 years of service.
            </p>
          </div>
          <span className="executive-as-of">As of {asOfLabel}</span>
        </header>

        <div className="executive-story-grid">
          <article className="executive-story-card">
            <span className="executive-story-icon coral-soft">
              <BriefcaseBusiness aria-hidden="true" size={18} />
            </span>
            <div>
              <p>Workforce shape</p>
              <h3>{insights.largest_function.function_name} leads at {insights.largest_function.percentage}%</h3>
              <span>
                {insights.largest_function.employee_count} employees in the largest of {kpis.function_count} functions.
              </span>
            </div>
          </article>

          <article className="executive-story-card">
            <span className="executive-story-icon navy-soft">
              <MapPin aria-hidden="true" size={18} />
            </span>
            <div>
              <p>Geographic footprint</p>
              <h3>{insights.largest_location.location_name} accounts for {insights.largest_location.percentage}%</h3>
              <span>
                {insights.largest_location.employee_count} employees at the largest of {kpis.location_count} locations.
              </span>
            </div>
          </article>

          <article className="executive-story-card">
            <span className="executive-story-icon green-soft">
              <Clock3 aria-hidden="true" size={18} />
            </span>
            <div>
              <p>Experience and mix</p>
              <h3>{insights.experienced_workforce.percentage}% have 10+ years</h3>
              <span>
                {insights.majority_employee_group.employee_group} is the majority group at {insights.majority_employee_group.percentage}%.
              </span>
            </div>
          </article>
        </div>

        <div className="executive-signal-row">
          <div className={`executive-signal ${hasNearTermRetirementExposure ? "attention" : "positive"}`}>
            {hasNearTermRetirementExposure
              ? <ShieldAlert aria-hidden="true" size={18} />
              : <CheckCircle2 aria-hidden="true" size={18} />}
            <div>
              <strong>
                {hasNearTermRetirementExposure
                  ? `${kpis.retirement_exposure_5_years} employees approach retirement`
                  : "No near-term retirement exposure"}
              </strong>
              <span>
                {hasNearTermRetirementExposure
                  ? "These retirement dates fall within the next five years."
                  : "No employee retirement dates fall within the next five years."}
              </span>
            </div>
          </div>

          <div className="executive-signal attention">
            <ShieldAlert aria-hidden="true" size={18} />
            <div>
              <strong>{insights.trust_qualifier.quality_issue_records} records need review</strong>
              <span>{insights.trust_qualifier.quality_issue_rate}% trigger an Executive data-quality rule.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

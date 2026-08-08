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

type ExecutiveSupplement = {
  as_of_date: string;
  gender_balance: {
    gender_key: string;
    percentage: number;
    employee_count: number;
  }[];
  recent_joiners: {
    percentage: number;
    employee_count: number;
  };
  retirement_exposure_10_years: {
    percentage: number;
    employee_count: number;
  };
  top_three_function_concentration: {
    percentage: number;
    employee_count: number;
    function_names: string[];
  };
};

const genderLabels: Record<string, string> = {
  F: "Female",
  M: "Male",
  Unknown: "Unknown",
};

function getGenderTone(genderKey: string) {
  if (genderKey === "F") return "coral";
  if (genderKey === "M") return "navy";
  return "yellow";
}

export default async function OverviewPage() {
  await connection();

  const supabase = createSupabaseServerClient();
  const [overviewResponse, supplementResponse] = await Promise.all([
    supabase.rpc("get_executive_overview"),
    supabase.rpc("get_executive_home_supplement"),
  ]);

  if (overviewResponse.error || !overviewResponse.data) {
    throw new Error("Unable to load Executive Overview");
  }

  if (supplementResponse.error || !supplementResponse.data) {
    throw new Error("Unable to load Executive supplemental analytics");
  }

  const overview = overviewResponse.data as ExecutiveOverview;
  const supplement = supplementResponse.data as ExecutiveSupplement;
  const { insights, kpis } = overview;
  const asOfLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${overview.as_of_date}T00:00:00Z`));
  const topThreeFunctionNames = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  }).format(supplement.top_three_function_concentration.function_names);
  const genderSummary = supplement.gender_balance
    .map((item) => `${genderLabels[item.gender_key] ?? item.gender_key} ${item.percentage}%`)
    .join(", ");

  return (
    <>
      <PageHeader
        action={<div className="live-pill"><span />Live dataset · {kpis.employee_records} records</div>}
        description="A decision-ready view of composition, lifecycle risk, and employee-master quality."
        eyebrow="Executive view"
        title="Workforce at a glance"
      />

      <section className="metric-grid metric-grid-eight">
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
        <MetricCard
          label="Recent joiners"
          note={`${supplement.recent_joiners.percentage}% joined within the last 2 years`}
          tone="coral"
          value={String(supplement.recent_joiners.employee_count)}
        />
        <MetricCard
          label="Retirement in 10 yrs"
          note={`${supplement.retirement_exposure_10_years.percentage}% fall within the 10-year horizon`}
          tone="yellow"
          value={String(supplement.retirement_exposure_10_years.employee_count)}
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
        <Panel subtitle="Employee group and gender representation" title="Workforce mix">
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

          <div className="gender-balance">
            <div className="gender-balance-heading">
              <strong>Gender representation</strong>
              <span>{genderSummary}</span>
            </div>
            <div
              aria-label={`Gender representation: ${genderSummary}`}
              className="gender-balance-bar"
              role="img"
            >
              {supplement.gender_balance.map((item) => (
                <span
                  className={getGenderTone(item.gender_key)}
                  key={item.gender_key}
                  style={{ width: `${item.percentage}%` }}
                  title={`${genderLabels[item.gender_key] ?? item.gender_key}: ${item.employee_count} employees (${item.percentage}%)`}
                />
              ))}
            </div>
            <div className="gender-balance-legend">
              {supplement.gender_balance.map((item) => (
                <div key={item.gender_key}>
                  <span className={`legend-dot ${getGenderTone(item.gender_key)}`} />
                  {genderLabels[item.gender_key] ?? item.gender_key}
                  <strong>{item.employee_count}</strong>
                </div>
              ))}
            </div>
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

      <section className="leadership-note" aria-labelledby="leadership-note-title">
        <div className="leadership-note-heading">
          <h2 id="leadership-note-title">Leadership note</h2>
          <span>As of {asOfLabel}</span>
        </div>
        <p>
          <strong>{insights.largest_function.function_name}</strong> is the largest function with{" "}
          <strong>{insights.largest_function.employee_count} employees ({insights.largest_function.percentage}%)</strong>, while{" "}
          <strong>{insights.largest_location.location_name}</strong> is the largest location at{" "}
          <strong>{insights.largest_location.percentage}%</strong>. <strong>{insights.experienced_workforce.percentage}%</strong> of
          employees have at least 10 years of service, and <strong>{topThreeFunctionNames}</strong> together account for{" "}
          <strong>{supplement.top_three_function_concentration.percentage}%</strong> of the workforce.
        </p>
        <p className="leadership-note-watch">
          <strong>{supplement.recent_joiners.employee_count} employees</strong> joined in the last two years,{" "}
          <strong>{supplement.retirement_exposure_10_years.employee_count} employees</strong> have retirement dates within the next
          10 years, and gender representation is <strong>{genderSummary}</strong>.{" "}
          <strong>{insights.trust_qualifier.quality_issue_records} records</strong> need data-quality review.
        </p>
      </section>
    </>
  );
}

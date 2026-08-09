import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import {
  AgeTenureProfileChart,
  JoiningCohortLineChart,
  LifecycleDistributionChart,
  RetirementExposureChart,
  RetirementPipelineChart,
} from "@/components/lifecycle-charts";
import { PageHeader, Panel } from "@/components/ui";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type FilterOptions = {
  designations: string[];
  employee_groups: string[];
  functions: string[];
  genders: string[];
  locations: string[];
};

type DistributionRow = {
  employee_count: number;
  percentage: number;
};

type ExposureRow = {
  employee_count: number;
  exposed_count: number;
  exposed_rate: number;
};

type EmployeeRow = {
  designation: string | null;
  function_name: string | null;
  location_name: string | null;
  personnel_number: string;
};

type LifecycleOverview = {
  age_distribution: (DistributionRow & { age_band: string })[];
  age_tenure_matrix: {
    age_band: string;
    employee_count: number;
    tenure_band: string;
  }[];
  anniversary_summary: { employee_count: number; milestone_years: number }[];
  anomaly_summary: {
    anomaly_records: number;
    joining_age_below_18: number;
    missing_lifecycle_dates: number;
    past_retirement_dates: number;
  };
  applied_filters: {
    designation: string | null;
    employee_group: string | null;
    function: string | null;
    gender: string | null;
    location: string | null;
  };
  as_of_date: string;
  employee_lists: {
    lifecycle_anomalies: (EmployeeRow & {
      birth_date: string | null;
      issues: string[];
      joining_age_years: number | null;
      joining_date: string | null;
      retirement_date: string | null;
    })[];
    retirement_exposed: (EmployeeRow & {
      retirement_date: string;
      tenure_years: number;
    })[];
    service_anniversaries: (EmployeeRow & {
      anniversary_date: string;
      milestone_years: number;
    })[];
  };
  experience_at_risk_by_function: {
    average_tenure_years: number;
    exposed_count: number;
    function_name: string;
    total_tenure_years: number;
  }[];
  filter_options: FilterOptions;
  insights: {
    highest_exposure_rate_function: (ExposureRow & { function_name: string }) | null;
    largest_exposed_function: (ExposureRow & { function_name: string }) | null;
    largest_joining_cohort: { employee_count: number; joining_year: number } | null;
  };
  joining_cohorts: { employee_count: number; joining_year: number }[];
  kpis: {
    average_age: number | null;
    average_age_at_joining: number | null;
    average_expected_retirement_age: number | null;
    average_tenure: number | null;
    lifecycle_anomaly_records: number;
    retirement_exposure_1_year: number;
    retirement_exposure_3_years: number;
    retirement_exposure_5_years: number;
    retirement_exposure_10_years: number;
    retirement_exposure_15_years: number;
    service_milestones: number;
    valid_joining_age_records: number;
  };
  record_counts: { filtered_records: number; total_records: number };
  retirement_by_designation: (ExposureRow & { designation: string })[];
  retirement_by_function: (ExposureRow & { function_name: string })[];
  retirement_by_location: (ExposureRow & { location_name: string })[];
  retirement_pipeline: {
    employee_count: number;
    horizon_band: string;
    percentage: number;
  }[];
  selected_retirement_horizon: number;
  selected_year: number;
  tenure_distribution: (DistributionRow & { tenure_band: string })[];
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function safeNumber(value: string | null, fallback: number, allowed?: number[]) {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  if (allowed && !allowed.includes(parsed)) return fallback;
  return parsed;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function displayNumber(value: number | null, suffix = "") {
  return value === null ? "—" : `${value}${suffix}`;
}

export default async function LifecyclePage({ searchParams }: { searchParams: SearchParams }) {
  await connection();

  const params = await searchParams;
  const filters = {
    designation: firstValue(params.designation),
    employeeGroup: firstValue(params.employee_group),
    functionName: firstValue(params.function),
    gender: firstValue(params.gender),
    location: firstValue(params.location),
  };
  const selectedYear = safeNumber(firstValue(params.year), 2026);
  const selectedHorizon = safeNumber(firstValue(params.horizon), 15, [5, 10, 15, 20]);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_lifecycle_overview", {
    p_as_of_date: "2026-08-08",
    p_designation: filters.designation,
    p_employee_group: filters.employeeGroup,
    p_function: filters.functionName,
    p_gender: filters.gender,
    p_location: filters.location,
    p_retirement_horizon: selectedHorizon,
    p_selected_year: selectedYear,
  });

  if (error || !data) {
    throw new Error("Unable to load Lifecycle & Retirement");
  }

  const lifecycle = data as LifecycleOverview;
  const { kpis, record_counts: counts } = lifecycle;
  const largestFunction = lifecycle.insights.largest_exposed_function;
  const highestRateFunction = lifecycle.insights.highest_exposure_rate_function;
  const largestCohort = lifecycle.insights.largest_joining_cohort;
  const activeFilters = Object.entries(lifecycle.applied_filters).filter(([, value]) => value);
  const horizonMetrics = [
    { label: "1 year", value: kpis.retirement_exposure_1_year },
    { label: "3 years", value: kpis.retirement_exposure_3_years },
    { label: "5 years", value: kpis.retirement_exposure_5_years },
    { label: "10 years", value: kpis.retirement_exposure_10_years },
    { label: "15 years", value: kpis.retirement_exposure_15_years },
  ];
  const selectedExposure = lifecycle.employee_lists.retirement_exposed.length;
  const selectedExposureRate = counts.filtered_records
    ? Number((selectedExposure * 100 / counts.filtered_records).toFixed(1))
    : 0;
  const firstExposureCheckpoint = horizonMetrics.find((metric) => metric.value > 0);
  const functionExposure = lifecycle.retirement_by_function.map((item) => ({
    ...item,
    name: item.function_name,
  }));
  const locationExposure = lifecycle.retirement_by_location.map((item) => ({
    ...item,
    name: item.location_name,
  }));
  const designationExposure = lifecycle.retirement_by_designation.map((item) => ({
    ...item,
    name: item.designation,
  }));

  return (
    <>
      <PageHeader
        action={
          <div className="lifecycle-header-meta">
            <span>As of {formatDate(lifecycle.as_of_date)}</span>
            <strong>{counts.filtered_records} of {counts.total_records} employees</strong>
          </div>
        }
        description="Understand workforce experience, service milestones, and where future retirement exposure may develop."
        eyebrow="Lifecycle & retirement"
        title="Experience and future exposure"
      />

      <form className="workforce-filter-form" method="get">
        <div className="workforce-filter-heading">
          <div>
            <strong>Refine this view</strong>
            <span>Filters update every metric, chart, insight and employee list.</span>
          </div>
          <p><strong>{counts.filtered_records}</strong> records in scope</p>
        </div>
        <div className="lifecycle-filter-grid">
          <FilterSelect label="Function" name="function" options={lifecycle.filter_options.functions} value={filters.functionName} />
          <FilterSelect label="Location" name="location" options={lifecycle.filter_options.locations} value={filters.location} />
          <FilterSelect label="Employee group" name="employee_group" options={lifecycle.filter_options.employee_groups} value={filters.employeeGroup} />
          <FilterSelect label="Gender" name="gender" options={lifecycle.filter_options.genders} value={filters.gender} />
          <FilterSelect label="Designation" name="designation" options={lifecycle.filter_options.designations} value={filters.designation} />
          <label className="workforce-filter-control">
            <span>Milestone year</span>
            <select defaultValue={selectedYear} name="year">
              {[2026, 2027, 2028, 2029, 2030].map((year) => <option key={year}>{year}</option>)}
            </select>
          </label>
          <label className="workforce-filter-control">
            <span>Exposure horizon</span>
            <select defaultValue={selectedHorizon} name="horizon">
              {[5, 10, 15, 20].map((years) => <option key={years} value={years}>{years} years</option>)}
            </select>
          </label>
          <div className="workforce-filter-actions">
            <button className="action-button primary" type="submit">Apply</button>
            <Link className="action-button" href="/lifecycle"><RotateCcw aria-hidden="true" size={13} />Reset</Link>
          </div>
        </div>
        {activeFilters.length ? (
          <div className="workforce-active-filters">
            <span>Active filters</span>
            {activeFilters.map(([label, value]) => <b key={label}>{label.replace("_", " ")}: {value}</b>)}
          </div>
        ) : null}
      </form>

      <section className="lifecycle-story-bento">
        <article className="lifecycle-outlook-card">
          <header>
            <span>Retirement outlook</span>
            <b>{selectedHorizon}-year planning view</b>
          </header>
          <div className="lifecycle-outlook-lead">
            <strong>{selectedExposure}</strong>
            <div>
              <h2>employees enter the selected retirement horizon</h2>
              <p><b>{selectedExposureRate}%</b> of the {counts.filtered_records} employees currently in scope.</p>
            </div>
          </div>
          <div className="lifecycle-outlook-story">
            <p>
              {largestFunction ? <><strong>{largestFunction.function_name}</strong> has the largest exposed count at <strong>{largestFunction.exposed_count}</strong>.</> : <>There is no retirement exposure inside this horizon.</>}
            </p>
            <p>
              {highestRateFunction ? <><strong>{highestRateFunction.function_name}</strong> has the highest proportional exposure at <strong>{highestRateFunction.exposed_rate}%</strong>.</> : <>No proportional exposure is present.</>}
            </p>
          </div>
          <div className="lifecycle-outlook-timeline" aria-label="Cumulative retirement exposure checkpoints">
            {horizonMetrics.map((metric) => (
              <div key={metric.label}>
                <span />
                <strong>{metric.value}</strong>
                <small>{metric.label}</small>
              </div>
            ))}
          </div>
          <footer>
            <span>Planning read</span>
            <p>{firstExposureCheckpoint ? `The first non-zero checkpoint appears within ${firstExposureCheckpoint.label}.` : "No retirement exposure appears in the standard 15-year checkpoints."}</p>
          </footer>
        </article>

        <article className="lifecycle-age-story">
          <header><span>Age span</span><small>As of {formatDate(lifecycle.as_of_date)}</small></header>
          <div className="lifecycle-age-values">
            <div><strong>{displayNumber(kpis.average_age)}</strong><span>Average age</span></div>
            <i />
            <div><strong>{displayNumber(kpis.average_expected_retirement_age)}</strong><span>Expected retirement age</span></div>
          </div>
          <div className="lifecycle-age-track" aria-hidden="true"><span /><i /></div>
          <p>About <strong>{kpis.average_age !== null && kpis.average_expected_retirement_age !== null ? Number((kpis.average_expected_retirement_age - kpis.average_age).toFixed(1)) : "—"} years</strong> separate today&apos;s average age and expected retirement age.</p>
        </article>

        <article className="lifecycle-service-story">
          <span>Service depth</span>
          <strong>{displayNumber(kpis.average_tenure)}</strong>
          <p>average completed years of service</p>
          <footer><b>{kpis.service_milestones}</b><span>major milestones in {selectedYear}</span></footer>
        </article>

        <article className="lifecycle-confidence-story">
          <header><span>Joining-age confidence</span><b>{kpis.valid_joining_age_records}/{counts.filtered_records} valid</b></header>
          <div><strong>{displayNumber(kpis.average_age_at_joining)}</strong><span>Average valid joining age</span></div>
          <p><b>{kpis.lifecycle_anomaly_records} records</b> are kept outside this average and remain available for review.</p>
          {largestCohort ? <small>Largest cohort: <strong>{largestCohort.joining_year}</strong> · {largestCohort.employee_count} employees</small> : null}
        </article>
      </section>

      <section className="lifecycle-primary-grid">
        <Panel subtitle="Completed age at the shared as-of date" title="Age profile">
          <LifecycleDistributionChart data={lifecycle.age_distribution} labelKey="age_band" color="coral" />
        </Panel>
        <Panel subtitle="Completed years since joining" title="Tenure profile">
          <LifecycleDistributionChart data={lifecycle.tenure_distribution} labelKey="tenure_band" />
        </Panel>
      </section>

      <section className="lifecycle-retirement-grid">
        <Panel badge={`${selectedHorizon}-year planning view`} subtitle="Employees grouped by years remaining until retirement" title="Retirement pipeline">
          <RetirementPipelineChart data={lifecycle.retirement_pipeline} />
        </Panel>
        <Panel subtitle="Switch between absolute impact and proportional exposure" title="Retirement exposure by function">
          <RetirementExposureChart data={functionExposure} />
        </Panel>
      </section>

      <section className="lifecycle-secondary-grid">
        <Panel subtitle="Current employees grouped by their joining year" title="Joining cohorts">
          <JoiningCohortLineChart data={lifecycle.joining_cohorts} />
        </Panel>
        <Panel subtitle="Age composition split by completed tenure band" title="Age × tenure profile">
          <AgeTenureProfileChart data={lifecycle.age_tenure_matrix} />
        </Panel>
      </section>

      <section className="lifecycle-exposure-grid">
        <Panel subtitle={`Count and rate within the selected ${selectedHorizon}-year horizon`} title="Exposure by location">
          <RetirementExposureChart data={locationExposure} />
        </Panel>
        <Panel subtitle={`Roles represented inside the selected ${selectedHorizon}-year horizon`} title="Exposure by designation">
          <RetirementExposureChart data={designationExposure} />
        </Panel>
      </section>

      <Panel
        badge={`${kpis.service_milestones} employees`}
        className="lifecycle-anniversary-panel"
        subtitle={`Employees reaching a major service milestone during ${selectedYear}`}
        title="Service anniversary calendar"
      >
        <div className="anniversary-band-grid">
          {[5, 10, 15, 20].map((years) => {
            const count = lifecycle.anniversary_summary.find((item) => item.milestone_years === years)?.employee_count ?? 0;
            return <article key={years}><strong>{count}</strong><span>{years}-year anniversaries</span></article>;
          })}
        </div>
      </Panel>

      <section className="lifecycle-detail-stack">
        <EmployeeDetails
          count={lifecycle.employee_lists.retirement_exposed.length}
          description={`Employees retiring within the selected ${selectedHorizon}-year horizon`}
          title="Retirement-exposed employees"
        >
          <div className="table-scroll">
            <table className="data-table lifecycle-table">
              <thead><tr><th>Personnel no.</th><th>Function</th><th>Location</th><th>Designation</th><th>Retirement date</th><th>Tenure</th></tr></thead>
              <tbody>{lifecycle.employee_lists.retirement_exposed.map((employee) => (
                <tr key={employee.personnel_number}><td className="mono">{employee.personnel_number}</td><td>{employee.function_name ?? "—"}</td><td>{employee.location_name ?? "—"}</td><td>{employee.designation ?? "—"}</td><td>{formatDate(employee.retirement_date)}</td><td>{employee.tenure_years} years</td></tr>
              ))}</tbody>
            </table>
          </div>
        </EmployeeDetails>

        <EmployeeDetails
          count={lifecycle.employee_lists.service_anniversaries.length}
          description={`Employees reaching 5, 10, 15 or 20 years of service in ${selectedYear}`}
          title="Service milestone employees"
        >
          <div className="table-scroll">
            <table className="data-table lifecycle-table">
              <thead><tr><th>Personnel no.</th><th>Function</th><th>Location</th><th>Designation</th><th>Milestone</th><th>Anniversary</th></tr></thead>
              <tbody>{lifecycle.employee_lists.service_anniversaries.map((employee) => (
                <tr key={employee.personnel_number}><td className="mono">{employee.personnel_number}</td><td>{employee.function_name ?? "—"}</td><td>{employee.location_name ?? "—"}</td><td>{employee.designation ?? "—"}</td><td>{employee.milestone_years} years</td><td>{formatDate(employee.anniversary_date)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </EmployeeDetails>

        <EmployeeDetails
          count={lifecycle.employee_lists.lifecycle_anomalies.length}
          description="Records excluded from valid joining-age calculations"
          tone="warning"
          title="Lifecycle-date anomalies"
        >
          <div className="lifecycle-anomaly-note"><AlertTriangle aria-hidden="true" size={16} /><p>The average joining age uses only valid records. These rows remain visible for correction and do not silently distort that KPI.</p></div>
          <div className="table-scroll">
            <table className="data-table lifecycle-table anomaly-table">
              <thead><tr><th>Personnel no.</th><th>Function</th><th>Birth date</th><th>Joining date</th><th>Joining age</th><th>Issue</th></tr></thead>
              <tbody>{lifecycle.employee_lists.lifecycle_anomalies.map((employee) => (
                <tr key={employee.personnel_number}><td className="mono">{employee.personnel_number}</td><td>{employee.function_name ?? "—"}</td><td>{employee.birth_date ? formatDate(employee.birth_date) : "—"}</td><td>{employee.joining_date ? formatDate(employee.joining_date) : "—"}</td><td>{employee.joining_age_years ?? "—"}</td><td><span className="status-badge">{employee.issues.join(", ")}</span></td></tr>
              ))}</tbody>
            </table>
          </div>
        </EmployeeDetails>
      </section>
    </>
  );
}

function FilterSelect({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: string[];
  value: string | null;
}) {
  return (
    <label className="workforce-filter-control">
      <span>{label}</span>
      <select defaultValue={value ?? ""} name={name}>
        <option value="">All</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function EmployeeDetails({
  children,
  count,
  description,
  title,
  tone = "default",
}: {
  children: React.ReactNode;
  count: number;
  description: string;
  title: string;
  tone?: "default" | "warning";
}) {
  return (
    <details className={`lifecycle-detail-panel ${tone === "warning" ? "warning" : ""}`}>
      <summary>
        <div><strong>{title}</strong><span>{description}</span></div>
        <b>{count}</b>
      </summary>
      <div className="lifecycle-detail-content">
        {children}
      </div>
    </details>
  );
}

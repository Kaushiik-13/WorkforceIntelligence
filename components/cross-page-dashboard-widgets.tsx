"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Database,
  Network,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { AgeTenureHeatmap, LocationBarChart } from "@/components/charts";
import { HeatmapCell } from "@/components/heatmap-cell";
import {
  JoiningCohortLineChart,
  LifecycleDistributionChart,
  RetirementExposureChart,
  RetirementPipelineChart,
} from "@/components/lifecycle-charts";
import {
  HrbpWorkloadChart,
  HrbpWorkloadDistributionChart,
} from "@/components/organization-charts";
import {
  DesignationBarChart,
  EmployeeGroupByFunctionChart,
  FunctionDistributionBarChart,
  GenderByFunctionChart,
} from "@/components/workforce-charts";
import type {
  LifecycleOverviewData,
  OrganizationOverviewData,
  WorkforceCompositionData,
} from "@/lib/dashboard-types";

export type WidgetSize = "small" | "medium" | "wide" | "large";
export type WidgetSource =
  | "Overview"
  | "Workforce"
  | "Organization"
  | "Lifecycle"
  | "Operations";
export type WidgetKind = "metric" | "chart" | "story" | "table" | "action";
export type WidgetDefinition = {
  title: string;
  subtitle: string;
  kind: WidgetKind;
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
  source: WidgetSource;
};

export const crossPageWidgetDefinitions = {
  "workforce-kpis": {
    title: "Composition snapshot",
    subtitle: "The six headline workforce measures",
    kind: "metric",
    sizes: ["medium", "wide", "large"],
    defaultSize: "wide",
    source: "Workforce",
  },
  "workforce-gender-function": {
    title: "Gender by function",
    subtitle: "F and M representation within each function",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "wide",
    source: "Workforce",
  },
  "workforce-group-function": {
    title: "Employee group by function",
    subtitle: "Direct and Indirect mix within each function",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "wide",
    source: "Workforce",
  },
  "workforce-function-distribution": {
    title: "Function distribution",
    subtitle: "Employee count and share by function",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Workforce",
  },
  "workforce-designation": {
    title: "Designation distribution",
    subtitle: "Ranked role mix in the current population",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Workforce",
  },
  "workforce-role-breadth": {
    title: "Role breadth by function",
    subtitle: "Role variety and the leading role in each function",
    kind: "table",
    sizes: ["wide", "large"],
    defaultSize: "large",
    source: "Workforce",
  },
  "workforce-note": {
    title: "Composition note",
    subtitle: "The strongest workforce composition signals",
    kind: "story",
    sizes: ["medium", "wide", "large"],
    defaultSize: "wide",
    source: "Workforce",
  },
  "organization-kpis": {
    title: "Organization snapshot",
    subtitle: "Location, unit and HRBP coverage measures",
    kind: "metric",
    sizes: ["medium", "wide", "large"],
    defaultSize: "wide",
    source: "Organization",
  },
  "organization-location": {
    title: "Organization by location",
    subtitle: "Distinct employees grouped by location",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Organization",
  },
  "organization-footprint": {
    title: "Function × location footprint",
    subtitle: "Read across a function or down a location to spot concentration",
    kind: "chart",
    sizes: ["wide", "large"],
    defaultSize: "large",
    source: "Organization",
  },
  "organization-workload": {
    title: "Primary HRBP workload",
    subtitle: "The 12 busiest masked primary assignments",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Organization",
  },
  "organization-coverage": {
    title: "HRBP coverage pattern",
    subtitle: "Assignment volume and organizational reach",
    kind: "chart",
    sizes: ["wide", "large"],
    defaultSize: "wide",
    source: "Organization",
  },
  "organization-fragmentation": {
    title: "Organization-code fragmentation",
    subtitle: "Uniqueness across source organization codes",
    kind: "metric",
    sizes: ["wide", "large"],
    defaultSize: "wide",
    source: "Organization",
  },
  "organization-breadth": {
    title: "HRBP support breadth",
    subtitle: "Employee, function and location span by primary HRBP",
    kind: "table",
    sizes: ["wide", "large"],
    defaultSize: "wide",
    source: "Organization",
  },
  "organization-note": {
    title: "Organization note",
    subtitle: "Geographic concentration and support signals",
    kind: "story",
    sizes: ["medium", "wide", "large"],
    defaultSize: "wide",
    source: "Organization",
  },
  "lifecycle-outlook": {
    title: "Retirement outlook",
    subtitle: "Selected horizon, timing and functional exposure",
    kind: "story",
    sizes: ["wide", "large"],
    defaultSize: "large",
    source: "Lifecycle",
  },
  "lifecycle-age-span": {
    title: "Age span",
    subtitle: "Average age and expected retirement age",
    kind: "metric",
    sizes: ["small", "medium", "wide"],
    defaultSize: "medium",
    source: "Lifecycle",
  },
  "lifecycle-service-depth": {
    title: "Service depth",
    subtitle: "Average tenure and milestone volume",
    kind: "metric",
    sizes: ["small", "medium", "wide"],
    defaultSize: "small",
    source: "Lifecycle",
  },
  "lifecycle-joining-confidence": {
    title: "Joining-age confidence",
    subtitle: "Valid joining ages and excluded anomalies",
    kind: "metric",
    sizes: ["small", "medium", "wide"],
    defaultSize: "small",
    source: "Lifecycle",
  },
  "lifecycle-age-profile": {
    title: "Age profile",
    subtitle: "Completed age at the shared as-of date",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Lifecycle",
  },
  "lifecycle-tenure-profile": {
    title: "Tenure profile",
    subtitle: "Completed years since joining",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Lifecycle",
  },
  "lifecycle-retirement-pipeline": {
    title: "Retirement pipeline",
    subtitle: "Employees grouped by years remaining",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Lifecycle",
  },
  "lifecycle-function-exposure": {
    title: "Retirement exposure by function",
    subtitle: "Absolute impact or proportional exposure",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Lifecycle",
  },
  "lifecycle-cohorts": {
    title: "Joining cohorts",
    subtitle: "Current employees grouped by joining year",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Lifecycle",
  },
  "lifecycle-age-tenure": {
    title: "Age × tenure heatmap",
    subtitle: "Employee count at each age and completed-service combination",
    kind: "chart",
    sizes: ["wide", "large"],
    defaultSize: "wide",
    source: "Lifecycle",
  },
  "lifecycle-location-exposure": {
    title: "Exposure by location",
    subtitle: "Retirement count and rate by location",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Lifecycle",
  },
  "lifecycle-designation-exposure": {
    title: "Exposure by designation",
    subtitle: "Retirement count and rate by role",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
    defaultSize: "medium",
    source: "Lifecycle",
  },
  "lifecycle-anniversaries": {
    title: "Service anniversary calendar",
    subtitle: "Employees reaching major service milestones",
    kind: "metric",
    sizes: ["medium", "wide", "large"],
    defaultSize: "wide",
    source: "Lifecycle",
  },
  "lifecycle-retirement-list": {
    title: "Retirement-exposed employees",
    subtitle: "Employees inside the selected planning horizon",
    kind: "table",
    sizes: ["wide", "large"],
    defaultSize: "large",
    source: "Lifecycle",
  },
  "lifecycle-milestone-list": {
    title: "Service milestone employees",
    subtitle: "Employees reaching a major service anniversary",
    kind: "table",
    sizes: ["wide", "large"],
    defaultSize: "large",
    source: "Lifecycle",
  },
  "lifecycle-anomaly-list": {
    title: "Lifecycle-date anomalies",
    subtitle: "Records excluded from valid joining-age calculations",
    kind: "table",
    sizes: ["wide", "large"],
    defaultSize: "large",
    source: "Lifecycle",
  },
  "employees-directory": {
    title: "Employee directory",
    subtitle: "Search, inspect and maintain employee records",
    kind: "action",
    sizes: ["small", "medium"],
    defaultSize: "small",
    source: "Operations",
  },
  "data-hub": {
    title: "Data Hub",
    subtitle: "Validate and import Excel or CSV files",
    kind: "action",
    sizes: ["small", "medium"],
    defaultSize: "small",
    source: "Operations",
  },
} as const satisfies Record<string, WidgetDefinition>;

export type CrossPageWidgetId = keyof typeof crossPageWidgetDefinitions;

type CrossPageWidgetContentProps = {
  id: CrossPageWidgetId;
  workforce: WorkforceCompositionData;
  organization: OrganizationOverviewData;
  lifecycle: LifecycleOverviewData;
};

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

function heatTone(value: number, maximum: number) {
  if (value === 0 || maximum === 0) return "heat-level-0";
  const ratio = value / maximum;
  if (ratio <= 0.25) return "heat-level-1";
  if (ratio <= 0.5) return "heat-level-2";
  if (ratio <= 0.75) return "heat-level-3";
  return "heat-level-4";
}

function WidgetMetricGrid({
  items,
}: {
  items: { label: string; note: string; value: string }[];
}) {
  return (
    <div className="cross-widget-metric-grid">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.note}</p>
        </div>
      ))}
    </div>
  );
}

function WidgetTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="cross-widget-table-wrap">
      <table className="data-table cross-widget-table">
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cellIndex}-${cell}`}>
                  {cellIndex === 0 ? <strong>{cell}</strong> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FunctionLocationFootprint({ data }: { data: OrganizationOverviewData }) {
  const functions = [...new Set(data.function_location_matrix.map((item) => item.function_name))];
  const locations = [...new Set(data.function_location_matrix.map((item) => item.location_name))];
  const matrix = new Map(
    data.function_location_matrix.map((item) => [`${item.function_name}::${item.location_name}`, item]),
  );
  const maximum = Math.max(0, ...data.function_location_matrix.map((item) => item.employee_count));

  return (
    <div className="dashboard-heatmap-content organization-widget-heatmap">
      <div className="cross-widget-heatmap-wrap">
        <div
          className="location-heatmap"
          style={{
            gridTemplateColumns: `92px repeat(${locations.length}, minmax(58px, 1fr))`,
            minWidth: `${92 + locations.length * 70}px`,
          }}
        >
          <strong />
          {locations.map((location) => <strong key={location}>{location}</strong>)}
          {functions.map((functionName) => (
            <div className="heatmap-row" key={functionName}>
              <b>{functionName}</b>
              {locations.map((location) => {
                const item = matrix.get(`${functionName}::${location}`);
                const count = item?.employee_count ?? 0;
                const label = `${functionName} in ${location}: ${count} ${count === 1 ? "employee" : "employees"} · ${item?.function_percentage ?? 0}% of the function · ${item?.location_percentage ?? 0}% of the location`;
                const href = count > 0
                  ? `/organization?function=${encodeURIComponent(functionName)}&location=${encodeURIComponent(location)}`
                  : undefined;

                return (
                  <HeatmapCell
                    className={`${heatTone(count, maximum)}${count > 0 ? " interactive-heat-cell" : ""}`}
                    href={href}
                    key={location}
                    label={label}
                  >
                    {count}
                  </HeatmapCell>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span>Lower</span><i className="heat-level-1" /><i className="heat-level-2" />
        <i className="heat-level-3" /><i className="heat-level-4" /><span>Higher</span>
      </div>
      <p className="dashboard-heatmap-note">Columns show locations. Rows show functions. A darker cell contains more employees; select a filled cell to open that intersection.</p>
    </div>
  );
}

function OperationalWidget({
  count,
  description,
  href,
  icon,
  label,
}: {
  count?: number;
  description: string;
  href: string;
  icon: "employees" | "data";
  label: string;
}) {
  return (
    <div className="cross-widget-operation">
      <div>{icon === "employees" ? <UsersRound size={22} /> : <Database size={22} />}</div>
      {count !== undefined ? <strong>{count}</strong> : null}
      <p>{description}</p>
      <Link href={href}>
        {label}
        <ArrowUpRight aria-hidden="true" size={14} />
      </Link>
    </div>
  );
}

export function CrossPageWidgetContent({
  id,
  lifecycle,
  organization,
  workforce,
}: CrossPageWidgetContentProps) {
  const female = workforce.kpis.gender_representation.find((item) => item.gender_key === "F");
  const male = workforce.kpis.gender_representation.find((item) => item.gender_key === "M");
  const leadingGroup = workforce.kpis.employee_group_mix[0];
  const lifecycleCount = lifecycle.record_counts.filtered_records;
  const lifecycleMatrix = lifecycle.age_tenure_matrix.map((item) => ({
    ...item,
    percentage: lifecycleCount
      ? Number(((item.employee_count / lifecycleCount) * 100).toFixed(1))
      : 0,
  }));
  const functionExposure = lifecycle.retirement_by_function.map((item) => ({ ...item, name: item.function_name }));
  const locationExposure = lifecycle.retirement_by_location.map((item) => ({ ...item, name: item.location_name }));
  const designationExposure = lifecycle.retirement_by_designation.map((item) => ({ ...item, name: item.designation }));

  switch (id) {
    case "workforce-kpis":
      return (
        <WidgetMetricGrid items={[
          {
            label: "Largest function",
            value: workforce.kpis.largest_function ? `${workforce.kpis.largest_function.function_name} · ${workforce.kpis.largest_function.percentage}%` : "—",
            note: `${workforce.kpis.largest_function?.employee_count ?? 0} employees`,
          },
          {
            label: "Largest designation",
            value: workforce.kpis.largest_designation ? `${workforce.kpis.largest_designation.designation} · ${workforce.kpis.largest_designation.percentage}%` : "—",
            note: `${workforce.kpis.largest_designation?.employee_count ?? 0} employees`,
          },
          { label: "Gender representation", value: female ? `${female.percentage}% F` : "—", note: `${female?.employee_count ?? 0} F · ${male?.employee_count ?? 0} M` },
          { label: "Employee group mix", value: leadingGroup ? `${leadingGroup.percentage}% ${leadingGroup.employee_group}` : "—", note: workforce.kpis.employee_group_mix.map((item) => `${item.employee_count} ${item.employee_group}`).join(" · ") },
          { label: "Distinct designations", value: String(workforce.kpis.distinct_designations), note: "Nonblank roles" },
          { label: "Functions represented", value: String(workforce.kpis.functions_represented), note: "Functions in scope" },
        ]} />
      );
    case "workforce-gender-function":
      return <GenderByFunctionChart data={workforce.gender_by_function} />;
    case "workforce-group-function":
      return <EmployeeGroupByFunctionChart data={workforce.employee_group_by_function} />;
    case "workforce-function-distribution":
      return <FunctionDistributionBarChart data={workforce.function_distribution} />;
    case "workforce-designation":
      return <DesignationBarChart data={workforce.designation_mix} />;
    case "workforce-role-breadth":
      return <WidgetTable columns={["Function", "Employees", "Roles", "Largest role", "Share"]} rows={workforce.role_breadth_by_function.map((item) => [item.function_name, item.employee_count, item.distinct_designations, `${item.dominant_designation} (${item.dominant_designation_count})`, `${item.dominant_designation_percentage}%`])} />;
    case "workforce-note":
      return (
        <div className="cross-widget-story">
          <p className="cross-widget-eyebrow">Composition read</p>
          <h3>{workforce.insights.highest_direct_share ? `${workforce.insights.highest_direct_share.function_name} has the highest Direct share` : "Workforce composition"}</h3>
          {workforce.insights.highest_direct_share ? <p><strong>{workforce.insights.highest_direct_share.percentage}%</strong> of that function is classified Direct.</p> : null}
          {workforce.insights.largest_gender_variance ? <p><strong>{workforce.insights.largest_gender_variance.function_name}</strong> has the largest F-code variance at {workforce.insights.largest_gender_variance.f_percentage}%.</p> : null}
          <p>The top three functions account for <strong>{workforce.insights.top_three_function_concentration.percentage}%</strong> of employees.</p>
        </div>
      );
    case "organization-kpis":
      return <WidgetMetricGrid items={[
        { label: "Locations", value: String(organization.kpis.locations), note: "Represented" },
        { label: "Organizational units", value: String(organization.kpis.organizational_units), note: "Distinct source codes" },
        { label: "Primary HRBPs", value: String(organization.kpis.primary_hrbps), note: "Masked assignments" },
        { label: "Average workload", value: organization.kpis.average_primary_hrbp_workload?.toFixed(1) ?? "—", note: "Employees per HRBP" },
        { label: "Unique HRBP pairs", value: String(organization.kpis.unique_hrbp_pairs), note: `${organization.kpis.secondary_hrbps} secondary HRBPs` },
        { label: "Assignment gaps", value: String(organization.kpis.assignment_gaps), note: "Missing either assignment" },
      ]} />;
    case "organization-location":
      return <LocationBarChart data={organization.location_distribution} />;
    case "organization-footprint":
      return <FunctionLocationFootprint data={organization} />;
    case "organization-workload":
      return <HrbpWorkloadChart average={organization.workload_statistics.average} data={organization.hrbp_workload} />;
    case "organization-coverage":
      return (
        <div className="cross-widget-coverage">
          <div className="organization-coverage-summary">
            <article><span>Multi-function HRBPs</span><strong>{organization.kpis.multi_function_hrbps}<small>{organization.kpis.primary_hrbps ? `${((organization.kpis.multi_function_hrbps / organization.kpis.primary_hrbps) * 100).toFixed(1)}%` : "0%"}</small></strong></article>
            <article><span>Multi-location HRBPs</span><strong>{organization.kpis.multi_location_hrbps}<small>{organization.kpis.primary_hrbps ? `${((organization.kpis.multi_location_hrbps / organization.kpis.primary_hrbps) * 100).toFixed(1)}%` : "0%"}</small></strong></article>
          </div>
          <HrbpWorkloadDistributionChart data={organization.hrbp_workload_distribution} />
        </div>
      );
    case "organization-fragmentation":
      return (
        <div className="fragmentation-grid cross-widget-fragmentation">
          {organization.organization_fragmentation.map((item) => (
            <article key={item.field_name}>
              <div><Network size={15} /><span>{item.field_name}</span></div>
              <strong>{item.fragmentation_percentage}<small>% unique</small></strong>
              <span className="fragment-track"><i style={{ width: `${item.fragmentation_percentage}%` }} /></span>
              <p>{item.distinct_values} distinct values</p>
            </article>
          ))}
        </div>
      );
    case "organization-breadth":
      return <WidgetTable columns={["HRBP", "Employees", "Functions", "Locations"]} rows={organization.hrbp_breadth.map((item) => [item.hrbp_label, item.employee_count, item.function_count, item.location_count])} />;
    case "organization-note":
      return (
        <div className="cross-widget-story">
          <p className="cross-widget-eyebrow">Organization read</p>
          <h3>{organization.insights.largest_location ? `${organization.insights.largest_location.location_name} is the largest location` : "Organization footprint"}</h3>
          {organization.insights.largest_location ? <p><strong>{organization.insights.largest_location.employee_count} employees ({organization.insights.largest_location.percentage}%)</strong> are based there.</p> : null}
          {organization.insights.broadest_hrbp ? <p><strong>{organization.insights.broadest_hrbp.hrbp_label}</strong> has the broadest support footprint across {organization.insights.broadest_hrbp.function_count} functions and {organization.insights.broadest_hrbp.location_count} locations.</p> : null}
          <p><strong>{organization.insights.assignment_gaps}</strong> records have an HRBP assignment gap.</p>
        </div>
      );
    case "lifecycle-outlook": {
      const exposure = lifecycle.employee_lists.retirement_exposed.length;
      const exposureRate = lifecycleCount ? Number(((exposure / lifecycleCount) * 100).toFixed(1)) : 0;
      const periods = [
        ["0–1 years", lifecycle.kpis.retirement_exposure_1_year],
        ["2–3 years", Math.max(0, lifecycle.kpis.retirement_exposure_3_years - lifecycle.kpis.retirement_exposure_1_year)],
        ["4–5 years", Math.max(0, lifecycle.kpis.retirement_exposure_5_years - lifecycle.kpis.retirement_exposure_3_years)],
        ["6–10 years", Math.max(0, lifecycle.kpis.retirement_exposure_10_years - lifecycle.kpis.retirement_exposure_5_years)],
        ["11–15 years", Math.max(0, lifecycle.kpis.retirement_exposure_15_years - lifecycle.kpis.retirement_exposure_10_years)],
      ] as const;
      return (
        <div className="cross-widget-outlook">
          <div><strong>{exposure}</strong><p>employees enter the {lifecycle.selected_retirement_horizon}-year horizon <b>({exposureRate}%)</b></p></div>
          <div className="cross-widget-timeline">{periods.map(([label, value]) => <span key={label}><strong>{value}</strong><small>{label}</small></span>)}</div>
          <p>{lifecycle.insights.largest_exposed_function ? <><strong>{lifecycle.insights.largest_exposed_function.function_name}</strong> has the largest exposed count at {lifecycle.insights.largest_exposed_function.exposed_count}.</> : "No exposure inside the selected horizon."}</p>
        </div>
      );
    }
    case "lifecycle-age-span":
      return <WidgetMetricGrid items={[
        { label: "Average age", value: displayNumber(lifecycle.kpis.average_age), note: `As of ${formatDate(lifecycle.as_of_date)}` },
        { label: "Expected retirement age", value: displayNumber(lifecycle.kpis.average_expected_retirement_age), note: "Derived from lifecycle dates" },
      ]} />;
    case "lifecycle-service-depth":
      return <WidgetMetricGrid items={[
        { label: "Average tenure", value: displayNumber(lifecycle.kpis.average_tenure, " yrs"), note: "Completed service" },
        { label: "Milestones", value: String(lifecycle.kpis.service_milestones), note: `During ${lifecycle.selected_year}` },
      ]} />;
    case "lifecycle-joining-confidence":
      return <WidgetMetricGrid items={[
        { label: "Average joining age", value: displayNumber(lifecycle.kpis.average_age_at_joining), note: `${lifecycle.kpis.valid_joining_age_records}/${lifecycleCount} valid` },
        { label: "Anomalies", value: String(lifecycle.kpis.lifecycle_anomaly_records), note: "Kept outside the average" },
      ]} />;
    case "lifecycle-age-profile":
      return <LifecycleDistributionChart color="coral" data={lifecycle.age_distribution} labelKey="age_band" />;
    case "lifecycle-tenure-profile":
      return <LifecycleDistributionChart data={lifecycle.tenure_distribution} labelKey="tenure_band" />;
    case "lifecycle-retirement-pipeline":
      return <RetirementPipelineChart data={lifecycle.retirement_pipeline} />;
    case "lifecycle-function-exposure":
      return <RetirementExposureChart data={functionExposure} />;
    case "lifecycle-cohorts":
      return <JoiningCohortLineChart data={lifecycle.joining_cohorts} />;
    case "lifecycle-age-tenure":
      return (
        <div className="dashboard-heatmap-content">
          <AgeTenureHeatmap data={lifecycleMatrix} tenureBands={["Under 2", "2-5", "6-10", "11-20", "21+"]} />
          <p className="dashboard-heatmap-note">Columns show employee age. Rows show completed years of service. A darker cell contains more employees.</p>
        </div>
      );
    case "lifecycle-location-exposure":
      return <RetirementExposureChart data={locationExposure} />;
    case "lifecycle-designation-exposure":
      return <RetirementExposureChart data={designationExposure} />;
    case "lifecycle-anniversaries":
      return (
        <div className="cross-widget-anniversaries">
          {[5, 10, 15, 20].map((years) => {
            const count = lifecycle.anniversary_summary.find((item) => item.milestone_years === years)?.employee_count ?? 0;
            return <div key={years}><strong>{count}</strong><span>{years}-year anniversaries</span></div>;
          })}
        </div>
      );
    case "lifecycle-retirement-list":
      return <WidgetTable columns={["Personnel no.", "Function", "Location", "Designation", "Retirement", "Tenure"]} rows={lifecycle.employee_lists.retirement_exposed.map((item) => [item.personnel_number, item.function_name ?? "—", item.location_name ?? "—", item.designation ?? "—", formatDate(item.retirement_date), `${item.tenure_years} yrs`])} />;
    case "lifecycle-milestone-list":
      return <WidgetTable columns={["Personnel no.", "Function", "Location", "Designation", "Milestone", "Anniversary"]} rows={lifecycle.employee_lists.service_anniversaries.map((item) => [item.personnel_number, item.function_name ?? "—", item.location_name ?? "—", item.designation ?? "—", `${item.milestone_years} yrs`, formatDate(item.anniversary_date)])} />;
    case "lifecycle-anomaly-list":
      return (
        <div className="cross-widget-anomaly-list">
          <p><AlertTriangle size={14} /> These records remain visible but do not distort the average joining age.</p>
          <WidgetTable columns={["Personnel no.", "Function", "Birth date", "Joining date", "Joining age", "Issue"]} rows={lifecycle.employee_lists.lifecycle_anomalies.map((item) => [item.personnel_number, item.function_name ?? "—", item.birth_date ? formatDate(item.birth_date) : "—", item.joining_date ? formatDate(item.joining_date) : "—", item.joining_age_years ?? "—", item.issues.join(", ")])} />
        </div>
      );
    case "employees-directory":
      return <OperationalWidget count={workforce.record_counts.total_records} description="Open the searchable employee master to add, edit, export or inspect records." href="/employees" icon="employees" label="Open employees" />;
    case "data-hub":
      return <OperationalWidget description="Upload an Excel or CSV file, validate every row, preview the result and import valid employees." href="/data-hub" icon="data" label="Open Data Hub" />;
  }
}

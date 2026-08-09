"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

const colors = {
  coral: "#f06449",
  navy: "#284b63",
  green: "#78a083",
  yellow: "#edb458",
  purple: "#7d6b91",
  grid: "#e5e3dd",
  muted: "#6f756f",
};

const palette = [colors.coral, colors.navy, colors.green, colors.yellow, colors.purple];
const axis = {
  axisLine: false,
  tickLine: false,
  tick: { fill: colors.muted, fontSize: 10 },
};

type DistributionPoint = {
  employee_count: number;
  percentage: number;
};

type ChartPoint = {
  name: string;
  percentage?: number;
  value: number;
};

function CountTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as ChartPoint;

  return (
    <div className="chart-tooltip">
      <p>{point.name}</p>
      <strong>{point.value} employees</strong>
      {point.percentage !== undefined ? <span>{point.percentage}% of this view</span> : null}
    </div>
  );
}

export function LifecycleDistributionChart({
  data,
  labelKey,
  color = "navy",
}: {
  data: (DistributionPoint & Record<string, string | number>)[];
  labelKey: "age_band" | "tenure_band";
  color?: "coral" | "navy";
}) {
  const chartData = data
    .filter((item) => item[labelKey] !== "Unknown")
    .map((item) => ({
      name: String(item[labelKey]),
      percentage: item.percentage,
      value: item.employee_count,
    }));

  return (
    <div className="lifecycle-distribution-chart">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis {...axis} dataKey="name" interval={0} />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip content={CountTooltip} cursor={{ fill: "rgba(40, 75, 99, 0.04)" }} />
          <Bar
            animationDuration={420}
            dataKey="value"
            fill={color === "coral" ? colors.coral : colors.navy}
            radius={[7, 7, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RetirementPipelineChart({
  data,
}: {
  data: { employee_count: number; horizon_band: string; percentage: number }[];
}) {
  const chartData = data
    .filter((item) => item.horizon_band !== "Unknown")
    .map((item) => ({
      name: item.horizon_band,
      percentage: item.percentage,
      value: item.employee_count,
    }));

  return (
    <div className="lifecycle-pipeline-chart">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, bottom: 0, left: 8 }}>
          <CartesianGrid horizontal={false} stroke={colors.grid} strokeDasharray="3 5" />
          <XAxis {...axis} allowDecimals={false} type="number" />
          <YAxis {...axis} dataKey="name" type="category" width={112} />
          <Tooltip content={CountTooltip} cursor={{ fill: "rgba(40, 75, 99, 0.04)" }} />
          <Bar animationDuration={420} dataKey="value" radius={[0, 7, 7, 0]}>
            {chartData.map((item, index) => (
              <Cell fill={palette[index % palette.length]} key={item.name} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type ExposurePoint = {
  employee_count: number;
  exposed_count: number;
  exposed_rate: number;
  name: string;
};

function ExposureTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as ExposurePoint;

  return (
    <div className="chart-tooltip">
      <p>{point.name}</p>
      <strong>{point.exposed_count} exposed employees</strong>
      <span>{point.exposed_rate}% of {point.employee_count} employees</span>
    </div>
  );
}

export function RetirementExposureChart({
  data,
}: {
  data: ExposurePoint[];
}) {
  const [mode, setMode] = useState<"count" | "rate">("count");
  const chartData = [...data].sort((a, b) => {
    const difference = mode === "count"
      ? b.exposed_count - a.exposed_count
      : b.exposed_rate - a.exposed_rate;
    return difference || a.name.localeCompare(b.name);
  });

  return (
    <>
      <div className="chart-mode-switch" role="group" aria-label="Retirement exposure measure">
        <button
          aria-pressed={mode === "count"}
          className={mode === "count" ? "active" : ""}
          onClick={() => setMode("count")}
          type="button"
        >
          Count
        </button>
        <button
          aria-pressed={mode === "rate"}
          className={mode === "rate" ? "active" : ""}
          onClick={() => setMode("rate")}
          type="button"
        >
          Rate
        </button>
      </div>
      <div className="lifecycle-exposure-chart">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 25, bottom: 0, left: 10 }}>
            <CartesianGrid horizontal={false} stroke={colors.grid} strokeDasharray="3 5" />
            <XAxis
              {...axis}
              allowDecimals={mode === "rate"}
              domain={mode === "rate" ? [0, 100] : [0, "dataMax + 1"]}
              tickFormatter={(value) => mode === "rate" ? `${value}%` : String(value)}
              type="number"
            />
            <YAxis {...axis} dataKey="name" type="category" width={92} />
            <Tooltip content={ExposureTooltip} cursor={{ fill: "rgba(40, 75, 99, 0.04)" }} />
            <Bar
              animationDuration={360}
              dataKey={mode === "count" ? "exposed_count" : "exposed_rate"}
              fill={colors.coral}
              radius={[0, 7, 7, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function JoiningCohortLineChart({
  data,
}: {
  data: { employee_count: number; joining_year: number }[];
}) {
  const chartData = data.map((item) => ({
    name: String(item.joining_year),
    value: item.employee_count,
  }));

  return (
    <div className="lifecycle-cohort-chart">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={chartData} margin={{ top: 14, right: 15, bottom: 0, left: -14 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis {...axis} dataKey="name" interval="preserveStartEnd" />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip content={CountTooltip} />
          <Line
            animationDuration={420}
            dataKey="value"
            dot={{ fill: "#fffdf8", r: 4, stroke: colors.coral, strokeWidth: 2 }}
            stroke={colors.coral}
            strokeWidth={2.5}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const tenureSeries = [
  { dataKey: "Under 2", fill: colors.yellow },
  { dataKey: "2-5", fill: colors.green },
  { dataKey: "6-10", fill: colors.navy },
  { dataKey: "11-20", fill: colors.coral },
  { dataKey: "21+", fill: colors.purple },
];

export function AgeTenureProfileChart({
  data,
}: {
  data: { age_band: string; employee_count: number; tenure_band: string }[];
}) {
  const ageBands = ["Under 25", "25-34", "35-44", "45-54", "55+"];
  const chartData = ageBands.map((ageBand) => {
    const row: Record<string, string | number> = { name: ageBand };
    for (const series of tenureSeries) {
      row[series.dataKey] = data.find(
        (item) => item.age_band === ageBand && item.tenure_band === series.dataKey,
      )?.employee_count ?? 0;
    }
    return row;
  });

  return (
    <div className="lifecycle-profile-chart">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} margin={{ top: 14, right: 12, bottom: 0, left: -13 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis {...axis} dataKey="name" />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#203849", border: 0, borderRadius: 10, color: "#fff", fontSize: 10 }}
            cursor={{ fill: "rgba(40, 75, 99, 0.04)" }}
          />
          <Legend iconSize={7} wrapperStyle={{ color: colors.muted, fontSize: 9 }} />
          {tenureSeries.map((series, index) => (
            <Bar
              dataKey={series.dataKey}
              fill={series.fill}
              key={series.dataKey}
              radius={index === tenureSeries.length - 1 ? [5, 5, 0, 0] : 0}
              stackId="tenure"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  grid: "#e5e3dd",
  muted: "#6f756f",
};

const axis = {
  axisLine: false,
  tickLine: false,
  tick: { fill: colors.muted, fontSize: 11 },
};

type CompositionRow = {
  function_name: string;
  category: string;
  employee_count: number;
  function_total: number;
  percentage: number;
};

type CompositionPoint = {
  name: string;
  total: number;
  counts: Record<string, number>;
  [key: string]: string | number | Record<string, number>;
};

type CategoryDefinition = {
  color: string;
  key: string;
  label: string;
};

function CompositionTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as CompositionPoint;

  return (
    <div className="chart-tooltip composition-tooltip">
      <p>{point.name}</p>
      <strong>{point.total} employees</strong>
      <div>
        {payload.map((item) => {
          const category = String(item.name);
          const percentage = Number(item.value ?? 0);

          return (
            <span key={category}>
              <i style={{ background: item.color }} />
              {category}: {point.counts[category] ?? 0} ({percentage}%)
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CompositionBarChart({
  categories,
  data,
}: {
  categories: CategoryDefinition[];
  data: CompositionRow[];
}) {
  const rowsByFunction = new Map<string, CompositionPoint>();

  for (const item of data) {
    const point: CompositionPoint = rowsByFunction.get(item.function_name) ?? {
      counts: {},
      name: item.function_name,
      total: item.function_total,
    };

    point[item.category] = item.percentage;
    point.counts[item.category] = item.employee_count;
    rowsByFunction.set(item.function_name, point);
  }

  const chartData = [...rowsByFunction.values()].sort((left, right) => right.total - left.total);

  return (
    <>
      <div className="chart-area chart-tall">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 16, bottom: 0, left: 16 }}>
            <CartesianGrid horizontal={false} stroke={colors.grid} strokeDasharray="3 5" />
            <XAxis
              {...axis}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              ticks={[0, 25, 50, 75, 100]}
              type="number"
            />
            <YAxis {...axis} dataKey="name" type="category" width={92} />
            <Tooltip content={CompositionTooltip} cursor={{ fill: "rgba(40, 75, 99, 0.05)" }} />
            {categories.map((category, index) => (
              <Bar
                animationDuration={420}
                dataKey={category.key}
                fill={category.color}
                key={category.key}
                name={category.label}
                radius={index === categories.length - 1 ? [0, 7, 7, 0] : 0}
                stackId="composition"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend centered">
        {categories.map((category) => (
          <span key={category.key}>
            <i className="legend-dot" style={{ background: category.color }} />
            {category.label}
          </span>
        ))}
      </div>
    </>
  );
}

export function GenderByFunctionChart({
  data,
}: {
  data: {
    function_name: string;
    gender_key: string;
    employee_count: number;
    function_total: number;
    percentage: number;
  }[];
}) {
  return (
    <CompositionBarChart
      categories={[
        { color: colors.coral, key: "F", label: "F" },
        { color: colors.navy, key: "M", label: "M" },
      ]}
      data={data.map((item) => ({ ...item, category: item.gender_key }))}
    />
  );
}

export function EmployeeGroupByFunctionChart({
  data,
}: {
  data: {
    function_name: string;
    employee_group: string;
    employee_count: number;
    function_total: number;
    percentage: number;
  }[];
}) {
  return (
    <CompositionBarChart
      categories={[
        { color: colors.coral, key: "Direct", label: "Direct" },
        { color: colors.navy, key: "Indirect", label: "Indirect" },
      ]}
      data={data.map((item) => ({ ...item, category: item.employee_group }))}
    />
  );
}

type DistributionPoint = {
  name: string;
  percentage: number;
  value: number;
};

function DistributionTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as DistributionPoint;

  return (
    <div className="chart-tooltip">
      <p>{point.name}</p>
      <strong>{point.value} employees</strong>
      <span>{point.percentage}% of the filtered workforce</span>
    </div>
  );
}

export function DesignationBarChart({
  data,
}: {
  data: { designation: string; employee_count: number; percentage: number }[];
}) {
  const chartData = data.map((item) => ({
    name: item.designation,
    percentage: item.percentage,
    value: item.employee_count,
  }));

  return (
    <div className="chart-area chart-tall">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 18, bottom: 0, left: 18 }}>
          <CartesianGrid horizontal={false} stroke={colors.grid} strokeDasharray="3 5" />
          <XAxis {...axis} allowDecimals={false} domain={[0, "dataMax + 3"]} type="number" />
          <YAxis {...axis} dataKey="name" type="category" width={112} />
          <Tooltip content={DistributionTooltip} cursor={{ fill: "rgba(40, 75, 99, 0.05)" }} />
          <Bar animationDuration={420} dataKey="value" radius={[0, 7, 7, 0]}>
            {chartData.map((item, index) => (
              <Cell
                fill={[colors.coral, colors.navy, colors.green, colors.yellow][index % 4]}
                key={item.name}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

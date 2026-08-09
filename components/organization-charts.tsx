"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

type WorkloadPoint = {
  employee_count: number;
  hrbp_label: string;
};

function HrbpAxisTick({
  payload,
  x = 0,
  y = 0,
}: {
  payload?: { value?: string };
  x?: number;
  y?: number;
}) {
  return (
    <text
      dominantBaseline="middle"
      fill="#6f756f"
      fontSize={9}
      textAnchor="end"
      x={x}
      y={y}
    >
      {payload?.value ?? ""}
    </text>
  );
}

function WorkloadTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as WorkloadPoint;

  return (
    <div className="chart-tooltip">
      <p>{point.hrbp_label}</p>
      <strong>{point.employee_count} employees</strong>
      <span>Primary assignments in the current view</span>
    </div>
  );
}

export function HrbpWorkloadChart({
  data,
  average,
}: {
  data: WorkloadPoint[];
  average: number | null;
}) {
  if (data.length === 0) {
    return <div className="chart-empty-state">No primary HRBP assignments match these filters.</div>;
  }

  const maximum = Math.max(...data.map((item) => item.employee_count));

  return (
    <div className="organization-workload-chart">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ bottom: 2, left: 8, right: 28, top: 8 }}
        >
          <CartesianGrid horizontal={false} stroke="#e5e3dd" strokeDasharray="3 5" />
          <XAxis
            allowDecimals={false}
            axisLine={false}
            domain={[0, "dataMax + 1"]}
            tick={{ fill: "#6f756f", fontSize: 10 }}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="hrbp_label"
            interval={0}
            tick={<HrbpAxisTick />}
            tickLine={false}
            type="category"
            width={72}
          />
          <Tooltip content={WorkloadTooltip} cursor={{ fill: "rgba(40, 75, 99, 0.05)" }} />
          {average !== null ? (
            <ReferenceLine
              label={{ fill: "#a97826", fontSize: 9, position: "insideTopRight", value: `Average ${average}` }}
              stroke="#edb458"
              strokeDasharray="4 4"
              x={average}
            />
          ) : null}
          <Bar animationDuration={420} dataKey="employee_count" radius={[0, 6, 6, 0]}>
            {data.map((item, index) => (
              <Cell
                fill={item.employee_count === maximum && index === 0 ? "#f06449" : "#284b63"}
                key={item.hrbp_label}
              />
            ))}
            <LabelList
              dataKey="employee_count"
              fill="#59605d"
              fontSize={9}
              fontWeight={650}
              offset={7}
              position="right"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

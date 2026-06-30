"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RECHARTS_AXIS_TICK,
  RECHARTS_COLORS,
  RECHARTS_GRID_PROPS,
  RECHARTS_LEGEND_PROPS,
  RECHARTS_TOOLTIP_LABEL_STYLE,
  RECHARTS_TOOLTIP_STYLE,
} from "@/lib/charts/recharts-theme";

export function ChartContainer({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="h-[280px]">{children}</CardContent>
    </Card>
  );
}

export function DistributionBarChart({
  data,
  title,
}: {
  data: { label: string; count: number; percent: number }[];
  title?: string;
}) {
  return (
    <ChartContainer title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid {...RECHARTS_GRID_PROPS} horizontal={false} />
          <XAxis type="number" tick={RECHARTS_AXIS_TICK} />
          <YAxis
            dataKey="label"
            type="category"
            width={100}
            tick={RECHARTS_AXIS_TICK}
          />
          <Tooltip
            contentStyle={RECHARTS_TOOLTIP_STYLE}
            labelStyle={RECHARTS_TOOLTIP_LABEL_STYLE}
          />
          <Bar
            dataKey="count"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function DonutChart({
  data,
  title,
}: {
  data: { label: string; count: number; percent: number }[];
  title?: string;
}) {
  return (
    <ChartContainer title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={RECHARTS_COLORS[i % RECHARTS_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={RECHARTS_TOOLTIP_STYLE}
            labelStyle={RECHARTS_TOOLTIP_LABEL_STYLE}
          />
          <Legend {...RECHARTS_LEGEND_PROPS} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function RankedHorizontalBar({
  data,
  title,
}: {
  data: { label: string; count: number; percent: number }[];
  title?: string;
}) {
  return (
    <ChartContainer title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 8)} layout="vertical">
          <CartesianGrid {...RECHARTS_GRID_PROPS} horizontal={false} />
          <XAxis type="number" tick={RECHARTS_AXIS_TICK} />
          <YAxis
            dataKey="label"
            type="category"
            width={140}
            tick={RECHARTS_AXIS_TICK}
          />
          <Tooltip
            contentStyle={RECHARTS_TOOLTIP_STYLE}
            labelStyle={RECHARTS_TOOLTIP_LABEL_STYLE}
            formatter={(v) => [`${v} reports`, "Count"]}
          />
          <Bar dataKey="count" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function RadarCompareChart({
  data,
  title,
}: {
  data: { dimension: string; baseline: number; target: number }[];
  title?: string;
}) {
  return (
    <ChartContainer title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <Radar
            name="City avg"
            dataKey="baseline"
            stroke="var(--muted-foreground)"
            fill="var(--muted-foreground)"
            fillOpacity={0.2}
          />
          <Radar
            name="Selected"
            dataKey="target"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.3}
          />
          <Legend {...RECHARTS_LEGEND_PROPS} />
          <Tooltip
            contentStyle={RECHARTS_TOOLTIP_STYLE}
            labelStyle={RECHARTS_TOOLTIP_LABEL_STYLE}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function CityHealthGauge({ score }: { score: number }) {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];
  return (
    <ChartContainer title="City Health Index">
      <div className="relative h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={100}
            >
              <Cell fill="var(--chart-1)" />
              <Cell fill="var(--muted)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-4xl font-bold tabular-nums">{score}</span>
          <span className="text-xs text-muted-foreground">out of 100</span>
        </div>
      </div>
    </ChartContainer>
  );
}

export function GroupedCompareBar({
  data,
  title,
}: {
  data: { dimension: string; baseline: number; target: number }[];
  title?: string;
}) {
  return (
    <ChartContainer title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid {...RECHARTS_GRID_PROPS} />
          <XAxis
            dataKey="dimension"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            contentStyle={RECHARTS_TOOLTIP_STYLE}
            labelStyle={RECHARTS_TOOLTIP_LABEL_STYLE}
          />
          <Legend {...RECHARTS_LEGEND_PROPS} />
          <Bar
            dataKey="baseline"
            name="City avg"
            fill="var(--muted-foreground)"
            radius={4}
          />
          <Bar
            dataKey="target"
            name="Selected area"
            fill="var(--chart-1)"
            radius={4}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

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

const COLORS = [
  "hsl(var(--chart-1))",
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#8b5cf6",
];

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
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
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
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
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
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis
            dataKey="label"
            type="category"
            width={140}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={(v) => [`${v} reports`, "Count"]} />
          <Bar dataKey="count" fill="#dc2626" radius={[0, 4, 4, 0]} />
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
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
          <Radar
            name="City avg"
            dataKey="baseline"
            stroke="#737373"
            fill="#737373"
            fillOpacity={0.2}
          />
          <Radar
            name="Selected"
            dataKey="target"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.3}
          />
          <Legend />
          <Tooltip />
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
              <Cell fill="#2563eb" />
              <Cell fill="#e5e5e5" />
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dimension" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="baseline" name="City avg" fill="#737373" radius={4} />
          <Bar dataKey="target" name="Selected area" fill="#2563eb" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

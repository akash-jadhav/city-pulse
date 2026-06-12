"use client";

import { Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ParameterAverage, DistributionSegment } from "@/lib/analytics/parameters";
import { scoreToTier, BADGE_LABELS } from "@/lib/analytics/parameters";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const SHORT_NAMES: Record<string, string> = {
  safety: "Safety",
  electricity: "Electric",
  roads: "Roads",
  infrastructure: "Infra",
  civic_services: "Civic",
  community: "Community",
};

export function StatCard({ count, cityName }: { count: number; cityName: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <DashboardCard bodyClassName="flex min-h-[140px] flex-col justify-center p-5">
        <div className="mb-1 flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.5} />
          <span className="dashboard-label">Total Responses</span>
        </div>
        <p className="text-[32px] font-semibold tabular-nums tracking-tight text-foreground">
          {count.toLocaleString()}
        </p>
        <p className="dashboard-label mt-0.5">Across {cityName}</p>
      </DashboardCard>
    </motion.div>
  );
}

export function OverallScoreCard({
  scoreFive,
  score100,
}: {
  scoreFive: number;
  score100: number;
}) {
  const tier = scoreToTier(score100);
  const badge = BADGE_LABELS[tier];
  const badgeClass =
    tier === "good" || tier === "very_good"
      ? "bg-green-50 text-green-700"
      : tier === "average"
        ? "bg-yellow-50 text-yellow-800"
        : "bg-orange-50 text-orange-700";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <DashboardCard bodyClassName="flex min-h-[140px] flex-col justify-center p-5">
        <div className="mb-1 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.5} />
          <span className="dashboard-label">Average Overall Score</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="dashboard-stat">{scoreFive}</span>
          <span className="text-base font-medium text-muted-foreground">/ 5</span>
        </div>
        <span
          className={`mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}
        >
          {badge}
        </span>
      </DashboardCard>
    </motion.div>
  );
}

export function ParameterBarChart({ parameters }: { parameters: ParameterAverage[] }) {
  const data = parameters
    .filter((p) => p.id !== "overall")
    .map((p) => ({
      name: SHORT_NAMES[p.id] ?? p.label.split(" ")[0],
      fullName: p.label,
      score: p.scoreFive,
      color: p.color,
    }));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <DashboardCard title="Parameter Averages" bodyClassName="px-3 pb-3 pt-1">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 4, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontWeight: 500, fill: "var(--muted-foreground)" }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                ticks={[0, 1, 2, 3, 4, 5]}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`${v} / 5`, "Score"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullName ?? ""
                }
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} animationDuration={800}>
                <LabelList
                  dataKey="score"
                  position="top"
                  formatter={(v) => (typeof v === "number" ? v.toFixed(1) : v)}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: "var(--foreground)",
                  }}
                />
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </motion.div>
  );
}

export function ScoreDistributionDonut({
  segments,
  total,
}: {
  segments: DistributionSegment[];
  total: number;
}) {
  const nonZero = segments.filter((s) => s.count > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <DashboardCard title="Score Distribution (Overall)" bodyClassName="px-3 pb-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="relative h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nonZero}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={2}
                  animationDuration={800}
                >
                  {nonZero.map((s) => (
                    <Cell key={s.tier} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold tabular-nums">{total}</span>
              <span className="text-[9px] font-medium text-muted-foreground">Responses</span>
            </div>
          </div>
          <ul className="min-w-0 flex-1 space-y-1">
            {segments.map((s) => (
              <li
                key={s.tier}
                className="flex items-center justify-between gap-1 text-[11px] font-medium"
              >
                <span className="flex min-w-0 items-center gap-1 truncate">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate text-muted-foreground">{s.label}</span>
                </span>
                <span className="shrink-0 tabular-nums text-foreground">{s.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      </DashboardCard>
    </motion.div>
  );
}

export function BottomAnalyticsRow({
  total,
  cityName,
  overallFive,
  overall100,
  parameters,
  distribution,
}: {
  total: number;
  cityName: string;
  overallFive: number;
  overall100: number;
  parameters: ParameterAverage[];
  distribution: DistributionSegment[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard count={total} cityName={cityName} />
      <OverallScoreCard scoreFive={overallFive} score100={overall100} />
      <ParameterBarChart parameters={parameters} />
      <ScoreDistributionDonut segments={distribution} total={total} />
    </div>
  );
}

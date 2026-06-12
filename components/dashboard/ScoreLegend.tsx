"use client";

import { LEGEND_TIERS, tierColor, TIER_LABELS } from "@/lib/analytics/parameters";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function ScoreLegend() {
  return (
    <DashboardCard title="Legend (Average Score)" bodyClassName="px-5 pb-4 pt-2">
      <ul className="space-y-3">
        {LEGEND_TIERS.map((item) => (
          <li
            key={item.tier}
            className="flex items-center gap-2.5 text-[12px] font-medium"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: tierColor(item.tier) }}
            />
            <span className="tabular-nums text-muted-foreground">{item.range}</span>
            <span className="text-foreground/80">({TIER_LABELS[item.tier]})</span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}

"use client";

import {
  Shield,
  Zap,
  Route,
  Building2,
  Landmark,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParameterAverage, ParameterId } from "@/lib/analytics/parameters";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { tierBadgeClassForTier } from "@/lib/ui/tier-badge";

const ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  zap: Zap,
  route: Route,
  building: Building2,
  landmark: Landmark,
  heart: Heart,
};

interface ParameterPanelProps {
  parameters: ParameterAverage[];
  selectedId: ParameterId;
  onSelect: (id: ParameterId) => void;
}

export function ParameterPanel({
  parameters,
  selectedId,
  onSelect,
}: ParameterPanelProps) {
  const displayParams = parameters.filter((p) => p.id !== "overall");

  return (
    <DashboardCard
      title={
        <>
          Parameters{" "}
          <span className="font-normal text-muted-foreground">(Scale 1 – 5)</span>
        </>
      }
      bodyClassName="px-0 pb-0"
    >
      <ul>
        {displayParams.map((p) => {
          const Icon = ICONS[p.icon] ?? Shield;
          const active = selectedId === p.id;
          return (
            <li key={p.id} className="border-b border-border/60 last:border-0">
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                className={cn(
                  "grid w-full grid-cols-[20px_1fr_40px_72px] items-center gap-3 px-5 py-3.5 text-left transition-colors",
                  active
                    ? "border-l-2 border-l-indigo-500 bg-indigo-50/50 pl-[18px] dark:bg-indigo-950/30"
                    : "border-l-2 border-l-transparent hover:bg-muted/30"
                )}
              >
                <Icon
                  className="h-3.5 w-3.5 text-muted-foreground/70"
                  strokeWidth={1.5}
                  style={{ color: active ? p.color : undefined }}
                />
                <span className="dashboard-body truncate">{p.label}</span>
                <span className="text-right text-[15px] font-semibold tabular-nums text-foreground">
                  {p.scoreFive}
                </span>
                <span
                  className={cn(
                    "justify-self-end rounded-full px-2.5 py-1 text-center text-[11px] font-medium",
                    tierBadgeClassForTier(p.tier)
                  )}
                >
                  {p.badge}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}

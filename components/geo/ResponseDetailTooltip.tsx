import type { ResponseDetailSection } from "@/lib/analytics/response-detail";
import { cn } from "@/lib/utils";

function tierBadgeClass(tier: string): string {
  const lower = tier.toLowerCase();
  if (lower.includes("good")) {
    return "bg-green-50 text-green-700";
  }
  if (lower === "average") {
    return "bg-yellow-50 text-yellow-800";
  }
  return "bg-orange-50 text-orange-700";
}

function handleSectionsWheel(e: React.WheelEvent<HTMLDivElement>) {
  e.stopPropagation();
  const el = e.currentTarget;
  const atTop = el.scrollTop <= 0;
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
  if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
    e.preventDefault();
  }
}

export function ResponseDetailTooltip({
  label,
  subtitle,
  averageScoreFive,
  averageTier,
  overallStars,
  sections,
}: {
  label: string;
  subtitle?: string;
  averageScoreFive?: number;
  averageTier?: string;
  overallStars?: string;
  sections?: ResponseDetailSection[];
}) {
  const hasAverage = averageScoreFive !== undefined;

  return (
    <div className="max-w-sm rounded-lg border border-border/60 bg-white p-3 text-sm shadow-lg">
      <div className="border-b border-border/60 pb-2">
        <p className="text-base font-semibold text-foreground">{label}</p>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
        {hasAverage && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-semibold text-foreground">
                {averageScoreFive}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / 5
              </span>
            </div>
            {overallStars && (
              <span className="text-sm leading-none">{overallStars}</span>
            )}
            {averageTier && (
              <span
                className={cn(
                  "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                  tierBadgeClass(averageTier)
                )}
              >
                {averageTier}
              </span>
            )}
          </div>
        )}
      </div>
      {sections && sections.length > 0 && (
        <div
          className="max-h-72 space-y-2 overflow-y-auto pt-2"
          onWheel={handleSectionsWheel}
        >
          {sections.map((section, index) => (
            <div key={`${section.label}-${index}`}>
              {index > 0 && <hr className="my-2 border-border/40" />}
              <p className="text-sm font-medium text-foreground">
                {section.label}
                {section.stars ? ` — ${section.stars}` : ""}
              </p>
              {section.testimonial && (
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {section.testimonial}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

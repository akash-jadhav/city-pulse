export const RECHARTS_TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

export const RECHARTS_TOOLTIP_LABEL_STYLE = {
  color: "var(--popover-foreground)",
} as const;

export const RECHARTS_GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "var(--border)",
} as const;

export const RECHARTS_LEGEND_PROPS = {
  wrapperStyle: { fontSize: 12, color: "var(--foreground)" },
} as const;

export const RECHARTS_AXIS_TICK = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
} as const;

export const RECHARTS_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
] as const;

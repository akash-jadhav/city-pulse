import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function DashboardCard({
  title,
  children,
  className,
  bodyClassName,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {title && (
        <h3 className="dashboard-title px-4 pt-4 pb-2">{title}</h3>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  highlight?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  highlight = false,
}: StatsCardProps) {
  return (
    <div className={cn("stat-card relative", highlight && "highlight")}>
      <span className="stat-label">{title}</span>
      <span className="stat-value">{value}</span>
      {description && (
        <span className={cn("text-xs", highlight ? "text-white/70" : "text-muted-foreground")}>
          {description}
        </span>
      )}
      {Icon && !highlight && (
        <Icon
          className="absolute right-6 top-6 h-5 w-5 text-muted-foreground opacity-40"
          aria-hidden
        />
      )}
    </div>
  );
}

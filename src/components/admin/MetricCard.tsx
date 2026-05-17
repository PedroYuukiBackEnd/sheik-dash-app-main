import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Props = {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon: LucideIcon;
  highlight?: "default" | "danger" | "primary";
  pulse?: boolean;
  subtitle?: string;
};

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  highlight = "default",
  pulse,
  subtitle,
}: Props) {
  const tone =
    highlight === "danger"
      ? "border-destructive/40 bg-destructive/5"
      : highlight === "primary"
        ? "border-primary/30 bg-primary/5"
        : "border-border bg-card";

  const iconTone =
    highlight === "danger"
      ? "bg-destructive/15 text-destructive"
      : "bg-primary/15 text-primary";

  return (
    <div
      className={`relative rounded-xl border ${tone} p-5 transition-all duration-200 hover:border-primary/40`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconTone} ${
            pulse ? "animate-alert-pulse" : ""
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${
              delta.positive ? "text-success" : "text-destructive"
            }`}
          >
            {delta.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
          <span className="text-muted-foreground">vs mês anterior</span>
        </div>
      )}
    </div>
  );
}

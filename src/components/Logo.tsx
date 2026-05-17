import { Droplet } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow glow-primary">
        <Droplet className="h-5 w-5 text-primary-foreground" fill="currentColor" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-extrabold tracking-tight">SHEIK DO ÓLEO</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Gestão Premium
          </div>
        </div>
      )}
    </div>
  );
}

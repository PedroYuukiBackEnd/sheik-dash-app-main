import { Link, useRouterState } from "@tanstack/react-router";
import { Wrench, Plus, LogOut, History } from "lucide-react";
import { Logo } from "@/components/Logo";
import type { ReactNode } from "react";

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const tab = (p: string) => pathname === p;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col border-x border-border bg-background relative pb-20">
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
          <Logo />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </Link>
        </header>

        <main className="flex-1">{children}</main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-border bg-card/95 backdrop-blur z-30">
          <div className="grid grid-cols-3 h-16">
            <Link
              to="/mecanico"
              className={`flex flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                tab("/mecanico") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Wrench className="h-5 w-5" />
              OSs
            </Link>
            <Link
              to="/mecanico/nova-os"
              className="flex flex-col items-center justify-center"
            >
              <div className="flex h-12 w-12 -mt-4 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground glow-primary">
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </div>
            </Link>
            <Link
              to="/mecanico"
              search={{ tab: "historico" }}
              className="flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
            >
              <History className="h-5 w-5" />
              Histórico
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}

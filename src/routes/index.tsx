import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Wrench, MapPin, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Sheik do Óleo — Acesso" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,87,34,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.08),transparent_50%)] pointer-events-none" />

      <div className="relative w-full max-w-3xl">
        <div className="flex flex-col items-center text-center mb-10">
          <Logo />
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Gestão & Retenção <span className="text-primary">Premium</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            Plataforma operacional para centros automotivos especializados em troca de óleo.
            Selecione o perfil para iniciar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/login"
            search={{ dest: "admin" }}
            className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary mb-4 group-hover:bg-primary/25 transition-colors">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">Painel do Administrador</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Métricas, financeiro, CRM e controle de estoque industrial. Visão completa do negócio.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
              Acessar painel <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            to="/login"
            search={{ dest: "mecanico" }}
            className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/20 text-accent mb-4 group-hover:bg-accent/30 transition-colors">
              <Wrench className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">Aplicativo do Mecânico</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Otimizado para tablet e celular. Abertura de OS, checklist e fechamento direto no boxe.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-accent">
              Abrir app de campo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          Av. Casa Verde, 2817 — Casa Verde, São Paulo/SP · 02520-003
        </div>
      </div>
    </div>
  );
}

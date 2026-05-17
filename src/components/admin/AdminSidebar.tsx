import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Package, Wallet, LogOut, MapPin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

const items = [
  { to: "/admin", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/clientes", label: "Clientes & Frota", icon: Users, exact: false },
  { to: "/admin/estoque", label: "Estoque", icon: Package, exact: false },
  { to: "/admin/financeiro", label: "Fluxo de Caixa", icon: Wallet, exact: false },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const sair = async () => {
    try {
      await signOut();
      navigate({ to: "/" });
    } catch {
      toast.error("Erro ao sair");
    }
  };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {items.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? "bg-primary/15 text-foreground border border-primary/30"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
          <span>Av. Casa Verde, 2817<br />Casa Verde · São Paulo/SP</span>
        </div>
        <button
          type="button"
          onClick={() => void sair()}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </aside>
  );
}

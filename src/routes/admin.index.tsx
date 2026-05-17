import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Activity,
  Package as PackageIcon,
} from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { RevenueChart, PaymentPieChart } from "@/components/admin/Charts";
import { brl } from "@/lib/store";
import { useProdutos, useOrdens, useClientes, useMetricas } from "@/hooks/use-sheik-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Sheik do Óleo — Visão Geral" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: produtos = [] } = useProdutos();
  const { data: ordens = [] } = useOrdens();
  const { data: clientes = [] } = useClientes();
  const { data: metricas } = useMetricas();
  const alertas = produtos.filter((p) => p.quantidade <= p.estoqueMinimo);

  const ultimasOS = ordens.filter((o) => o.status === "finalizada").slice(0, 5);
  const m = metricas ?? {
    faturamentoDia: 0,
    faturamentoMes: 0,
    lucroLiquidoMes: 0,
    taxaRetencao: 0,
    alertasEstoque: 0,
    ticketMedio: 0,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operação de hoje · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
        <div className="text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5 bg-card">
          Atualizado agora
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Faturamento — Dia"
          value={brl(m.faturamentoDia)}
          delta={{ value: "12,3%", positive: true }}
          icon={DollarSign}
          highlight="primary"
        />
        <MetricCard
          label="Faturamento — Mês"
          value={brl(m.faturamentoMes)}
          delta={{ value: "18,4%", positive: true }}
          icon={TrendingUp}
        />
        <MetricCard
          label="Lucro Líquido Real"
          value={brl(m.lucroLiquidoMes)}
          subtitle="Margem 36,5% após custo de produto"
          delta={{ value: "9,7%", positive: true }}
          icon={Activity}
        />
        <MetricCard
          label="Taxa de Retenção"
          value={`${m.taxaRetencao}%`}
          subtitle="Clientes que retornam em 6 meses"
          delta={{ value: "4,2%", positive: true }}
          icon={Users}
        />
      </div>

      {alertas.length > 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20 text-destructive animate-alert-pulse shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  Estoque crítico — {alertas.length} {alertas.length === 1 ? "item" : "itens"} abaixo do mínimo
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reposição urgente para evitar perda de OS.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-destructive bg-destructive/15 px-2.5 py-1 rounded-md">
              Ação imediata
            </span>
          </div>
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {alertas.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md bg-card border border-border px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <PackageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{p.nome}</span>
                </div>
                <span className="font-bold text-destructive tabular-nums shrink-0">
                  {p.quantidade}/{p.estoqueMinimo}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <PaymentPieChart />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Últimas Ordens Finalizadas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">5 OSs mais recentes</p>
          </div>
          <span className="text-xs text-muted-foreground">Ticket médio {brl(m.ticketMedio)}</span>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left font-medium px-2 py-2">OS</th>
                <th className="text-left font-medium px-2 py-2">Cliente</th>
                <th className="text-left font-medium px-2 py-2">Mecânico</th>
                <th className="text-left font-medium px-2 py-2">Pagamento</th>
                <th className="text-right font-medium px-2 py-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {ultimasOS.map((os) => {
                const cli = clientes.find((c) => c.id === os.clienteId);
                const total = os.itens.reduce((a, i) => a + i.quantidade * i.precoUnit, 0) + os.maoDeObra;
                return (
                  <tr key={os.id} className="border-t border-border/70 hover:bg-secondary/30 transition-colors">
                    <td className="px-2 py-3 font-mono text-xs text-primary">{os.numero}</td>
                    <td className="px-2 py-3">{cli?.nome ?? "—"}</td>
                    <td className="px-2 py-3 text-muted-foreground">{os.mecanico}</td>
                    <td className="px-2 py-3">
                      <span className="text-xs bg-secondary/60 border border-border rounded px-2 py-0.5">
                        {os.formaPagamento}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right font-semibold tabular-nums">{brl(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

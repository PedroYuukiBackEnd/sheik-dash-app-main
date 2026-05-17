import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Clock, CheckCircle2, Car } from "lucide-react";
import { brl } from "@/lib/store";
import { useOrdens, useClientes } from "@/hooks/use-sheik-data";

export const Route = createFileRoute("/mecanico/")({
  head: () => ({ meta: [{ title: "Sheik do Óleo — App Mecânico" }] }),
  component: MecanicoHome,
});

function MecanicoHome() {
  const { data: ordens = [] } = useOrdens();
  const { data: clientes = [] } = useClientes();
  const abertas = ordens.filter((o) => o.status !== "finalizada");
  const finalizadas = ordens.filter((o) => o.status === "finalizada").slice(0, 6);

  const findCliente = (id: string) => clientes.find((c) => c.id === id);
  const findVeiculo = (cId: string, vId: string) =>
    findCliente(cId)?.veiculos.find((v) => v.id === vId);

  return (
    <div className="p-4 space-y-5">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold uppercase tracking-wider">Em Aberto</h2>
          <span className="text-xs text-muted-foreground">{abertas.length} OSs</span>
        </div>
        {abertas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma OS aberta. Toque em <span className="text-primary font-semibold">+</span> para iniciar.
          </div>
        ) : (
          <ul className="space-y-2">
            {abertas.map((o) => {
              const c = findCliente(o.clienteId);
              const v = findVeiculo(o.clienteId, o.veiculoId);
              return (
                <li key={o.id}>
                  <Link
                    to="/mecanico/os/$osId/execucao"
                    params={{ osId: o.id }}
                    className="block rounded-xl border border-primary/30 bg-primary/5 p-4 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{o.numero}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 rounded px-2 py-0.5 font-bold">
                        <Clock className="h-3 w-3" /> {o.status === "aberta" ? "Aguardando" : "Em execução"}
                      </span>
                    </div>
                    <div className="mt-2 font-semibold">{c?.nome ?? "—"}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Car className="h-3.5 w-3.5" />
                      <span className="font-mono font-bold text-foreground">{v?.placa}</span>
                      <span>· {v?.marca} {v?.modelo} · {o.kmEntrada.toLocaleString("pt-BR")} km</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold uppercase tracking-wider">Concluídas Hoje</h2>
          <span className="text-xs text-muted-foreground">{finalizadas.length}</span>
        </div>
        <ul className="space-y-2">
          {finalizadas.map((o) => {
            const c = findCliente(o.clienteId);
            const v = findVeiculo(o.clienteId, o.veiculoId);
            const total = o.itens.reduce((a, i) => a + i.quantidade * i.precoUnit, 0) + o.maoDeObra;
            return (
              <li key={o.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{o.numero}</span>
                  <span className="inline-flex items-center gap-1 text-success text-[10px] uppercase font-bold">
                    <CheckCircle2 className="h-3 w-3" /> Finalizada
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c?.nome}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {v?.placa} · {o.mecanico}
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums shrink-0">{brl(total)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

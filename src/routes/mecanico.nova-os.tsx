import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Car, ChevronRight, Gauge } from "lucide-react";
import { useClientes, useSheikMutations } from "@/hooks/use-sheik-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
export const Route = createFileRoute("/mecanico/nova-os")({
  head: () => ({ meta: [{ title: "Sheik do Óleo — Nova OS" }] }),
  component: NovaOS,
});

const checks = [
  { key: "fluidoFreio", label: "Fluido de Freio" },
  { key: "filtroAr", label: "Filtro de Ar" },
  { key: "aguaRadiador", label: "Água do Radiador" },
  { key: "luzesPainel", label: "Luzes do Painel" },
] as const;

function NovaOS() {
  const navigate = useNavigate();
  const { data: clientes = [] } = useClientes();
  const { novaOS } = useSheikMutations();

  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [veiculoSel, setVeiculoSel] = useState<{ clienteId: string; veiculoId: string } | null>(null);
  const [km, setKm] = useState("");
  const [checklist, setChecklist] = useState({
    fluidoFreio: false, filtroAr: false, aguaRadiador: false, luzesPainel: false,
  });

  const sugestoes = useMemo(() => {
    if (!search.trim()) return [];
    return clientes.flatMap((c) =>
      c.veiculos
        .filter((v) => v.placa.toLowerCase().includes(search.toLowerCase()))
        .map((v) => ({ cliente: c, veiculo: v })),
    ).slice(0, 5);
  }, [search]);

  const clienteSel = veiculoSel && clientes.find((c) => c.id === veiculoSel.clienteId);
  const vSel = clienteSel?.veiculos.find((v) => v.id === veiculoSel?.veiculoId);

  const iniciar = async () => {
    if (!veiculoSel || !km) {
      toast.error("Selecione veículo e informe a quilometragem");
      return;
    }
    try {
      const os = await novaOS.mutateAsync({
        clienteId: veiculoSel.clienteId,
        veiculoId: veiculoSel.veiculoId,
        kmEntrada: Number(km),
        checklist,
      });
      toast.success("OS aberta — pode iniciar a execução");
      navigate({ to: "/mecanico/os/$osId/execucao", params: { osId: os.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar OS");
    }
  };

  return (
    <div className="p-4 space-y-5">
      <Stepper current={1} />

      <header>
        <h1 className="text-xl font-bold">Nova Ordem de Serviço</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Etapa 1 — Veículo, KM e inspeção</p>
      </header>

      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
          Buscar veículo pela placa
        </label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ex: FXP2A45"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value.toUpperCase());
              setVeiculoSel(null);
            }}
            className="pl-10 h-12 text-base font-mono bg-card border-border"
          />
        </div>

        {sugestoes.length > 0 && !veiculoSel && (
          <ul className="mt-2 space-y-1.5">
            {sugestoes.map(({ cliente, veiculo }) => (
              <li key={veiculo.id}>
                <button
                  onClick={() => {
                    setVeiculoSel({ clienteId: cliente.id, veiculoId: veiculo.id });
                    setKm(String(veiculo.kmAtual));
                    setSearch(veiculo.placa);
                  }}
                  className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 text-left active:bg-secondary/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-sm bg-primary/15 border border-primary/30 rounded px-1.5 py-0.5">
                        {veiculo.placa}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{veiculo.marca} {veiculo.modelo}</span>
                    </div>
                    <div className="text-xs mt-1 truncate">{cliente.nome}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {vSel && clienteSel && (
          <div className="mt-3 rounded-xl border border-primary/40 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              <span className="font-mono font-bold text-primary">{vSel.placa}</span>
            </div>
            <div className="mt-1 font-semibold">{vSel.marca} {vSel.modelo} · {vSel.ano}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{clienteSel.nome} · {clienteSel.whatsapp}</div>
          </div>
        )}
      </section>

      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
          Quilometragem de Entrada
        </label>
        <div className="relative mt-1.5">
          <Gauge className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="pl-10 h-12 text-base font-bold tabular-nums bg-card border-border"
          />
          <span className="absolute right-3 top-3.5 text-xs text-muted-foreground">km</span>
        </div>
      </section>

      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
          Checklist de Inspeção Rápida
        </label>
        <ul className="mt-2 space-y-2">
          {checks.map((c) => {
            const checked = checklist[c.key];
            return (
              <li key={c.key}>
                <button
                  onClick={() => setChecklist({ ...checklist, [c.key]: !checked })}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors text-left ${
                    checked
                      ? "border-success/50 bg-success/10"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="font-medium">{c.label}</span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md border-2 transition-colors ${
                      checked
                        ? "border-success bg-success text-success-foreground"
                        : "border-border"
                    }`}
                  >
                    {checked && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Button
        onClick={iniciar}
        className="w-full h-14 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
      >
        Iniciar Execução →
      </Button>
    </div>
  );
}

export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Veículo", "Execução", "Fechamento"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-success text-success-foreground"
                    : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {n}
            </div>
            <span className={`text-xs font-medium truncate ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {s}
            </span>
            {n < 3 && <div className={`h-px flex-1 ${done ? "bg-success" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

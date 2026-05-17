import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle2, MessageCircle, CalendarClock } from "lucide-react";
import { brl } from "@/lib/store";
import { useOrdem, useClientes, useSheikMutations } from "@/hooks/use-sheik-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Stepper } from "@/routes/mecanico.nova-os";
import type { FormaPagamento } from "@/lib/types";

export const Route = createFileRoute("/mecanico/os/$osId/fechamento")({
  head: () => ({ meta: [{ title: "Sheik do Óleo — Fechamento OS" }] }),
  component: Fechamento,
});

const formas: FormaPagamento[] = ["Pix", "Cartão Crédito", "Cartão Débito", "Dinheiro"];

function Fechamento() {
  const { osId } = Route.useParams();
  const navigate = useNavigate();
  const { data: os, isLoading } = useOrdem(osId);
  const { data: clientes = [] } = useClientes();
  const { finalizarOS } = useSheikMutations();

  const [pgto, setPgto] = useState<FormaPagamento | null>(null);

  useEffect(() => {
    if (os?.formaPagamento) setPgto(os.formaPagamento);
  }, [os?.formaPagamento]);

  if (isLoading) {
    return <div className="p-6 text-center text-sm text-muted-foreground">Carregando…</div>;
  }

  if (!os) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">OS não encontrada.</p>
        <Link to="/mecanico" className="text-primary text-sm mt-3 inline-block">← Voltar</Link>
      </div>
    );
  }

  const cliente = clientes.find((c) => c.id === os.clienteId);
  const veiculo = cliente?.veiculos.find((v) => v.id === os.veiculoId);
  const subtotal = os.itens.reduce((a, i) => a + i.quantidade * i.precoUnit, 0);
  const total = subtotal + os.maoDeObra;

  const finalizar = async () => {
    if (!pgto) { toast.error("Selecione a forma de pagamento"); return; }
    try {
      await finalizarOS.mutateAsync({ osId, formaPagamento: pgto });
      toast.success("Serviço finalizado!", {
        description: `Baixa de estoque, fluxo de caixa e alerta WhatsApp processados no Supabase.`,
        duration: 5000,
      });
      setTimeout(() => navigate({ to: "/mecanico" }), 600);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar OS");
    }
  };

  return (
    <div className="p-4 space-y-5">
      <Stepper current={3} />

      <header>
        <h1 className="text-xl font-bold">Fechamento</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          <span className="font-mono text-primary">{os.numero}</span> · {cliente?.nome} · {veiculo?.placa}
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Resumo</h2>
        <ul className="space-y-2">
          {os.itens.map((i, idx) => (
            <li key={idx} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate pr-2">
                {i.quantidade}× {i.nome}
              </span>
              <span className="tabular-nums shrink-0">{brl(i.quantidade * i.precoUnit)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border my-3" />
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Peças</span><span className="tabular-nums">{brl(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Mão de obra</span><span className="tabular-nums">{brl(os.maoDeObra)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
            <span>TOTAL</span>
            <span className="tabular-nums text-primary">{brl(total)}</span>
          </div>
        </div>
      </section>

      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
          Forma de pagamento
        </label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {formas.map((f) => (
            <button
              key={f}
              onClick={() => setPgto(f)}
              className={`h-14 rounded-xl border font-semibold text-sm transition-colors ${
                pgto === f
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-start gap-3">
          <CalendarClock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Retenção automática</p>
            <p className="text-xs text-muted-foreground mt-1">
              O banco agenda alerta automático:{" "}
              <span className="text-foreground font-semibold">6 meses</span> (sintético) ou{" "}
              <span className="text-foreground font-semibold">3 meses</span> (demais óleos) via WhatsApp{" "}
              <MessageCircle className="h-3 w-3 inline text-accent" />.
            </p>
          </div>
        </div>
      </section>

      <Button
        onClick={() => void finalizar()}
        disabled={finalizarOS.isPending}
        className="w-full h-16 text-base font-extrabold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
      >
        <CheckCircle2 className="h-5 w-5" />
        {finalizarOS.isPending ? "FINALIZANDO…" : "FINALIZAR SERVIÇO"}
      </Button>
    </div>
  );
}

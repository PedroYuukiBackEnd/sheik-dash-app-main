import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Camera, User, Wrench } from "lucide-react";
import { brl } from "@/lib/store";
import { useOrdem, useProdutos, useMecanicos, useSheikMutations } from "@/hooks/use-sheik-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Stepper } from "@/routes/mecanico.nova-os";
import type { ItemOS } from "@/lib/types";

export const Route = createFileRoute("/mecanico/os/$osId/execucao")({
  head: () => ({ meta: [{ title: "Sheik do Óleo — Execução OS" }] }),
  component: Execucao,
});

function Execucao() {
  const { osId } = Route.useParams();
  const navigate = useNavigate();
  const { data: os, isLoading } = useOrdem(osId);
  const { data: produtos = [] } = useProdutos();
  const { data: mecanicos = [] } = useMecanicos();
  const { salvarExecucao } = useSheikMutations();

  const [itens, setItens] = useState<ItemOS[]>([]);
  const [q, setQ] = useState("");
  const [qty, setQty] = useState<Record<string, string>>({});
  const [mecanico, setMecanico] = useState("");
  const [maoDeObra, setMaoDeObra] = useState("70");
  const [fotos, setFotos] = useState<string[]>([]);

  useEffect(() => {
    if (os) {
      setItens(os.itens);
      setMecanico(os.mecanico);
      setMaoDeObra(String(os.maoDeObra || 70));
    }
  }, [os]);

  if (isLoading) {
    return <div className="p-6 text-center text-sm text-muted-foreground">Carregando OS…</div>;
  }

  if (!os) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">OS não encontrada.</p>
        <Link to="/mecanico" className="text-primary text-sm mt-3 inline-block">← Voltar</Link>
      </div>
    );
  }

  const filtered = q.trim()
    ? produtos.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  const addItem = (produtoId: string) => {
    const p = produtos.find((x) => x.id === produtoId);
    if (!p) return;
    const quantidade = Number(qty[produtoId] || (p.unidade === "L" ? 4 : 1));
    if (!quantidade) { toast.error("Informe a quantidade"); return; }
    const novo: ItemOS = { produtoId: p.id, nome: p.nome, quantidade, precoUnit: p.precoVenda };
    setItens((prev) => [...prev, novo]);
    setQty({ ...qty, [produtoId]: "" });
    setQ("");
    toast.success(`${p.nome} adicionado`);
  };

  const removeItem = (idx: number) => {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  };

  const irParaFechamento = async () => {
    if (itens.length === 0) { toast.error("Adicione pelo menos um item"); return; }
    if (!mecanico) { toast.error("Selecione o mecânico responsável"); return; }
    try {
      await salvarExecucao.mutateAsync({
        osId,
        itens,
        mecanico,
        maoDeObra: Number(maoDeObra) || 0,
      });
      navigate({ to: "/mecanico/os/$osId/fechamento", params: { osId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar execução");
    }
  };

  const subtotal = itens.reduce((a, i) => a + i.quantidade * i.precoUnit, 0);

  return (
    <div className="p-4 space-y-5">
      <Stepper current={2} />

      <header>
        <h1 className="text-xl font-bold">Execução</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          <span className="font-mono text-primary">{os.numero}</span> · {os.kmEntrada.toLocaleString("pt-BR")} km
        </p>
      </header>

      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
          Adicionar peças/lubrificantes
        </label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-12 bg-card border-border"
          />
        </div>
        {filtered.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {filtered.map((p) => (
              <li key={p.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-tight">{p.nome}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {p.sku} · {brl(p.precoVenda)}/{p.unidade}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Input
                      type="number"
                      step={p.unidade === "L" ? "0.1" : "1"}
                      placeholder={p.unidade === "L" ? "4.0" : "1"}
                      value={qty[p.id] ?? ""}
                      onChange={(e) => setQty({ ...qty, [p.id]: e.target.value })}
                      className="w-16 h-9 text-center text-sm bg-background"
                    />
                    <Button
                      size="sm"
                      onClick={() => addItem(p.id)}
                      className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {itens.length > 0 && (
        <section>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
            Itens lançados ({itens.length})
          </label>
          <ul className="mt-2 space-y-2">
            {itens.map((i, idx) => (
              <li key={idx} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{i.nome}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {i.quantidade} × {brl(i.precoUnit)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold tabular-nums">{brl(i.quantidade * i.precoUnit)}</span>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/15"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal peças</span>
            <span className="font-bold tabular-nums">{brl(subtotal)}</span>
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
            <User className="h-3 w-3 inline mr-1" /> Mecânico
          </label>
          <Select value={mecanico} onValueChange={setMecanico}>
            <SelectTrigger className="h-12 mt-1.5 bg-card border-border">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {mecanicos.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
            <Wrench className="h-3 w-3 inline mr-1" /> Mão de obra
          </label>
          <Input
            type="number"
            value={maoDeObra}
            onChange={(e) => setMaoDeObra(e.target.value)}
            className="h-12 mt-1.5 text-base font-bold tabular-nums bg-card border-border"
          />
        </div>
      </section>

      <section>
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
          Fotos do motor / peças
        </label>
        <button
          onClick={() => {
            setFotos([...fotos, `foto-${fotos.length + 1}`]);
            toast.success("Foto anexada (simulado)");
          }}
          className="mt-1.5 w-full h-20 rounded-xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs">Tocar para anexar ({fotos.length})</span>
        </button>
      </section>

      <Button
        onClick={() => void irParaFechamento()}
        disabled={salvarExecucao.isPending}
        className="w-full h-14 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
      >
        {salvarExecucao.isPending ? "Salvando…" : "Ir para Fechamento →"}
      </Button>
    </div>
  );
}

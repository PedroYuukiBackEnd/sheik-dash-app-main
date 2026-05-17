import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus, Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { brl } from "@/lib/store";
import { useLancamentos, useSheikMutations } from "@/hooks/use-sheik-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { CategoriaDespesa } from "@/lib/types";

const CATEGORIAS: CategoriaDespesa[] = ["Aluguel", "Energia", "Água", "Ferramentas", "Fornecedores", "Marketing", "Salários", "Outros"];

export const Route = createFileRoute("/admin/financeiro")({
  head: () => ({ meta: [{ title: "Sheik do Óleo — Fluxo de Caixa" }] }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const { data: lancamentos = [], isLoading } = useLancamentos();
  const { addDespesa } = useSheikMutations();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ descricao: string; valor: string; categoria: CategoriaDespesa }>({
    descricao: "", valor: "", categoria: "Outros",
  });

  const { entradas, saidas, totalEntradas, totalSaidas, saldo } = useMemo(() => {
    const e = lancamentos.filter((l) => l.tipo === "entrada");
    const s = lancamentos.filter((l) => l.tipo === "saida");
    const tE = e.reduce((a, l) => a + l.valor, 0);
    const tS = s.reduce((a, l) => a + l.valor, 0);
    return { entradas: e, saidas: s, totalEntradas: tE, totalSaidas: tS, saldo: tE - tS };
  }, [lancamentos]);

  const submit = async () => {
    if (!form.descricao || !form.valor) { toast.error("Descrição e valor obrigatórios"); return; }
    try {
      await addDespesa.mutateAsync({
        descricao: form.descricao,
        valor: Number(form.valor),
        categoria: form.categoria,
      });
      toast.success("Despesa lançada");
      setOpen(false);
      setForm({ descricao: "", valor: "", categoria: "Outros" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao lançar despesa");
    }
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground text-sm">Carregando fluxo de caixa…</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Entradas geradas por OSs + lançamento manual de despesas</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-success/30 bg-success/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Entradas</p>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="text-2xl font-bold mt-2 tabular-nums text-success">{brl(totalEntradas)}</p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Saídas</p>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold mt-2 tabular-nums text-destructive">{brl(totalSaidas)}</p>
        </div>
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Saldo</p>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2 tabular-nums">{brl(saldo)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-border bg-card">
          <header className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-success" />
              Entradas (OSs concluídas)
            </h3>
            <span className="text-xs text-muted-foreground">{entradas.length} lançamentos</span>
          </header>
          <ul className="divide-y divide-border">
            {entradas.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l.descricao}</p>
                  <p className="text-xs text-muted-foreground">{new Date(l.data).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className="font-semibold tabular-nums text-success shrink-0">+{brl(l.valor)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <header className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-destructive" />
              Saídas (despesas)
            </h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-3.5 w-3.5" /> Lançar Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Nova Despesa</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Descrição</Label>
                    <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as CategoriaDespesa })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={submit}>Lançar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </header>
          <ul className="divide-y divide-border">
            {saidas.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l.descricao}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase tracking-wider bg-secondary/60 border border-border rounded px-1.5 py-0.5">
                      {l.categoria}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(l.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
                <span className="font-semibold tabular-nums text-destructive shrink-0">−{brl(l.valor)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2, Plus, Search, AlertCircle } from "lucide-react";
import { brl } from "@/lib/store";
import { useProdutos, useSheikMutations } from "@/hooks/use-sheik-data";
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
import type { Produto, CategoriaProduto } from "@/lib/types";

export const Route = createFileRoute("/admin/estoque")({
  head: () => ({ meta: [{ title: "Sheik do Óleo — Controle de Estoque" }] }),
  component: EstoquePage,
});

const CATEGORIAS: CategoriaProduto[] = ["Óleo Motor", "Filtro Óleo", "Filtro Ar", "Filtro Combustível", "Aditivos"];

function EstoquePage() {
  const { data: produtos = [], isLoading } = useProdutos();
  const { saveProduto, removeProduto } = useSheikMutations();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Produto | null>(null);

  const empty = (): Omit<Produto, "id"> => ({
    sku: "", nome: "", categoria: "Óleo Motor",
    precoCusto: 0, precoVenda: 0, quantidade: 0, estoqueMinimo: 0, unidade: "un",
  });
  const [form, setForm] = useState<Omit<Produto, "id">>(empty());

  const filtered = produtos.filter(
    (p) =>
      (cat === "todas" || p.categoria === cat) &&
      (p.nome.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())),
  );

  const onOpenCreate = () => { setEdit(null); setForm(empty()); setOpen(true); };
  const onOpenEdit = (p: Produto) => {
    setEdit(p);
    setForm({ ...p });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.nome || !form.sku) { toast.error("Informe SKU e nome."); return; }
    try {
      const produto: Produto = edit ? { ...form, id: edit.id } : { ...form, id: crypto.randomUUID() };
      await saveProduto.mutateAsync({ produto, isNew: !edit });
      toast.success(edit ? "Produto atualizado" : "Produto cadastrado");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar produto");
    }
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground text-sm">Carregando estoque…</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Estoque</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão milimétrica de lubrificantes, filtros e aditivos
          </p>
        </div>
        <Button onClick={onOpenCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      </header>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por SKU ou nome…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-56 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorias</SelectItem>
            {CATEGORIAS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-secondary/40">
            <tr className="text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left font-medium px-3 py-3">SKU</th>
              <th className="text-left font-medium px-3 py-3">Produto</th>
              <th className="text-left font-medium px-3 py-3">Categoria</th>
              <th className="text-right font-medium px-3 py-3">Custo</th>
              <th className="text-right font-medium px-3 py-3">Venda</th>
              <th className="text-right font-medium px-3 py-3">Margem</th>
              <th className="text-center font-medium px-3 py-3">Estoque</th>
              <th className="text-right font-medium px-3 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const margem = ((p.precoVenda - p.precoCusto) / p.precoVenda) * 100;
              const low = p.quantidade <= p.estoqueMinimo;
              return (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="px-3 py-3 font-medium">{p.nome}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs bg-secondary/60 border border-border rounded px-2 py-0.5">
                      {p.categoria}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{brl(p.precoCusto)}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">{brl(p.precoVenda)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-success">{margem.toFixed(1)}%</td>
                  <td className="px-3 py-3 text-center">
                    {low ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/15 border border-destructive/40 rounded px-2 py-1 animate-alert-pulse">
                        <AlertCircle className="h-3 w-3" /> {p.quantidade}/{p.estoqueMinimo} {p.unidade}
                      </span>
                    ) : (
                      <span className="text-sm tabular-nums">
                        {p.quantidade} <span className="text-muted-foreground">{p.unidade}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onOpenEdit(p)}
                        className="p-1.5 rounded hover:bg-primary/15 text-muted-foreground hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          void removeProduto.mutateAsync(p.id).then(() => toast.success("Produto removido"));
                        }}
                        className="p-1.5 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={form.unidade} onValueChange={(v: "L" | "un") => setForm({ ...form, unidade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade</SelectItem>
                  <SelectItem value="L">Litro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as CategoriaProduto })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preço de Custo (R$)</Label>
              <Input type="number" step="0.01" value={form.precoCusto} onChange={(e) => setForm({ ...form, precoCusto: +e.target.value })} />
            </div>
            <div>
              <Label>Preço de Venda (R$)</Label>
              <Input type="number" step="0.01" value={form.precoVenda} onChange={(e) => setForm({ ...form, precoVenda: +e.target.value })} />
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: +e.target.value })} />
            </div>
            <div>
              <Label>Estoque Mínimo</Label>
              <Input type="number" value={form.estoqueMinimo} onChange={(e) => setForm({ ...form, estoqueMinimo: +e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={submit}>
              {edit ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

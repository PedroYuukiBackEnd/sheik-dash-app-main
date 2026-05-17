import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Plus, Car, Phone, IdCard, Search, Loader2 } from "lucide-react";
import { useClientes, useSheikMutations } from "@/hooks/use-sheik-data";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({ meta: [{ title: "Sheik do Óleo — Clientes & Frota" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const { data: clientes = [], isLoading, isError } = useClientes();
  const { addCliente } = useSheikMutations();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const [form, setForm] = useState({
    nome: "", whatsapp: "", cpf: "", placa: "", marca: "", modelo: "", km: "",
  });

  const filtered = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(q.toLowerCase()) ||
      c.cpf.includes(q) ||
      c.veiculos.some((v) => v.placa.toLowerCase().includes(q.toLowerCase())),
  );

  const submit = async () => {
    if (!form.nome || !form.whatsapp || !form.placa) {
      toast.error("Preencha nome, WhatsApp e placa do veículo.");
      return;
    }
    try {
      await addCliente.mutateAsync({
        nome: form.nome,
        whatsapp: form.whatsapp,
        cpf: form.cpf || undefined,
        placa: form.placa,
        marca: form.marca,
        modelo: form.modelo,
        km: Number(form.km) || 0,
      });
      setOpen(false);
      setForm({ nome: "", whatsapp: "", cpf: "", placa: "", marca: "", modelo: "", km: "" });
      toast.success("Cliente cadastrado com sucesso");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar cliente");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando clientes…
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-destructive text-sm">Falha ao carregar clientes. Verifique o Supabase.</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes & Frota</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            CRM com vínculo de veículos e histórico de Km
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nome, CPF ou placa…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 w-72 bg-card border-border"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                <Plus className="h-4 w-4" /> Cadastrar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Novo Cliente + Veículo</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Nome completo</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  />
                </div>
                <div className="col-span-2 mt-2 pt-3 border-t border-border">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Veículo Principal</p>
                </div>
                <div>
                  <Label>Placa</Label>
                  <Input
                    placeholder="ABC1D23"
                    value={form.placa}
                    onChange={(e) => setForm({ ...form, placa: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Marca</Label>
                  <Input
                    placeholder="Chevrolet"
                    value={form.marca}
                    onChange={(e) => setForm({ ...form, marca: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input
                    placeholder="Onix LT 1.0"
                    value={form.modelo}
                    onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Km Atual</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.km}
                    onChange={(e) => setForm({ ...form, km: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => void submit()}
                  disabled={addCliente.isPending}
                >
                  {addCliente.isPending ? "Salvando…" : "Salvar Cliente"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr className="text-xs text-muted-foreground uppercase tracking-wider">
              <th className="w-8 px-3 py-3"></th>
              <th className="text-left font-medium px-3 py-3">Cliente</th>
              <th className="text-left font-medium px-3 py-3">Contato</th>
              <th className="text-left font-medium px-3 py-3">CPF</th>
              <th className="text-left font-medium px-3 py-3">Veículos</th>
              <th className="text-right font-medium px-3 py-3">Cadastrado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const isOpen = expanded === c.id;
              return (
                <>
                  <tr
                    key={c.id}
                    className="border-t border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                  >
                    <td className="px-3 py-3">
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </td>
                    <td className="px-3 py-3 font-medium">{c.nome}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {c.whatsapp}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <IdCard className="h-3.5 w-3.5" /> {c.cpf}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-primary bg-primary/10 border border-primary/30 rounded-md px-2 py-0.5 text-xs font-semibold">
                        <Car className="h-3.5 w-3.5" /> {c.veiculos.length}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                      {new Date(c.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={c.id + "-exp"} className="border-t border-border bg-background/60">
                      <td colSpan={6} className="px-12 py-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {c.veiculos.map((v) => (
                            <div
                              key={v.id}
                              className="rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/30">
                                  {v.placa}
                                </span>
                                <span className="text-[11px] text-muted-foreground">{v.ano}</span>
                              </div>
                              <div className="mt-2 font-medium text-sm">{v.marca} {v.modelo}</div>
                              <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                                {v.kmAtual.toLocaleString("pt-BR")} km
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

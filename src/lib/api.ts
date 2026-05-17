import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  mapCliente,
  mapProduto,
  mapOrdemServico,
  mapLancamento,
  joinModeloMarca,
  mapStatusToDb,
} from "@/lib/db-mappers";
import type { Cliente, Produto, OrdemServico, Lancamento, CategoriaDespesa } from "@/lib/types";

// ---------------------------------------------------------------------------
// Perfil / Admin
// ---------------------------------------------------------------------------

export async function fetchIsAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("perfis_usuarios")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin";
}

export async function fetchMecanicos(): Promise<string[]> {
  const { data, error } = await supabase
    .from("perfis_usuarios")
    .select("nome")
    .eq("role", "mecanico");
  if (error) throw error;
  return (data ?? []).map((m) => m.nome);
}

// ---------------------------------------------------------------------------
// Clientes + Veículos
// ---------------------------------------------------------------------------

export async function fetchClientes(): Promise<Cliente[]> {
  const [{ data: clientes, error: e1 }, { data: veiculos, error: e2 }] = await Promise.all([
    supabase.from("clientes").select("*").order("criado_em", { ascending: false }),
    supabase.from("veiculos").select("*"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  return (clientes ?? []).map((c) => mapCliente(c, veiculos ?? []));
}

export async function createClienteComVeiculo(input: {
  nome: string;
  whatsapp: string;
  cpf?: string;
  placa: string;
  marca: string;
  modelo: string;
  km: number;
}): Promise<Cliente> {
  const { data: cliente, error: e1 } = await supabase
    .from("clientes")
    .insert({
      nome: input.nome,
      whatsapp: input.whatsapp,
      cpf: input.cpf || null,
    })
    .select()
    .single();
  if (e1) throw e1;

  const { data: veiculo, error: e2 } = await supabase
    .from("veiculos")
    .insert({
      cliente_id: cliente.id,
      placa: input.placa.toUpperCase(),
      modelo_marca: joinModeloMarca(input.marca, input.modelo),
      ano: new Date().getFullYear(),
      km_atual: input.km,
    })
    .select()
    .single();
  if (e2) throw e2;

  return mapCliente(cliente, [veiculo]);
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

export async function fetchProdutos(admin = false): Promise<Produto[]> {
  if (admin) {
    const { data, error } = await supabase.from("produtos_estoque").select("*").order("nome");
    if (error) throw error;
    return (data ?? []).map((p) => mapProduto(p));
  }
  const { data, error } = await supabase.from("produtos_estoque_publico").select("*").order("nome");
  if (error) throw error;
  return (data ?? []).map((p) => mapProduto(p, 0));
}

export async function upsertProduto(produto: Produto, isNew: boolean): Promise<void> {
  const row = {
    sku: produto.sku,
    nome: produto.nome,
    categoria: produto.categoria,
    preco_custo: produto.precoCusto,
    preco_venda: produto.precoVenda,
    quantidade_atual: produto.quantidade,
    estoque_minimo: produto.estoqueMinimo,
    unidade: produto.unidade,
  };
  if (isNew) {
    const { error } = await supabase.from("produtos_estoque").insert(row);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("produtos_estoque").update(row).eq("id", produto.id);
    if (error) throw error;
  }
}

export async function deleteProduto(id: string): Promise<void> {
  const { error } = await supabase.from("produtos_estoque").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Ordens de Serviço
// ---------------------------------------------------------------------------

export async function fetchOrdens(): Promise<OrdemServico[]> {
  const { data: ordens, error: e1 } = await supabase
    .from("ordens_servico")
    .select("*")
    .order("criado_em", { ascending: false });
  if (e1) throw e1;

  const ids = (ordens ?? []).map((o) => o.id);
  if (ids.length === 0) return [];

  const { data: itens, error: e2 } = await supabase
    .from("itens_ordem_servico")
    .select("*, produtos_estoque(nome)")
    .in("os_id", ids);
  if (e2) throw e2;

  return (ordens ?? []).map((os) =>
    mapOrdemServico(
      os,
      (itens ?? []).filter((i) => i.os_id === os.id),
    ),
  );
}

export async function fetchOrdemById(id: string): Promise<OrdemServico | null> {
  const { data: os, error: e1 } = await supabase.from("ordens_servico").select("*").eq("id", id).single();
  if (e1) {
    if (e1.code === "PGRST116") return null;
    throw e1;
  }
  const { data: itens, error: e2 } = await supabase
    .from("itens_ordem_servico")
    .select("*, produtos_estoque(nome)")
    .eq("os_id", id);
  if (e2) throw e2;
  return mapOrdemServico(os, itens ?? []);
}

export async function createOrdemServico(input: {
  clienteId: string;
  veiculoId: string;
  kmEntrada: number;
  checklist: OrdemServico["checklist"];
}): Promise<OrdemServico> {
  const numero = `OS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  const { data, error } = await supabase
    .from("ordens_servico")
    .insert({
      numero,
      cliente_id: input.clienteId,
      veiculo_id: input.veiculoId,
      km_entrada: input.kmEntrada,
      checklist: input.checklist,
      status: "em_execucao",
    })
    .select()
    .single();
  if (error) throw error;
  return mapOrdemServico(data, []);
}

export async function updateOrdemExecucao(
  osId: string,
  patch: { mecanico: string; maoDeObra: number },
): Promise<void> {
  const { error } = await supabase
    .from("ordens_servico")
    .update({
      mecanico_nome: patch.mecanico,
      valor_mao_obra: patch.maoDeObra,
    })
    .eq("id", osId);
  if (error) throw error;
}

export async function syncItensOrdem(
  osId: string,
  itens: OrdemServico["itens"],
): Promise<void> {
  const { error: delErr } = await supabase.from("itens_ordem_servico").delete().eq("os_id", osId);
  if (delErr) throw delErr;
  if (itens.length === 0) return;
  const rows = itens.map((i) => ({
    os_id: osId,
    produto_id: i.produtoId,
    quantidade_utilizada: i.quantidade,
    preco_venda_momento: i.precoUnit,
  }));
  const { error } = await supabase.from("itens_ordem_servico").insert(rows);
  if (error) throw error;
}

export async function finalizarOrdemServico(
  osId: string,
  formaPagamento: string,
): Promise<void> {
  const { error } = await supabase
    .from("ordens_servico")
    .update({
      status: mapStatusToDb("finalizada"),
      forma_pagamento: formaPagamento,
      finalizada_em: new Date().toISOString(),
    })
    .eq("id", osId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Fluxo de Caixa
// ---------------------------------------------------------------------------

export async function fetchLancamentos(): Promise<Lancamento[]> {
  const { data, error } = await supabase
    .from("fluxo_caixa")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapLancamento);
}

export async function createDespesa(input: {
  descricao: string;
  valor: number;
  categoria: CategoriaDespesa;
}): Promise<void> {
  const { error } = await supabase.from("fluxo_caixa").insert({
    tipo: "saida",
    descricao: input.descricao,
    valor: input.valor,
    categoria: input.categoria,
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Métricas (dashboard admin)
// ---------------------------------------------------------------------------

export async function fetchMetricasDashboard() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const { data: fluxo } = await supabase
    .from("fluxo_caixa")
    .select("tipo, valor, criado_em")
    .gte("criado_em", inicioMes.toISOString());

  const entradas = (fluxo ?? []).filter((l) => l.tipo === "entrada");
  const saidas = (fluxo ?? []).filter((l) => l.tipo === "saida");
  const faturamentoMes = entradas.reduce((a, l) => a + Number(l.valor), 0);
  const totalSaidas = saidas.reduce((a, l) => a + Number(l.valor), 0);
  const faturamentoDia = entradas
    .filter((l) => new Date(l.criado_em) >= hoje)
    .reduce((a, l) => a + Number(l.valor), 0);

  const produtos = await fetchProdutos(true);
  const alertasEstoque = produtos.filter((p) => p.quantidade <= p.estoqueMinimo).length;

  const { count: totalClientes } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true });

  const { count: osFinalizadas } = await supabase
    .from("ordens_servico")
    .select("*", { count: "exact", head: true })
    .eq("status", "finalizada");

  const ticketMedio = osFinalizadas && osFinalizadas > 0 ? faturamentoMes / osFinalizadas : 0;

  return {
    faturamentoDia,
    faturamentoMes,
    lucroLiquidoMes: faturamentoMes - totalSaidas,
    taxaRetencao: totalClientes ? Math.min(100, Math.round(((osFinalizadas ?? 0) / totalClientes) * 100)) : 0,
    alertasEstoque,
    ticketMedio,
  };
}

export async function fetchFaturamentoDiario(dias = 30) {
  const desde = new Date();
  desde.setDate(desde.getDate() - (dias - 1));
  const { data } = await supabase
    .from("fluxo_caixa")
    .select("valor, criado_em")
    .eq("tipo", "entrada")
    .gte("criado_em", desde.toISOString());

  const mapa = new Map<string, number>();
  for (let i = 0; i < dias; i++) {
    const d = new Date(desde);
    d.setDate(desde.getDate() + i);
    const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    mapa.set(key, 0);
  }
  (data ?? []).forEach((row) => {
    const key = new Date(row.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    mapa.set(key, (mapa.get(key) ?? 0) + Number(row.valor));
  });
  return Array.from(mapa.entries()).map(([data, valor]) => ({ data, valor: Math.round(valor) }));
}

export async function fetchDistribuicaoPagamentos() {
  const { data } = await supabase
    .from("ordens_servico")
    .select("forma_pagamento")
    .eq("status", "finalizada")
    .not("forma_pagamento", "is", null);

  const contagem = new Map<string, number>();
  (data ?? []).forEach((o) => {
    const f = o.forma_pagamento ?? "Outros";
    contagem.set(f, (contagem.get(f) ?? 0) + 1);
  });
  const total = Array.from(contagem.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(contagem.entries()).map(([nome, qtd]) => ({
    nome,
    valor: Math.round((qtd / total) * 100),
  }));
}

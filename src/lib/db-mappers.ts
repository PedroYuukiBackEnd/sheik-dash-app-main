import type {
  Cliente,
  Veiculo,
  Produto,
  OrdemServico,
  Lancamento,
  ItemOS,
  StatusOS,
} from "@/lib/types";
import type { Database } from "@/lib/database.types";

type DbCliente = Database["public"]["Tables"]["clientes"]["Row"];
type DbVeiculo = Database["public"]["Tables"]["veiculos"]["Row"];
type DbProduto = Database["public"]["Tables"]["produtos_estoque"]["Row"];
type DbProdutoPublico = Database["public"]["Views"]["produtos_estoque_publico"]["Row"];
type DbOS = Database["public"]["Tables"]["ordens_servico"]["Row"];
type DbItem = Database["public"]["Tables"]["itens_ordem_servico"]["Row"] & {
  produtos_estoque?: { nome: string } | null;
};
type DbLancamento = Database["public"]["Tables"]["fluxo_caixa"]["Row"];

export function parseModeloMarca(modeloMarca: string): { marca: string; modelo: string } {
  const parts = modeloMarca.trim().split(/\s+/);
  if (parts.length <= 1) return { marca: modeloMarca, modelo: "" };
  return { marca: parts[0], modelo: parts.slice(1).join(" ") };
}

export function joinModeloMarca(marca: string, modelo: string): string {
  return [marca, modelo].filter(Boolean).join(" ").trim();
}

export function mapStatusFromDb(status: DbOS["status"]): StatusOS {
  if (status === "pendente") return "aberta";
  if (status === "em_execucao") return "em_execucao";
  return "finalizada";
}

export function mapStatusToDb(status: StatusOS): DbOS["status"] {
  if (status === "aberta") return "pendente";
  if (status === "em_execucao") return "em_execucao";
  return "finalizada";
}

export function mapVeiculo(v: DbVeiculo): Veiculo {
  const { marca, modelo } = parseModeloMarca(v.modelo_marca);
  return {
    id: v.id,
    placa: v.placa,
    marca,
    modelo,
    ano: v.ano ?? new Date().getFullYear(),
    kmAtual: v.km_atual,
  };
}

export function mapCliente(c: DbCliente, veiculos: DbVeiculo[]): Cliente {
  return {
    id: c.id,
    nome: c.nome,
    whatsapp: c.whatsapp,
    cpf: c.cpf ?? "—",
    criadoEm: c.criado_em,
    veiculos: veiculos.filter((v) => v.cliente_id === c.id).map(mapVeiculo),
  };
}

export function mapProduto(
  p: DbProduto | DbProdutoPublico,
  precoCusto = 0,
): Produto {
  return {
    id: p.id,
    sku: p.sku,
    nome: p.nome,
    categoria: p.categoria as Produto["categoria"],
    precoCusto: "preco_custo" in p ? Number(p.preco_custo) : precoCusto,
    precoVenda: Number(p.preco_venda),
    quantidade: Number(p.quantidade_atual),
    estoqueMinimo: Number(p.estoque_minimo),
    unidade: (p.unidade === "L" ? "L" : "un") as Produto["unidade"],
  };
}

export function mapItemOS(i: DbItem): ItemOS {
  return {
    produtoId: i.produto_id,
    nome: i.produtos_estoque?.nome ?? "",
    quantidade: Number(i.quantidade_utilizada),
    precoUnit: Number(i.preco_venda_momento),
  };
}

export function mapOrdemServico(os: DbOS, itens: DbItem[]): OrdemServico {
  const checklist = (os.checklist ?? {}) as OrdemServico["checklist"];
  return {
    id: os.id,
    numero: os.numero,
    clienteId: os.cliente_id,
    veiculoId: os.veiculo_id,
    kmEntrada: os.km_entrada,
    checklist: {
      fluidoFreio: Boolean(checklist.fluidoFreio),
      filtroAr: Boolean(checklist.filtroAr),
      aguaRadiador: Boolean(checklist.aguaRadiador),
      luzesPainel: Boolean(checklist.luzesPainel),
    },
    itens: itens.map(mapItemOS),
    maoDeObra: Number(os.valor_mao_obra),
    mecanico: os.mecanico_nome ?? "",
    formaPagamento: (os.forma_pagamento as OrdemServico["formaPagamento"]) ?? undefined,
    status: mapStatusFromDb(os.status),
    criadaEm: os.criado_em,
    finalizadaEm: os.finalizada_em ?? undefined,
  };
}

export function mapLancamento(l: DbLancamento): Lancamento {
  return {
    id: l.id,
    tipo: l.tipo,
    descricao: l.descricao,
    valor: Number(l.valor),
    categoria: (l.categoria as Lancamento["categoria"]) ?? undefined,
    data: l.criado_em,
    osId: l.os_id ?? undefined,
  };
}

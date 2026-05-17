import type { Cliente, Produto, OrdemServico, Lancamento } from "./types";

export const mecanicos = ["Carlos Sheik", "Roberto Silva", "Diego Almeida", "Júnior Pereira"];

export const clientes: Cliente[] = [
  {
    id: "c1",
    nome: "Marcelo Tavares",
    whatsapp: "(11) 98765-4321",
    cpf: "342.518.927-04",
    criadoEm: "2024-08-12",
    veiculos: [
      { id: "v1", placa: "FXP2A45", modelo: "Onix LT 1.0", marca: "Chevrolet", ano: 2021, kmAtual: 48230, ultimaTroca: "2025-08-10" },
    ],
  },
  {
    id: "c2",
    nome: "Juliana Ferreira",
    whatsapp: "(11) 99812-3344",
    cpf: "189.667.402-55",
    criadoEm: "2024-09-03",
    veiculos: [
      { id: "v2", placa: "RKG8H12", modelo: "HB20 Sense 1.0", marca: "Hyundai", ano: 2022, kmAtual: 31840, ultimaTroca: "2025-09-20" },
      { id: "v3", placa: "BNF4J88", modelo: "Creta Comfort", marca: "Hyundai", ano: 2020, kmAtual: 67120 },
    ],
  },
  {
    id: "c3",
    nome: "Rafael Nogueira",
    whatsapp: "(11) 97456-1290",
    cpf: "402.991.388-71",
    criadoEm: "2024-06-22",
    veiculos: [
      { id: "v4", placa: "GHT5D02", modelo: "Strada Freedom CD", marca: "Fiat", ano: 2023, kmAtual: 22980, ultimaTroca: "2025-10-02" },
    ],
  },
  {
    id: "c4",
    nome: "Camila Souza",
    whatsapp: "(11) 99201-7765",
    cpf: "270.115.804-22",
    criadoEm: "2025-01-14",
    veiculos: [
      { id: "v5", placa: "LQR3M77", modelo: "Corolla XEi 2.0", marca: "Toyota", ano: 2022, kmAtual: 41560, ultimaTroca: "2025-07-18" },
    ],
  },
  {
    id: "c5",
    nome: "Edson Batista",
    whatsapp: "(11) 98012-3399",
    cpf: "551.789.230-19",
    criadoEm: "2024-11-09",
    veiculos: [
      { id: "v6", placa: "PNB7C15", modelo: "Civic EXL", marca: "Honda", ano: 2019, kmAtual: 89340, ultimaTroca: "2025-09-01" },
    ],
  },
  {
    id: "c6",
    nome: "Patrícia Lima",
    whatsapp: "(11) 99887-4421",
    cpf: "318.604.155-88",
    criadoEm: "2025-02-28",
    veiculos: [
      { id: "v7", placa: "MZD6E91", modelo: "Renegade Sport", marca: "Jeep", ano: 2021, kmAtual: 54210 },
    ],
  },
  {
    id: "c7",
    nome: "Bruno Almeida",
    whatsapp: "(11) 97123-8854",
    cpf: "467.832.901-30",
    criadoEm: "2024-12-05",
    veiculos: [
      { id: "v8", placa: "JKL2X44", modelo: "Polo Track 1.0", marca: "Volkswagen", ano: 2023, kmAtual: 18450, ultimaTroca: "2025-10-15" },
    ],
  },
  {
    id: "c8",
    nome: "Fernanda Castro",
    whatsapp: "(11) 99334-2210",
    cpf: "725.118.443-67",
    criadoEm: "2024-07-19",
    veiculos: [
      { id: "v9", placa: "VTR9F03", modelo: "Kwid Zen 1.0", marca: "Renault", ano: 2022, kmAtual: 33790, ultimaTroca: "2025-08-25" },
    ],
  },
  {
    id: "c9",
    nome: "Anderson Ribeiro",
    whatsapp: "(11) 98445-9912",
    cpf: "603.244.087-55",
    criadoEm: "2025-03-11",
    veiculos: [
      { id: "v10", placa: "QXP5R28", modelo: "Hilux SRX", marca: "Toyota", ano: 2020, kmAtual: 102450 },
    ],
  },
  {
    id: "c10",
    nome: "Letícia Moraes",
    whatsapp: "(11) 99001-5566",
    cpf: "194.530.778-02",
    criadoEm: "2024-10-30",
    veiculos: [
      { id: "v11", placa: "WBC8K71", modelo: "T-Cross Highline", marca: "Volkswagen", ano: 2023, kmAtual: 25670, ultimaTroca: "2025-09-12" },
    ],
  },
];

export const produtos: Produto[] = [
  { id: "p1", sku: "MOT-5W30-MTL", nome: "Óleo Motul 8100 X-cess 5W30 Sintético", categoria: "Óleo Motor", precoCusto: 58.9, precoVenda: 95.0, quantidade: 42, estoqueMinimo: 20, unidade: "L" },
  { id: "p2", sku: "MOB-5W30-SUP", nome: "Óleo Mobil Super Sintético 5W30", categoria: "Óleo Motor", precoCusto: 49.5, precoVenda: 82.0, quantidade: 8, estoqueMinimo: 15, unidade: "L" },
  { id: "p3", sku: "CAS-10W40-MAG", nome: "Óleo Castrol Magnatec 10W40 Semissintético", categoria: "Óleo Motor", precoCusto: 38.0, precoVenda: 64.9, quantidade: 56, estoqueMinimo: 25, unidade: "L" },
  { id: "p4", sku: "MOB-5W40-ESP", nome: "Óleo Mobil Super 3000 5W40 Sintético", categoria: "Óleo Motor", precoCusto: 54.0, precoVenda: 89.0, quantidade: 31, estoqueMinimo: 20, unidade: "L" },
  { id: "p5", sku: "MOT-0W20-SPE", nome: "Óleo Motul Specific 0W20 Híbrido", categoria: "Óleo Motor", precoCusto: 72.0, precoVenda: 118.0, quantidade: 14, estoqueMinimo: 10, unidade: "L" },
  { id: "p6", sku: "TEC-PSL62", nome: "Filtro de Óleo Tecfil PSL62", categoria: "Filtro Óleo", precoCusto: 14.5, precoVenda: 29.9, quantidade: 38, estoqueMinimo: 15, unidade: "un" },
  { id: "p7", sku: "FRM-PH4967", nome: "Filtro de Óleo Fram PH4967", categoria: "Filtro Óleo", precoCusto: 16.0, precoVenda: 32.0, quantidade: 4, estoqueMinimo: 12, unidade: "un" },
  { id: "p8", sku: "TEC-PSL120", nome: "Filtro de Óleo Tecfil PSL120 (Toyota)", categoria: "Filtro Óleo", precoCusto: 18.0, precoVenda: 36.9, quantidade: 22, estoqueMinimo: 10, unidade: "un" },
  { id: "p9", sku: "TEC-ARS3530", nome: "Filtro de Ar Tecfil ARS3530", categoria: "Filtro Ar", precoCusto: 24.0, precoVenda: 49.0, quantidade: 27, estoqueMinimo: 15, unidade: "un" },
  { id: "p10", sku: "FRM-CA10467", nome: "Filtro de Ar Fram CA10467", categoria: "Filtro Ar", precoCusto: 28.0, precoVenda: 55.9, quantidade: 6, estoqueMinimo: 10, unidade: "un" },
  { id: "p11", sku: "TEC-ARS8540", nome: "Filtro de Ar Tecfil ARS8540 (HB20/Onix)", categoria: "Filtro Ar", precoCusto: 22.5, precoVenda: 45.0, quantidade: 33, estoqueMinimo: 15, unidade: "un" },
  { id: "p12", sku: "TEC-GFC100", nome: "Filtro de Combustível Tecfil GFC100", categoria: "Filtro Combustível", precoCusto: 19.0, precoVenda: 38.9, quantidade: 17, estoqueMinimo: 10, unidade: "un" },
  { id: "p13", sku: "FRM-G3727", nome: "Filtro de Combustível Fram G3727", categoria: "Filtro Combustível", precoCusto: 21.0, precoVenda: 42.0, quantidade: 12, estoqueMinimo: 8, unidade: "un" },
  { id: "p14", sku: "BAR-ARRR50", nome: "Aditivo Radiador Bardahl Pronto Uso 1L", categoria: "Aditivos", precoCusto: 18.5, precoVenda: 35.0, quantidade: 24, estoqueMinimo: 10, unidade: "un" },
  { id: "p15", sku: "WUR-FLU500", nome: "Fluido de Freio DOT4 Wurth 500ml", categoria: "Aditivos", precoCusto: 22.0, precoVenda: 44.9, quantidade: 19, estoqueMinimo: 10, unidade: "un" },
  { id: "p16", sku: "BAR-LIM350", nome: "Limpa Bicos Bardahl Premium 350ml", categoria: "Aditivos", precoCusto: 27.0, precoVenda: 52.0, quantidade: 3, estoqueMinimo: 8, unidade: "un" },
  { id: "p17", sku: "MOT-15W40-SEM", nome: "Óleo Motul 6100 15W40 Semissintético", categoria: "Óleo Motor", precoCusto: 32.0, precoVenda: 54.9, quantidade: 48, estoqueMinimo: 20, unidade: "L" },
  { id: "p18", sku: "CAS-EDGE5W30", nome: "Óleo Castrol Edge 5W30 100% Sintético", categoria: "Óleo Motor", precoCusto: 68.0, precoVenda: 112.0, quantidade: 21, estoqueMinimo: 15, unidade: "L" },
  { id: "p19", sku: "TEC-ACR126", nome: "Filtro de Ar Cabine Tecfil ACR126", categoria: "Filtro Ar", precoCusto: 26.0, precoVenda: 52.0, quantidade: 15, estoqueMinimo: 10, unidade: "un" },
  { id: "p20", sku: "BAR-PRO20", nome: "Protetor Motor Bardahl 20.000km 250ml", categoria: "Aditivos", precoCusto: 35.0, precoVenda: 68.9, quantidade: 11, estoqueMinimo: 6, unidade: "un" },
];

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const ordens: OrdemServico[] = [
  {
    id: "os1", numero: "OS-2025-0148", clienteId: "c1", veiculoId: "v1", kmEntrada: 48230,
    checklist: { fluidoFreio: true, filtroAr: true, aguaRadiador: false, luzesPainel: false },
    itens: [
      { produtoId: "p1", nome: "Óleo Motul 8100 X-cess 5W30", quantidade: 4, precoUnit: 95 },
      { produtoId: "p6", nome: "Filtro de Óleo Tecfil PSL62", quantidade: 1, precoUnit: 29.9 },
    ],
    maoDeObra: 60, mecanico: "Carlos Sheik", formaPagamento: "Pix", status: "finalizada",
    criadaEm: daysAgo(1), finalizadaEm: daysAgo(1),
  },
  {
    id: "os2", numero: "OS-2025-0147", clienteId: "c4", veiculoId: "v5", kmEntrada: 41560,
    checklist: { fluidoFreio: true, filtroAr: false, aguaRadiador: true, luzesPainel: false },
    itens: [
      { produtoId: "p18", nome: "Óleo Castrol Edge 5W30", quantidade: 4.5, precoUnit: 112 },
      { produtoId: "p8", nome: "Filtro de Óleo Tecfil PSL120", quantidade: 1, precoUnit: 36.9 },
    ],
    maoDeObra: 80, mecanico: "Roberto Silva", formaPagamento: "Cartão Crédito", status: "finalizada",
    criadaEm: daysAgo(1), finalizadaEm: daysAgo(1),
  },
  {
    id: "os3", numero: "OS-2025-0146", clienteId: "c7", veiculoId: "v8", kmEntrada: 18450,
    checklist: { fluidoFreio: true, filtroAr: true, aguaRadiador: true, luzesPainel: true },
    itens: [
      { produtoId: "p3", nome: "Óleo Castrol Magnatec 10W40", quantidade: 4, precoUnit: 64.9 },
      { produtoId: "p6", nome: "Filtro de Óleo Tecfil PSL62", quantidade: 1, precoUnit: 29.9 },
      { produtoId: "p11", nome: "Filtro de Ar Tecfil ARS8540", quantidade: 1, precoUnit: 45 },
    ],
    maoDeObra: 70, mecanico: "Diego Almeida", formaPagamento: "Pix", status: "finalizada",
    criadaEm: daysAgo(2), finalizadaEm: daysAgo(2),
  },
  {
    id: "os4", numero: "OS-2025-0149", clienteId: "c3", veiculoId: "v4", kmEntrada: 22980,
    checklist: { fluidoFreio: false, filtroAr: false, aguaRadiador: false, luzesPainel: false },
    itens: [], maoDeObra: 0, mecanico: "", status: "aberta",
    criadaEm: daysAgo(0),
  },
  {
    id: "os5", numero: "OS-2025-0145", clienteId: "c5", veiculoId: "v6", kmEntrada: 89340,
    checklist: { fluidoFreio: true, filtroAr: true, aguaRadiador: false, luzesPainel: false },
    itens: [
      { produtoId: "p4", nome: "Óleo Mobil Super 3000 5W40", quantidade: 4, precoUnit: 89 },
      { produtoId: "p7", nome: "Filtro de Óleo Fram PH4967", quantidade: 1, precoUnit: 32 },
    ],
    maoDeObra: 70, mecanico: "Carlos Sheik", formaPagamento: "Dinheiro", status: "finalizada",
    criadaEm: daysAgo(3), finalizadaEm: daysAgo(3),
  },
  {
    id: "os6", numero: "OS-2025-0144", clienteId: "c2", veiculoId: "v2", kmEntrada: 31840,
    checklist: { fluidoFreio: true, filtroAr: true, aguaRadiador: true, luzesPainel: false },
    itens: [
      { produtoId: "p17", nome: "Óleo Motul 6100 15W40", quantidade: 4, precoUnit: 54.9 },
      { produtoId: "p11", nome: "Filtro de Ar Tecfil ARS8540", quantidade: 1, precoUnit: 45 },
    ],
    maoDeObra: 60, mecanico: "Júnior Pereira", formaPagamento: "Cartão Débito", status: "finalizada",
    criadaEm: daysAgo(4), finalizadaEm: daysAgo(4),
  },
];

// Histórico de faturamento dos últimos 30 dias (valores realistas SP)
export const faturamentoDiario = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (29 - i));
  const base = 1400 + Math.sin(i / 3) * 600 + Math.random() * 800;
  return {
    data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    valor: Math.round(base),
  };
});

export const distribuicaoPagamentos = [
  { nome: "Pix", valor: 48 },
  { nome: "Cartão Crédito", valor: 27 },
  { nome: "Cartão Débito", valor: 15 },
  { nome: "Dinheiro", valor: 10 },
];

export const lancamentos: Lancamento[] = [
  { id: "l1", tipo: "entrada", descricao: "OS-2025-0148 — Marcelo Tavares", valor: 469.9, data: daysAgo(1), osId: "os1" },
  { id: "l2", tipo: "entrada", descricao: "OS-2025-0147 — Camila Souza", valor: 620.9, data: daysAgo(1), osId: "os2" },
  { id: "l3", tipo: "entrada", descricao: "OS-2025-0146 — Bruno Almeida", valor: 334.5, data: daysAgo(2), osId: "os3" },
  { id: "l4", tipo: "entrada", descricao: "OS-2025-0145 — Edson Batista", valor: 458.0, data: daysAgo(3), osId: "os5" },
  { id: "l5", tipo: "entrada", descricao: "OS-2025-0144 — Juliana Ferreira", valor: 325.6, data: daysAgo(4), osId: "os6" },
  { id: "l6", tipo: "saida", descricao: "Aluguel — Casa Verde", valor: 4500, categoria: "Aluguel", data: daysAgo(5) },
  { id: "l7", tipo: "saida", descricao: "Energia Elétrica Enel", valor: 842.3, categoria: "Energia", data: daysAgo(7) },
  { id: "l8", tipo: "saida", descricao: "Reposição de estoque — Distribuidora Motul", valor: 3280, categoria: "Fornecedores", data: daysAgo(9) },
  { id: "l9", tipo: "saida", descricao: "Chave de impacto pneumática", valor: 1190, categoria: "Ferramentas", data: daysAgo(12) },
  { id: "l10", tipo: "saida", descricao: "Anúncios Instagram", valor: 450, categoria: "Marketing", data: daysAgo(15) },
  { id: "l11", tipo: "saida", descricao: "Salário Mecânico — Carlos", valor: 3200, categoria: "Salários", data: daysAgo(20) },
];

// KPIs derivados
export const metricas = {
  faturamentoDia: 2208.9,
  faturamentoMes: 58420.5,
  lucroLiquidoMes: 21340.8,
  taxaRetencao: 78,
  alertasEstoque: produtos.filter((p) => p.quantidade <= p.estoqueMinimo).length,
  ticketMedio: 412.5,
};

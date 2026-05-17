// Tipos espelham futuras tabelas Supabase
export type Veiculo = {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  kmAtual: number;
  ultimaTroca?: string; // ISO date
};

export type Cliente = {
  id: string;
  nome: string;
  whatsapp: string;
  cpf: string;
  veiculos: Veiculo[];
  criadoEm: string;
};

export type CategoriaProduto =
  | "Óleo Motor"
  | "Filtro Óleo"
  | "Filtro Ar"
  | "Filtro Combustível"
  | "Aditivos";

export type Produto = {
  id: string;
  sku: string;
  nome: string;
  categoria: CategoriaProduto;
  precoCusto: number;
  precoVenda: number;
  quantidade: number;
  estoqueMinimo: number;
  unidade: "L" | "un";
};

export type FormaPagamento = "Pix" | "Cartão Crédito" | "Cartão Débito" | "Dinheiro";

export type ItemOS = {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnit: number;
};

export type StatusOS = "aberta" | "em_execucao" | "finalizada";

export type OrdemServico = {
  id: string;
  numero: string;
  clienteId: string;
  veiculoId: string;
  kmEntrada: number;
  checklist: {
    fluidoFreio: boolean;
    filtroAr: boolean;
    aguaRadiador: boolean;
    luzesPainel: boolean;
  };
  itens: ItemOS[];
  maoDeObra: number;
  mecanico: string;
  formaPagamento?: FormaPagamento;
  status: StatusOS;
  criadaEm: string;
  finalizadaEm?: string;
  proximoRetorno?: string; // ISO date — usado p/ alerta WhatsApp
};

export type TipoLancamento = "entrada" | "saida";
export type CategoriaDespesa =
  | "Aluguel"
  | "Energia"
  | "Água"
  | "Ferramentas"
  | "Fornecedores"
  | "Marketing"
  | "Salários"
  | "Outros";

export type Lancamento = {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  categoria?: CategoriaDespesa;
  data: string;
  osId?: string;
};

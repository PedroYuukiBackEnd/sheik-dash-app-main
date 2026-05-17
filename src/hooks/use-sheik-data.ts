import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientes,
  fetchProdutos,
  fetchOrdens,
  fetchOrdemById,
  fetchLancamentos,
  fetchIsAdmin,
  fetchMecanicos,
  createClienteComVeiculo,
  upsertProduto,
  deleteProduto,
  createOrdemServico,
  updateOrdemExecucao,
  syncItensOrdem,
  finalizarOrdemServico,
  createDespesa,
  fetchMetricasDashboard,
  fetchFaturamentoDiario,
  fetchDistribuicaoPagamentos,
} from "@/lib/api";
import type { Cliente, Produto, OrdemServico, Lancamento, CategoriaDespesa } from "@/lib/types";

export const queryKeys = {
  clientes: ["clientes"] as const,
  produtos: (admin: boolean) => ["produtos", admin] as const,
  ordens: ["ordens"] as const,
  ordem: (id: string) => ["ordem", id] as const,
  lancamentos: ["lancamentos"] as const,
  isAdmin: ["isAdmin"] as const,
  mecanicos: ["mecanicos"] as const,
  metricas: ["metricas"] as const,
  faturamento: ["faturamento"] as const,
  pagamentos: ["pagamentos"] as const,
};

export function useIsAdmin() {
  return useQuery({ queryKey: queryKeys.isAdmin, queryFn: fetchIsAdmin, staleTime: 60_000 });
}

export function useClientes() {
  return useQuery({ queryKey: queryKeys.clientes, queryFn: fetchClientes });
}

export function useProdutos() {
  const { data: isAdmin } = useIsAdmin();
  return useQuery({
    queryKey: queryKeys.produtos(Boolean(isAdmin)),
    queryFn: () => fetchProdutos(Boolean(isAdmin)),
    enabled: isAdmin !== undefined,
  });
}

export function useOrdens() {
  return useQuery({ queryKey: queryKeys.ordens, queryFn: fetchOrdens });
}

export function useOrdem(osId: string) {
  return useQuery({
    queryKey: queryKeys.ordem(osId),
    queryFn: () => fetchOrdemById(osId),
    enabled: Boolean(osId),
  });
}

export function useLancamentos() {
  return useQuery({ queryKey: queryKeys.lancamentos, queryFn: fetchLancamentos });
}

export function useMecanicos() {
  return useQuery({ queryKey: queryKeys.mecanicos, queryFn: fetchMecanicos });
}

export function useMetricas() {
  return useQuery({ queryKey: queryKeys.metricas, queryFn: fetchMetricasDashboard });
}

export function useFaturamentoDiario() {
  return useQuery({ queryKey: queryKeys.faturamento, queryFn: () => fetchFaturamentoDiario(30) });
}

export function useDistribuicaoPagamentos() {
  return useQuery({ queryKey: queryKeys.pagamentos, queryFn: fetchDistribuicaoPagamentos });
}

export function useSheikMutations() {
  const qc = useQueryClient();
  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.clientes });
    void qc.invalidateQueries({ queryKey: ["produtos"] });
    void qc.invalidateQueries({ queryKey: queryKeys.ordens });
    void qc.invalidateQueries({ queryKey: queryKeys.lancamentos });
    void qc.invalidateQueries({ queryKey: queryKeys.metricas });
    void qc.invalidateQueries({ queryKey: queryKeys.faturamento });
    void qc.invalidateQueries({ queryKey: queryKeys.pagamentos });
  };

  const addCliente = useMutation({
    mutationFn: createClienteComVeiculo,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.clientes }),
  });

  const saveProduto = useMutation({
    mutationFn: ({ produto, isNew }: { produto: Produto; isNew: boolean }) =>
      upsertProduto(produto, isNew),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["produtos"] }),
  });

  const removeProduto = useMutation({
    mutationFn: deleteProduto,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["produtos"] }),
  });

  const novaOS = useMutation({
    mutationFn: createOrdemServico,
    onSuccess: (os) => {
      void qc.invalidateQueries({ queryKey: queryKeys.ordens });
      void qc.setQueryData(queryKeys.ordem(os.id), os);
    },
  });

  const salvarExecucao = useMutation({
    mutationFn: async ({
      osId,
      itens,
      mecanico,
      maoDeObra,
    }: {
      osId: string;
      itens: OrdemServico["itens"];
      mecanico: string;
      maoDeObra: number;
    }) => {
      await syncItensOrdem(osId, itens);
      await updateOrdemExecucao(osId, { mecanico, maoDeObra });
    },
    onSuccess: (_, { osId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.ordens });
      void qc.invalidateQueries({ queryKey: queryKeys.ordem(osId) });
    },
  });

  const finalizarOS = useMutation({
    mutationFn: ({ osId, formaPagamento }: { osId: string; formaPagamento: string }) =>
      finalizarOrdemServico(osId, formaPagamento),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const addDespesa = useMutation({
    mutationFn: (input: { descricao: string; valor: number; categoria: CategoriaDespesa }) =>
      createDespesa(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lancamentos });
      void qc.invalidateQueries({ queryKey: queryKeys.metricas });
    },
  });

  return {
    addCliente,
    saveProduto,
    removeProduto,
    novaOS,
    salvarExecucao,
    finalizarOS,
    addDespesa,
    invalidateOrdem: (osId: string) => void qc.invalidateQueries({ queryKey: queryKeys.ordem(osId) }),
  };
}

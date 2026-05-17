/** Tipos gerados manualmente para o schema Sheik do Óleo (espelham migrations SQL). */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      perfis_usuarios: {
        Row: {
          id: string;
          nome: string;
          email: string;
          role: "admin" | "mecanico";
          criado_em: string;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          role?: "admin" | "mecanico";
          criado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfis_usuarios"]["Insert"]>;
      };
      clientes: {
        Row: {
          id: string;
          nome: string;
          whatsapp: string;
          cpf: string | null;
          email: string | null;
          observacoes: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          whatsapp: string;
          cpf?: string | null;
          email?: string | null;
          observacoes?: string | null;
          criado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clientes"]["Insert"]>;
      };
      veiculos: {
        Row: {
          id: string;
          cliente_id: string;
          placa: string;
          modelo_marca: string;
          ano: number | null;
          km_atual: number;
          chassi: string | null;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          placa: string;
          modelo_marca: string;
          ano?: number | null;
          km_atual?: number;
          chassi?: string | null;
          atualizado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["veiculos"]["Insert"]>;
      };
      produtos_estoque: {
        Row: {
          id: string;
          sku: string;
          nome: string;
          categoria: string;
          marca: string | null;
          preco_custo: number;
          preco_venda: number;
          quantidade_atual: number;
          estoque_minimo: number;
          unidade: string;
        };
        Insert: {
          id?: string;
          sku: string;
          nome: string;
          categoria: string;
          marca?: string | null;
          preco_custo?: number;
          preco_venda?: number;
          quantidade_atual?: number;
          estoque_minimo?: number;
          unidade?: string;
        };
        Update: Partial<Database["public"]["Tables"]["produtos_estoque"]["Insert"]>;
      };
      ordens_servico: {
        Row: {
          id: string;
          numero: string;
          cliente_id: string;
          veiculo_id: string;
          km_entrada: number;
          checklist: Json;
          mecanico_id: string | null;
          mecanico_nome: string | null;
          valor_pecas: number;
          valor_mao_obra: number;
          valor_total: number;
          forma_pagamento: string | null;
          status: "pendente" | "em_execucao" | "finalizada";
          criado_em: string;
          finalizada_em: string | null;
        };
        Insert: {
          id?: string;
          numero: string;
          cliente_id: string;
          veiculo_id: string;
          km_entrada?: number;
          checklist?: Json;
          mecanico_id?: string | null;
          mecanico_nome?: string | null;
          valor_pecas?: number;
          valor_mao_obra?: number;
          valor_total?: number;
          forma_pagamento?: string | null;
          status?: "pendente" | "em_execucao" | "finalizada";
          criado_em?: string;
          finalizada_em?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ordens_servico"]["Insert"]>;
      };
      itens_ordem_servico: {
        Row: {
          id: string;
          os_id: string;
          produto_id: string;
          quantidade_utilizada: number;
          preco_venda_momento: number;
        };
        Insert: {
          id?: string;
          os_id: string;
          produto_id: string;
          quantidade_utilizada?: number;
          preco_venda_momento?: number;
        };
        Update: Partial<Database["public"]["Tables"]["itens_ordem_servico"]["Insert"]>;
      };
      fluxo_caixa: {
        Row: {
          id: string;
          tipo: "entrada" | "saida";
          valor: number;
          descricao: string;
          categoria: string | null;
          os_id: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          tipo: "entrada" | "saida";
          valor: number;
          descricao: string;
          categoria?: string | null;
          os_id?: string | null;
          criado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fluxo_caixa"]["Insert"]>;
      };
      alertas_whatsapp: {
        Row: {
          id: string;
          os_id: string | null;
          cliente_id: string;
          telefone_destino: string;
          data_disparo: string;
          mensagem: string;
          status: "agendado" | "enviado" | "falhou";
        };
      };
    };
    Views: {
      produtos_estoque_publico: {
        Row: {
          id: string;
          sku: string;
          nome: string;
          categoria: string;
          marca: string | null;
          preco_venda: number;
          quantidade_atual: number;
          estoque_minimo: number;
          unidade: string;
        };
      };
    };
  };
}

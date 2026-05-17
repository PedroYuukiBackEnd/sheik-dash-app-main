-- =============================================================================
-- SHEIK DO ÓLEO — Fase 3: Row Level Security (RLS)
-- Execute APÓS o 001_schema.sql
-- =============================================================================

ALTER TABLE public.perfis_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluxo_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_whatsapp ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- perfis_usuarios: cada um lê o próprio; admin lê todos
-- -----------------------------------------------------------------------------
CREATE POLICY "perfis_select_own"
  ON public.perfis_usuarios FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "perfis_update_own"
  ON public.perfis_usuarios FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- clientes: leitura e cadastro para autenticados; alteração autenticada; delete admin
-- -----------------------------------------------------------------------------
CREATE POLICY "clientes_select_auth"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "clientes_insert_auth"
  ON public.clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "clientes_update_auth"
  ON public.clientes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "clientes_delete_admin"
  ON public.clientes FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- veículos
-- -----------------------------------------------------------------------------
CREATE POLICY "veiculos_select_auth"
  ON public.veiculos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "veiculos_insert_auth"
  ON public.veiculos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "veiculos_update_auth"
  ON public.veiculos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "veiculos_delete_admin"
  ON public.veiculos FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- produtos_estoque: SELECT completo (com preco_custo) apenas admin
-- Mecânicos leem via VIEW produtos_estoque_publico (sem preco_custo)
-- -----------------------------------------------------------------------------
CREATE POLICY "produtos_select_admin"
  ON public.produtos_estoque FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "produtos_insert_admin"
  ON public.produtos_estoque FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "produtos_update_admin"
  ON public.produtos_estoque FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "produtos_delete_admin"
  ON public.produtos_estoque FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- View pública: leitura para todos autenticados (sem preco_custo na definição da view)
GRANT SELECT ON public.produtos_estoque_publico TO authenticated;

-- -----------------------------------------------------------------------------
-- ordens_servico
-- -----------------------------------------------------------------------------
CREATE POLICY "os_select_auth"
  ON public.ordens_servico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "os_insert_auth"
  ON public.ordens_servico FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "os_update_auth"
  ON public.ordens_servico FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "os_delete_admin"
  ON public.ordens_servico FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- itens_ordem_servico
-- -----------------------------------------------------------------------------
CREATE POLICY "itens_os_select_auth"
  ON public.itens_ordem_servico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "itens_os_insert_auth"
  ON public.itens_ordem_servico FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "itens_os_update_auth"
  ON public.itens_ordem_servico FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "itens_os_delete_admin"
  ON public.itens_ordem_servico FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Mecânicos podem remover itens da OS em edição (sem ser delete de registro permanente crítico)
-- Política extra: delete de itens por quem está editando a OS
CREATE POLICY "itens_os_delete_auth_edicao"
  ON public.itens_ordem_servico FOR DELETE
  TO authenticated
  USING (
    NOT public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.ordens_servico o
      WHERE o.id = os_id AND o.status IN ('pendente', 'em_execucao')
    )
  );

-- -----------------------------------------------------------------------------
-- fluxo_caixa: somente admin (ler, inserir, alterar); delete admin
-- -----------------------------------------------------------------------------
CREATE POLICY "fluxo_select_admin"
  ON public.fluxo_caixa FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "fluxo_insert_admin"
  ON public.fluxo_caixa FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "fluxo_update_admin"
  ON public.fluxo_caixa FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "fluxo_delete_admin"
  ON public.fluxo_caixa FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- alertas_whatsapp: leitura autenticada; inserts via trigger (security definer)
-- -----------------------------------------------------------------------------
CREATE POLICY "alertas_select_auth"
  ON public.alertas_whatsapp FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "alertas_delete_admin"
  ON public.alertas_whatsapp FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Nota: INSERT em alertas é feito pela função de trigger com SECURITY DEFINER.
-- A Edge Function usa service_role para ler fila e atualizar status.

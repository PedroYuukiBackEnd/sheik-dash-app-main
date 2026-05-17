-- =============================================================================
-- SHEIK DO ÓLEO — Fase 3: Schema PostgreSQL (Supabase SQL Editor)
-- Execute este bloco primeiro no Editor de Consultas do Supabase.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('admin', 'mecanico');
CREATE TYPE public.os_status AS ENUM ('pendente', 'em_execucao', 'finalizada');
CREATE TYPE public.fluxo_tipo AS ENUM ('entrada', 'saida');
CREATE TYPE public.alerta_status AS ENUM ('agendado', 'enviado', 'falhou');

-- -----------------------------------------------------------------------------
-- 1. Perfis de usuários (vinculado ao auth.users do Supabase)
-- -----------------------------------------------------------------------------
CREATE TABLE public.perfis_usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'mecanico',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. Clientes
-- -----------------------------------------------------------------------------
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. Veículos
-- -----------------------------------------------------------------------------
CREATE TABLE public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes (id) ON DELETE CASCADE,
  placa TEXT NOT NULL UNIQUE,
  modelo_marca TEXT NOT NULL,
  ano INTEGER,
  km_atual INTEGER NOT NULL DEFAULT 0,
  chassi TEXT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_veiculos_cliente ON public.veiculos (cliente_id);
CREATE INDEX idx_veiculos_placa ON public.veiculos (placa);

-- -----------------------------------------------------------------------------
-- 4. Produtos / Estoque
-- -----------------------------------------------------------------------------
CREATE TABLE public.produtos_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  marca TEXT,
  preco_custo NUMERIC(12, 2) NOT NULL DEFAULT 0,
  preco_venda NUMERIC(12, 2) NOT NULL DEFAULT 0,
  quantidade_atual NUMERIC(12, 3) NOT NULL DEFAULT 0,
  estoque_minimo NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL DEFAULT 'un'
);

-- View sem preço de custo (mecânicos / RLS)
CREATE OR REPLACE VIEW public.produtos_estoque_publico AS
SELECT
  id,
  sku,
  nome,
  categoria,
  marca,
  preco_venda,
  quantidade_atual,
  estoque_minimo,
  unidade
FROM public.produtos_estoque;

-- -----------------------------------------------------------------------------
-- 5. Ordens de Serviço
-- -----------------------------------------------------------------------------
CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES public.clientes (id),
  veiculo_id UUID NOT NULL REFERENCES public.veiculos (id),
  km_entrada INTEGER NOT NULL DEFAULT 0,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  mecanico_id UUID REFERENCES public.perfis_usuarios (id),
  mecanico_nome TEXT,
  valor_pecas NUMERIC(12, 2) NOT NULL DEFAULT 0,
  valor_mao_obra NUMERIC(12, 2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  forma_pagamento TEXT,
  status public.os_status NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalizada_em TIMESTAMPTZ
);

CREATE INDEX idx_os_cliente ON public.ordens_servico (cliente_id);
CREATE INDEX idx_os_veiculo ON public.ordens_servico (veiculo_id);
CREATE INDEX idx_os_status ON public.ordens_servico (status);

-- -----------------------------------------------------------------------------
-- 6. Itens da OS
-- -----------------------------------------------------------------------------
CREATE TABLE public.itens_ordem_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES public.ordens_servico (id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos_estoque (id),
  quantidade_utilizada NUMERIC(12, 3) NOT NULL DEFAULT 1,
  preco_venda_momento NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_itens_os ON public.itens_ordem_servico (os_id);

-- -----------------------------------------------------------------------------
-- 7. Fluxo de Caixa
-- -----------------------------------------------------------------------------
CREATE TABLE public.fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.fluxo_tipo NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT,
  os_id UUID REFERENCES public.ordens_servico (id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fluxo_os ON public.fluxo_caixa (os_id);
CREATE INDEX idx_fluxo_tipo ON public.fluxo_caixa (tipo);

-- -----------------------------------------------------------------------------
-- 8. Alertas WhatsApp
-- -----------------------------------------------------------------------------
CREATE TABLE public.alertas_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES public.ordens_servico (id) ON DELETE SET NULL,
  cliente_id UUID NOT NULL REFERENCES public.clientes (id),
  telefone_destino TEXT NOT NULL,
  data_disparo TIMESTAMPTZ NOT NULL,
  mensagem TEXT NOT NULL,
  status public.alerta_status NOT NULL DEFAULT 'agendado'
);

CREATE INDEX idx_alertas_data ON public.alertas_whatsapp (data_disparo);
CREATE INDEX idx_alertas_status ON public.alertas_whatsapp (status);

-- -----------------------------------------------------------------------------
-- Função auxiliar: verifica se usuário autenticado é admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfis_usuarios
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Trigger: criar perfil ao registrar usuário no Auth
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis_usuarios (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'mecanico')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Recalcular totais da OS a partir dos itens
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalcular_totais_os(p_os_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pecas NUMERIC(12, 2);
  v_mao NUMERIC(12, 2);
BEGIN
  SELECT COALESCE(SUM(quantidade_utilizada * preco_venda_momento), 0)
  INTO v_pecas
  FROM public.itens_ordem_servico
  WHERE os_id = p_os_id;

  SELECT valor_mao_obra INTO v_mao FROM public.ordens_servico WHERE id = p_os_id;

  UPDATE public.ordens_servico
  SET
    valor_pecas = v_pecas,
    valor_total = v_pecas + COALESCE(v_mao, 0)
  WHERE id = p_os_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_itens_recalcular_totais()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.recalcular_totais_os(COALESCE(NEW.os_id, OLD.os_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_itens_recalcular
  AFTER INSERT OR UPDATE OR DELETE ON public.itens_ordem_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_itens_recalcular_totais();

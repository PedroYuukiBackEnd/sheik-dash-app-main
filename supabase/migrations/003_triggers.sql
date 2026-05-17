-- =============================================================================
-- SHEIK DO ÓLEO — Triggers de negócio (execute APÓS 002_rls.sql)
-- Recalcula valores, atualiza KM, baixa estoque, fluxo de caixa e alertas WhatsApp
-- =============================================================================

-- Remove versões anteriores (re-execução segura no SQL Editor)
DROP TRIGGER IF EXISTS trg_os_finalizada ON public.ordens_servico;
DROP TRIGGER IF EXISTS tg_os_finalizada ON public.ordens_servico;
DROP TRIGGER IF EXISTS trg_os_atualiza_km ON public.ordens_servico;
DROP TRIGGER IF EXISTS tg_antes_de_atualizar_os ON public.ordens_servico;

DROP FUNCTION IF EXISTS public.fn_os_finalizada();
DROP FUNCTION IF EXISTS public.fn_atualizar_km_veiculo();
DROP FUNCTION IF EXISTS public.fn_antes_de_atualizar_os();

-- -----------------------------------------------------------------------------
-- 1. Antes de atualizar OS: recalcula peças, grava finalizada_em e atualiza KM
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_antes_de_atualizar_os()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalcula o valor total das peças com base nos itens atuais da O.S.
  SELECT COALESCE(SUM(quantidade_utilizada * preco_venda_momento), 0)
  INTO NEW.valor_pecas
  FROM public.itens_ordem_servico
  WHERE os_id = NEW.id;

  NEW.valor_total := NEW.valor_pecas + COALESCE(NEW.valor_mao_obra, 0);

  -- Transição para finalizada
  IF NEW.status = 'finalizada' AND OLD.status IS DISTINCT FROM 'finalizada' THEN
    IF NEW.finalizada_em IS NULL THEN
      NEW.finalizada_em := NOW();
    END IF;

    UPDATE public.veiculos
    SET km_atual = NEW.km_entrada,
        atualizado_em = NOW()
    WHERE id = NEW.veiculo_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tg_antes_de_atualizar_os
  BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_antes_de_atualizar_os();

-- -----------------------------------------------------------------------------
-- 2. Após finalizar OS: estoque, caixa e alerta WhatsApp (90 ou 180 dias)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_os_finalizada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
  v_placa TEXT;
  v_modelo TEXT;
  v_nome_cliente TEXT;
  v_telefone TEXT;
  v_tem_sintetico BOOLEAN;
  v_dias_disparo INTEGER;
  v_msg TEXT;
BEGIN
  IF NEW.status = 'finalizada' AND OLD.status IS DISTINCT FROM 'finalizada' THEN

    -- A. Baixa de estoque
    FOR item IN (
      SELECT produto_id, quantidade_utilizada
      FROM public.itens_ordem_servico
      WHERE os_id = NEW.id
    ) LOOP
      UPDATE public.produtos_estoque
      SET quantidade_atual = GREATEST(0, quantidade_atual - item.quantidade_utilizada)
      WHERE id = item.produto_id;
    END LOOP;

    SELECT placa, modelo_marca INTO v_placa, v_modelo
    FROM public.veiculos WHERE id = NEW.veiculo_id;

    SELECT nome, whatsapp INTO v_nome_cliente, v_telefone
    FROM public.clientes WHERE id = NEW.cliente_id;

    -- B. Fluxo de caixa
    INSERT INTO public.fluxo_caixa (tipo, valor, descricao, categoria, os_id)
    VALUES (
      'entrada',
      (NEW.valor_pecas + NEW.valor_mao_obra),
      'O.S. Finalizada - Placa [' || COALESCE(v_placa, 'N/A') || ']',
      'Serviço Automotivo',
      NEW.id
    );

    -- C. Alerta WhatsApp — sintético 180 dias, demais 90 dias
    SELECT EXISTS (
      SELECT 1
      FROM public.itens_ordem_servico ios
      JOIN public.produtos_estoque p ON ios.produto_id = p.id
      WHERE ios.os_id = NEW.id
        AND p.categoria ILIKE '%óleo%'
        AND (p.nome ILIKE '%sintético%' OR p.nome ILIKE '%sintetico%')
    ) INTO v_tem_sintetico;

    IF v_tem_sintetico THEN
      v_dias_disparo := 180;
      v_msg := 'Olá ' || v_nome_cliente || ', aqui é do Sheik do Óleo! O óleo sintético do seu '
        || v_modelo || ' (Placa: ' || v_placa || ') trocado há 6 meses está próximo do vencimento por tempo. '
        || 'Evite o desgaste do motor, venha fazer sua troca preventiva!';
    ELSE
      v_dias_disparo := 90;
      v_msg := 'Olá ' || v_nome_cliente || ', aqui é do Sheik do Óleo! Passaram-se 3 meses desde a última troca de óleo do seu '
        || v_modelo || ' (Placa: ' || v_placa || '). Venha fazer uma checagem gratuita do nível e rodar com segurança!';
    END IF;

    INSERT INTO public.alertas_whatsapp (os_id, cliente_id, telefone_destino, data_disparo, mensagem, status)
    VALUES (
      NEW.id,
      NEW.cliente_id,
      COALESCE(v_telefone, ''),
      (CURRENT_DATE + v_dias_disparo),
      v_msg,
      'agendado'
    );

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tg_os_finalizada
  AFTER UPDATE ON public.ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_os_finalizada();

-- -----------------------------------------------------------------------------
-- Realtime (opcional)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.ordens_servico;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.produtos_estoque;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

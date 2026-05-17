# Plano: Sheik do Óleo — Gestão & Retenção Premium

SaaS automotivo com duas interfaces (Admin Desktop + Mecânico Mobile/Tablet), tema dark premium com destaque laranja neon. Fase 1: UI completa com dados simulados realistas, pronta para conectar Supabase depois.

## Identidade visual (tokens em `src/styles.css`)

- `--background`: #000000 (preto absoluto)
- `--card` / superfícies alternadas: #0B0B0F (grafite)
- `--primary`: #FF5722 (laranja neon) com `--primary-glow` para gradientes
- `--accent`: #F59E0B (âmbar) para badges secundários
- `--border`: neutral-800/50 (bordas milimétricas sutis)
- `--destructive`: vermelho para alertas de estoque (com animação pulse)
- Tipografia: Inter (Google Fonts)
- Sombras suaves laranja para hover em CTAs primários
- Transições 200ms em todos elementos interativos

## Estrutura de rotas (TanStack Start)

```text
src/routes/
  __root.tsx                      → shell + QueryClient
  index.tsx                       → seletor de perfil (Admin / Mecânico) p/ dev
  admin.tsx                       → layout admin (sidebar + outlet)
  admin.index.tsx                 → Dashboard (métricas + gráficos)
  admin.clientes.tsx              → CRM Clientes & Frota
  admin.estoque.tsx               → Controle de Estoque
  admin.financeiro.tsx            → Fluxo de Caixa
  mecanico.tsx                    → layout mobile (header + tab bar bottom)
  mecanico.index.tsx              → lista de OS abertas + botão "Nova OS"
  mecanico.nova-os.tsx            → Etapa 1: veículo + Km + checklist
  mecanico.os.$osId.execucao.tsx  → Etapa 2: peças + mecânico + fotos
  mecanico.os.$osId.fechamento.tsx→ Etapa 3: resumo + pagamento + finalizar
```

## Componentes-chave

- `AdminSidebar` — nav lateral fixa (logo "Sheik do Óleo", ícones Lucide: LayoutDashboard, Users, Package, Wallet)
- `MetricCard` — card com label, valor grande, variação % e ícone laranja
- `RevenueChart` / `PaymentPieChart` — usando recharts (já-temável, estilo dark)
- `StockBadge` — badge piscante vermelho quando qty ≤ mínimo
- `DataTable` — tabela reutilizável (clientes, estoque) com ações inline
- `ClienteModal`, `ProdutoModal`, `DespesaModal` — Shadcn Dialog para CRUDs
- `MobileTopBar` + `MobileBottomNav` — específicos do app mecânico
- `BigTouchButton` — variante de Button com `h-16 text-lg` para chão de fábrica
- `OSStepper` — indicador de progresso 1→2→3 no fluxo da OS

## Dados simulados (mocks em `src/lib/mock-data.ts`)

- **Clientes** (~10): nomes BR realistas, WhatsApp (11) 9xxxx-xxxx, CPFs formatados, veículos com placas Mercosul (ABC1D23), modelos comuns (Onix, HB20, Corolla, Strada, Civic), Km
- **Produtos** (~20): Motul 5W30, Mobil Super 5W30, Castrol Magnatec 10W40, filtros Tecfil PSL, Fram PH4967, aditivo radiador, etc. — c/ SKU, custo, venda, qty, min
- **OS** (~15): vinculadas a veículos, com itens, mecânico, pagamento, data
- **Financeiro**: entradas das OS + despesas (Aluguel R$4.500, Energia, etc.)
- **Métricas**: faturamento dia/mês, lucro líquido, taxa retenção 78%, 3 alertas estoque
- Endereço fixo no footer/header: Av. Casa Verde, 2817 — Casa Verde, São Paulo/SP

## Telas — pontos altos

### Admin / Dashboard
4 MetricCards (Faturamento Dia, Faturamento Mês, Lucro Líquido, Retenção) + card de Alertas Estoque destacado em vermelho. Linha 2: gráfico de área 30 dias (laranja) + pizza pagamentos (Pix/Cartão/Dinheiro).

### Admin / Clientes
Tabela expansível — cada linha de cliente expande mostrando veículos. Modal de cadastro com tabs (Dados / Veículos).

### Admin / Estoque
Tabela com filtro por categoria, badge pulsante em baixo estoque, edição inline via modal.

### Admin / Financeiro
Duas colunas: Entradas (read-only, geradas por OS) e Saídas (com botão "Lançar Despesa" → modal com dropdown categoria). Saldo do mês em card superior.

### Mecânico (mobile-first, max-w-md centralizado em desktop p/ preview)
Fluxo 3 etapas com stepper. Inputs grandes, checkboxes XL, busca de placa com auto-complete contra mock. Botão "FINALIZAR SERVIÇO" full-width laranja, ao clicar dispara toast: "Serviço finalizado. Alerta de retorno agendado para [data + 6 meses] via WhatsApp" e dá baixa simbólica no mock.

## Detalhes técnicos

- Estado dos mocks via Zustand leve OU contexto simples — estruturado em interfaces TS (`Cliente`, `Veiculo`, `Produto`, `OrdemServico`, `LancamentoFinanceiro`) espelhando futuras tabelas Supabase
- `preview_ui--set_preview_device_viewport` para mobile ao revisar app mecânico
- Sem backend nesta fase; toda persistência é em memória
- Substituir o placeholder atual de `index.tsx`
- Cada rota com `head()` próprio (título "Sheik do Óleo — …")

## Fora de escopo (Fase 1)

- Integração Supabase real
- Envio WhatsApp real (apenas simulação visual)
- Autenticação real (apenas seletor de perfil)
- Upload de fotos real (botão simulado)

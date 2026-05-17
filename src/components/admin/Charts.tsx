import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFaturamentoDiario, useDistribuicaoPagamentos } from "@/hooks/use-sheik-data";
import { faturamentoDiario as mockFaturamento, distribuicaoPagamentos as mockPagamentos } from "@/lib/mock-data";
import { brl } from "@/lib/store";

const PIE_COLORS = ["#FF5722", "#F59E0B", "#22C55E", "#A78BFA"];

export function RevenueChart() {
  const { data } = useFaturamentoDiario();
  const faturamentoDiario = data?.length ? data : mockFaturamento;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">Faturamento — Últimos 30 dias</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Evolução diária de receita bruta</p>
        </div>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/30">
          +18,4%
        </span>
      </div>
      <div className="h-64 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={faturamentoDiario}>
            <defs>
              <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5722" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#FF5722" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="data"
              stroke="#525252"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              stroke="#525252"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${v / 1000}k`}
            />
            <Tooltip
              cursor={{ stroke: "#FF5722", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                background: "#0B0B0F",
                border: "1px solid rgba(255,87,34,0.4)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#999" }}
              formatter={(v: number) => [brl(v), "Faturamento"]}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#FF5722"
              strokeWidth={2}
              fill="url(#gradRev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PaymentPieChart() {
  const { data } = useDistribuicaoPagamentos();
  const distribuicaoPagamentos = data?.length ? data : mockPagamentos;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Formas de Pagamento</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Distribuição mensal</p>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribuicaoPagamentos}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              stroke="#0B0B0F"
              strokeWidth={2}
            >
              {distribuicaoPagamentos.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#0B0B0F",
                border: "1px solid rgba(255,87,34,0.4)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, "Participação"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 mt-2">
        {distribuicaoPagamentos.map((p, i) => (
          <li key={p.nome} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              <span className="text-muted-foreground">{p.nome}</span>
            </span>
            <span className="font-semibold tabular-nums">{p.valor}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

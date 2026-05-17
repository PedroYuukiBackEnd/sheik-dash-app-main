/** Formatação monetária compartilhada (dados vêm do Supabase via React Query). */
export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

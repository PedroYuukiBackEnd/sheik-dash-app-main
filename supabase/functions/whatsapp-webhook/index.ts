// Edge Function: repassa INSERT de alertas_whatsapp para Make/n8n
// Deploy: supabase secrets set MAKE_WEBHOOK_URL=... && supabase functions deploy whatsapp-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAKE_WEBHOOK_URL = Deno.env.get("MAKE_WEBHOOK_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!MAKE_WEBHOOK_URL) {
      throw new Error("MAKE_WEBHOOK_URL não configurada nos secrets da Edge Function");
    }

    const body = await req.json();
    const alerta = body.record;

    if (!alerta) {
      return new Response(JSON.stringify({ error: "Nenhum registro encontrado no payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payloadParaMake = {
      evento: "alerta_whatsapp_agendado",
      alerta_id: alerta.id,
      telefone: alerta.telefone_destino,
      mensagem: alerta.mensagem,
      data_disparo: alerta.data_disparo,
    };

    const respostaMake = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadParaMake),
    });

    if (!respostaMake.ok) {
      const txt = await respostaMake.text();
      throw new Error(`Make/n8n respondeu ${respostaMake.status}: ${txt}`);
    }

    return new Response(JSON.stringify({ success: true, statusMake: respostaMake.status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

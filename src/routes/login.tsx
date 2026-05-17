import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getSession, getProfileRole, signInWithEmail, redirectAfterLogin } from "@/lib/auth";

type LoginSearch = { dest?: "admin" | "mecanico" };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    dest: s.dest === "admin" || s.dest === "mecanico" ? s.dest : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const session = await getSession();
    if (session) {
      const role = (await getProfileRole(session.user.id)) ?? "mecanico";
      throw redirect({ to: redirectAfterLogin(role, search.dest) });
    }
  },
  head: () => ({ meta: [{ title: "Sheik do Óleo — Entrar" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { dest } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Informe e-mail e senha");
      return;
    }
    setLoading(true);
    try {
      const { role } = await signInWithEmail(email.trim(), password);
      toast.success("Login realizado");
      navigate({ to: redirectAfterLogin(role, dest) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  const titulo =
    dest === "admin" ? "Painel do Administrador" : dest === "mecanico" ? "App do Mecânico" : "Acesso ao sistema";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-4 text-xl font-bold">{titulo}</h1>
          <p className="text-sm text-muted-foreground mt-1">Entre com sua conta Supabase Auth</p>
        </div>

        <form onSubmit={(e) => void submit(e)} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            ← Voltar à seleção de perfil
          </Link>
        </p>
      </div>
    </div>
  );
}

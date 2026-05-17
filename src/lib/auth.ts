import { redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "mecanico";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfileRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("perfis_usuarios")
    .select("role")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data.role as UserRole;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw redirect({ to: "/login" });
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const role = await getProfileRole(session.user.id);
  if (role !== "admin") {
    throw redirect({ to: "/mecanico" });
  }
  return session;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const role = (await getProfileRole(data.user.id)) ?? "mecanico";
  return { session: data.session, role };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function redirectAfterLogin(role: UserRole, dest?: "admin" | "mecanico") {
  if (dest === "admin" && role === "admin") return "/admin";
  if (dest === "mecanico") return "/mecanico";
  return role === "admin" ? "/admin" : "/mecanico";
}

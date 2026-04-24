import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/store";

export const normalizeLoginId = (loginId: string) => {
  const cleaned = loginId.trim().toLowerCase();
  return cleaned.includes("@") ? cleaned : `${cleaned}@catalogo.local`;
};

export async function getCurrentRole(): Promise<{ role: Role | null; login: string | null }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return { role: null, login: null };
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const role = data?.find((r) => r.role === "admin")?.role ?? data?.[0]?.role ?? null;
  return { role, login: user.email?.replace("@catalogo.local", "") ?? user.email ?? null };
}

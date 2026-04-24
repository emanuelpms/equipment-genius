import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Role } from "@/lib/store";

async function requireAdmin(token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Acesso não autenticado.");
  const { data: allowed } = await supabaseAdmin.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  if (!allowed) throw new Error("Acesso restrito a administradores.");
  return data.user;
}

export const listAdminUsers = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const [{ data: roles }, { data: requests }, usersResult] = await Promise.all([
      supabaseAdmin.from("user_roles").select("id,user_id,role,created_at"),
      supabaseAdmin.from("access_requests").select("id,user_id,login_identifier,requested_role,status,admin_notes,created_at,updated_at").order("created_at", { ascending: false }),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);
    return { roles: roles ?? [], requests: requests ?? [], users: usersResult.data.users.map((u) => ({ id: u.id, email: u.email ?? "", created_at: u.created_at })) };
  });

export const createAdminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; loginId: string; password: string; role: Role }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const login = data.loginId.trim().toLowerCase();
    const email = login.includes("@") ? login : `${login}@catalogo.local`;
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email, password: data.password, email_confirm: true });
    if (error || !created.user) throw new Error(error?.message ?? "Não foi possível criar login.");
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: data.role });
    return { id: created.user.id, email };
  });

export const approveAccessRequest = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; requestId: string; userId: string; role: Role; status: "approved" | "rejected" }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    await supabaseAdmin.from("access_requests").update({ status: data.status, requested_role: data.role }).eq("id", data.requestId);
    if (data.status === "approved") {
      await supabaseAdmin.from("user_roles").upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
    }
    return { ok: true };
  });

export const changeUserRole = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; userId: string; role: Role }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    return { ok: true };
  });


export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) return { created: false };
    await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: "admin" });
    await supabaseAdmin.from("access_requests").update({ status: "approved", requested_role: "admin" }).eq("user_id", data.userId);
    return { created: true };
  });

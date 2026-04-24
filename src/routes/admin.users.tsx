import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, Shield, UserPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { approveAccessRequest, changeUserRole, createAdminLogin, listAdminUsers } from "@/lib/admin-auth.functions";
import type { Role } from "@/lib/store";

export const Route = createFileRoute("/admin/users")({ component: UsersAdmin });

type UserRow = { id: string; email: string; created_at: string };
type RoleRow = { id: string; user_id: string; role: Role; created_at: string };
type RequestRow = { id: string; user_id: string | null; login_identifier: string; requested_role: Role; status: "pending" | "approved" | "rejected"; created_at: string };

function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [draft, setDraft] = useState({ loginId: "", password: "", role: "seller" as Role });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = async () => (await supabase.auth.getSession()).data.session?.access_token ?? "";
  const load = async () => {
    setLoading(true);
    const data = await listAdminUsers({ data: { token: await token() } });
    setUsers(data.users as UserRow[]); setRoles(data.roles as RoleRow[]); setRequests(data.requests as RequestRow[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const roleMap = useMemo(() => new Map(roles.map((r) => [r.user_id, r.role])), [roles]);

  const createLogin = async () => {
    if (!draft.loginId.trim() || draft.password.length < 6) return;
    await createAdminLogin({ data: { token: await token(), ...draft } });
    setDraft({ loginId: "", password: "", role: "seller" }); setMessage("Login criado com sucesso."); load();
  };
  const decide = async (r: RequestRow, status: "approved" | "rejected") => {
    if (!r.user_id) return;
    await approveAccessRequest({ data: { token: await token(), requestId: r.id, userId: r.user_id, role: r.requested_role, status } });
    load();
  };
  const updateRole = async (userId: string, role: Role) => { await changeUserRole({ data: { token: await token(), userId, role } }); load(); };

  return <div className="px-8 py-8 max-w-6xl"><div className="flex items-start justify-between gap-4 mb-8"><div><div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Segurança</div><h1 className="font-display text-3xl font-bold">Logins e aprovações</h1><p className="text-sm text-muted-foreground mt-1">Crie IDs de acesso e aprove solicitações feitas na tela inicial.</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent"><RefreshCw className="h-4 w-4" />Atualizar</button></div>
    <section className="glass rounded-2xl p-5 mb-6"><div className="font-display font-bold mb-4 flex items-center gap-2"><UserPlus className="h-4 w-4" />Criar login direto</div><div className="grid md:grid-cols-[1fr_1fr_160px_140px] gap-3"><input value={draft.loginId} onChange={(e) => setDraft({ ...draft, loginId: e.target.value })} placeholder="ID do login" className={ic} /><input type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder="Senha inicial" className={ic} /><select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })} className={ic}><option value="seller">Vendedor</option><option value="admin">Admin</option></select><button onClick={createLogin} className="rounded-lg bg-primary text-primary-foreground font-semibold text-sm px-4">Criar</button></div>{message && <p className="text-sm text-success mt-3">{message}</p>}</section>
    <section className="grid lg:grid-cols-2 gap-6"><div className="glass rounded-2xl overflow-hidden"><div className="p-5 border-b border-border"><h2 className="font-display font-bold">Solicitações</h2></div><div className="divide-y divide-border">{requests.map((r) => <div key={r.id} className="p-4 flex items-center gap-3"><div className="flex-1"><div className="font-semibold text-sm">{r.login_identifier}</div><div className="text-xs text-muted-foreground">{r.requested_role} · {r.status}</div></div>{r.status === "pending" && <><button onClick={() => decide(r, "approved")} className="h-8 w-8 rounded-lg bg-success/15 text-success grid place-items-center"><Check className="h-4 w-4" /></button><button onClick={() => decide(r, "rejected")} className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center"><X className="h-4 w-4" /></button></>}</div>)}{requests.length === 0 && <div className="p-8 text-sm text-muted-foreground text-center">Nenhuma solicitação.</div>}</div></div>
    <div className="glass rounded-2xl overflow-hidden"><div className="p-5 border-b border-border"><h2 className="font-display font-bold">Usuários ativos</h2></div><div className="divide-y divide-border">{users.map((u) => <div key={u.id} className="p-4 flex items-center gap-3"><div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Shield className="h-4 w-4" /></div><div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{u.email.replace("@catalogo.local", "")}</div><div className="text-xs text-muted-foreground">{u.email}</div></div><select value={roleMap.get(u.id) ?? "seller"} onChange={(e) => updateRole(u.id, e.target.value as Role)} className="bg-input/40 border border-border rounded-lg px-2 py-1.5 text-xs"><option value="seller">Vendedor</option><option value="admin">Admin</option></select></div>)}{loading && <div className="p-8 text-sm text-muted-foreground text-center">Carregando…</div>}</div></div></section>
  </div>;
}
const ic = "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

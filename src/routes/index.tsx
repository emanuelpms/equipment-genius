import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, KeyRound, Package, Shield, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentRole, normalizeLoginId } from "@/lib/auth";
import { useStore, type Role } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Login });

function Login() {
  const { auth, login, logout } = useStore();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "request">("login");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [requestedRole, setRequestedRole] = useState<Role>("seller");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getCurrentRole().then(({ role, login: name }) => {
      if (!mounted) return;
      if (role) login(role, name ?? "Usuário");
      else logout();
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange(() => {
      getCurrentRole().then(({ role, login: name }) => {
        if (role) login(role, name ?? "Usuário");
        else logout();
      });
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, [login, logout]);

  if (!loading && auth.role) return <Navigate to={auth.role === "admin" ? "/admin" : "/showcase"} />;

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const { error: signError } = await supabase.auth.signInWithPassword({ email: normalizeLoginId(loginId), password });
    if (signError) { setError("Login ou senha inválidos, ou acesso ainda não aprovado."); setBusy(false); return; }
    const roleState = await getCurrentRole();
    if (!roleState.role) { await supabase.auth.signOut(); setError("Seu login existe, mas ainda não foi aprovado por um administrador."); setBusy(false); return; }
    login(roleState.role, roleState.login ?? loginId);
    nav({ to: roleState.role === "admin" ? "/admin" : "/showcase" });
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const email = normalizeLoginId(loginId);
    const { data, error: signError } = await supabase.auth.signUp({ email, password });
    if (signError) { setError(signError.message.includes("already") ? "Este login já existe. Tente entrar ou fale com o administrador." : "Não foi possível solicitar acesso."); setBusy(false); return; }
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("access_requests").insert({ user_id: userId, login_identifier: loginId.trim(), requested_role: requestedRole });
    }
    await supabase.auth.signOut();
    setMessage("Solicitação enviada. Um administrador precisa aprovar antes do primeiro acesso.");
    setPassword(""); setBusy(false)
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-[980px] grid lg:grid-cols-[1fr_420px] gap-8 items-center">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mb-5"><Shield className="h-3.5 w-3.5" /> Admin seguro</div>
          <h1 className="font-display text-5xl font-bold leading-tight max-w-xl">Catálogo técnico com acesso controlado.</h1>
          <p className="text-muted-foreground mt-4 max-w-lg">Entre com ID e senha para manter equipamentos, marcas, colunas comparativas e diferenciais com segurança.</p>
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-xl">
            {["Login obrigatório", "Aprovação de acesso", "Perfis separados"].map((item) => <div key={item} className="glass rounded-xl p-4 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-success mb-2" />{item}</div>)}
          </div>
        </section>

        <section className="glass rounded-2xl p-7 shadow-soft-lg">
          <div className="flex items-center gap-3 mb-7">
            <div className="h-12 w-12 rounded-xl bg-primary grid place-items-center shadow-glow"><Package className="h-6 w-6 text-primary-foreground" /></div>
            <div><h2 className="font-display text-2xl font-bold">Catálogo Pro</h2><p className="text-xs text-muted-foreground">Samsung Healthcare Intelligence</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-muted rounded-xl p-1 mb-6">
            <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>Entrar</button>
            <button onClick={() => { setMode("request"); setError(""); setMessage(""); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "request" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>Solicitar acesso</button>
          </div>
          <form onSubmit={mode === "login" ? submitLogin : submitRequest} className="space-y-4">
            <Field label="ID de login"><input value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="ex: admin ou vendedor01" required className={ic} /></Field>
            <Field label="Senha"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={ic} /></Field>
            {mode === "request" && <Field label="Perfil solicitado"><select value={requestedRole} onChange={(e) => setRequestedRole(e.target.value as Role)} className={ic}><option value="seller">Vendedor</option><option value="admin">Administrador</option></select></Field>}
            {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            {message && <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{message}</div>}
            <button disabled={busy || loading} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow">
              {mode === "login" ? <KeyRound className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{mode === "login" ? "Entrar" : "Enviar solicitação"}<ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

const ic = "w-full bg-input/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>{children}</label>; }

"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "./client";

type AuthMode = "sign-in" | "sign-up" | "reset";

type AuthError = { message?: string } | string | null | undefined;

function errorMessage(error: AuthError): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  return error.message ?? "Authentication failed";
}

function thrownErrorMessage(error: unknown, action: string): string {
  console.error(`${action} failed`, error);
  return `${action} could not reach the auth service. Check your connection and try again.`;
}

function hookErrorMessage(error: unknown, label: string): string | null {
  if (!error) return null;
  if (error instanceof Error) return `${label}: ${error.message}`;
  return `${label}: ${String(error)}`;
}

function slugifyOrganizationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

export function AuthGate({ children }: { children: ReactNode }) {
  const session = authClient.useSession();
  const activeOrganization = authClient.useActiveOrganization();
  const organizations = authClient.useListOrganizations();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const acceptedInvitationId = useRef<string | null>(null);

  const userName = session.data?.user?.name ?? session.data?.user?.email ?? "teammate";
  const organizationList = organizations.data ?? [];
  const activeOrg = activeOrganization.data;
  const loadFailure = hookErrorMessage(session.error, "Could not load session")
    ?? (session.data ? hookErrorMessage(organizations.error, "Could not load workspace list") : null);
  const isOwnerOrAdmin = useMemo(() => {
    const role = activeOrg?.members?.find((member) => member.userId === session.data?.user?.id)?.role;
    return role === "owner" || role === "admin";
  }, [activeOrg, session.data?.user?.id]);
  const invitationId = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    if (!session.data || !invitationId || acceptedInvitationId.current === invitationId) return;
    acceptedInvitationId.current = invitationId;
    void runAuthAction("Invitation acceptance", async () => {
      const { error } = await authClient.organization.acceptInvitation({ invitationId });
      if (error) {
        setFailure(errorMessage(error));
        return;
      }
      setNotice("Invitation accepted. Select the workspace to continue.");
      window.history.replaceState({}, "", window.location.pathname);
    });
  }, [invitationId, session.data]);

  async function runAuthAction(action: string, work: () => Promise<void>) {
    setPending(true);
    setFailure(null);
    setNotice(null);
    try {
      await work();
    } catch (error) {
      setFailure(thrownErrorMessage(error, action));
    } finally {
      setPending(false);
    }
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAuthAction("Sign in", async () => {
      const { error } = await authClient.signIn.email({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        callbackURL: window.location.origin,
      });
      setFailure(errorMessage(error));
    });
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAuthAction("Sign up", async () => {
      const { error } = await authClient.signUp.email({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        callbackURL: window.location.origin,
      });
      if (error) setFailure(errorMessage(error));
      else setNotice("Account created. Create or select a workspace to continue.");
    });
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAuthAction("Password reset", async () => {
      const { error } = await authClient.requestPasswordReset({
        email: String(form.get("email") ?? ""),
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setFailure(errorMessage(error));
      else setNotice("If email delivery is configured, a reset link will be sent. Production email setup is tracked separately.");
    });
  }

  async function handleCreateOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("organization") ?? "").trim();
    if (!name) return;
    await runAuthAction("Workspace creation", async () => {
      const result = await authClient.organization.create({ name, slug: slugifyOrganizationName(name) });
      if (result.error) {
        setFailure(errorMessage(result.error));
        return;
      }
      const organizationId = result.data?.id;
      if (!organizationId) {
        setFailure("Workspace creation returned no organization id. Refresh and try again.");
        return;
      }
      const { error } = await authClient.organization.setActive({ organizationId });
      setFailure(errorMessage(error));
    });
  }

  async function handleSelectOrganization(organizationId: string) {
    await runAuthAction("Workspace selection", async () => {
      const { error } = await authClient.organization.setActive({ organizationId });
      setFailure(errorMessage(error));
    });
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const role = form.get("role") === "admin" ? "admin" : "member";
    await runAuthAction("Invitation", async () => {
      const { error } = await authClient.organization.inviteMember({
        email: String(form.get("inviteEmail") ?? ""),
        role,
      });
      if (error) setFailure(errorMessage(error));
      else setNotice("Invitation created. Email delivery requires production email configuration.");
    });
  }

  async function handleSignOut() {
    await runAuthAction("Sign out", async () => {
      const { error } = await authClient.signOut();
      setFailure(errorMessage(error));
    });
  }

  if (session.isPending) {
    return <AuthPanel title="Loading secure workspace" subtitle="Checking your session." />;
  }

  if (loadFailure) {
    return <AuthPanel title="Workspace unavailable" subtitle={loadFailure}><button className="btn" onClick={() => { void handleSignOut(); }} disabled={pending}>Sign out</button></AuthPanel>;
  }

  if (!session.data) {
    return (
      <AuthPanel title="Code Colony sign-in" subtitle={invitationId ? "Sign in with the invited email address to accept this workspace invitation." : "Authentication is required before tenant data is shown."}>
        <div className="action-row" style={{ marginBottom: 12 }}>
          <button className={`btn ${mode === "sign-in" ? "primary" : ""}`} onClick={() => setMode("sign-in")}>Sign in</button>
          <button className={`btn ${mode === "sign-up" ? "primary" : ""}`} onClick={() => setMode("sign-up")}>Sign up</button>
          <button className={`btn ${mode === "reset" ? "primary" : ""}`} onClick={() => setMode("reset")}>Reset password</button>
        </div>
        {mode === "sign-in" && <AuthForm pending={pending} submitLabel="Sign in" onSubmit={handleSignIn} />}
        {mode === "sign-up" && <AuthForm pending={pending} submitLabel="Create account" onSubmit={handleSignUp} includeName />}
        {mode === "reset" && <form onSubmit={handleReset}><Field name="email" label="Email" type="email" /><button className="btn primary" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button></form>}
        <Feedback failure={failure} notice={notice} />
      </AuthPanel>
    );
  }

  if (activeOrganization.isPending || organizations.isPending) {
    return <AuthPanel title="Loading workspace" subtitle={`Signed in as ${userName}.`} />;
  }

  if (!activeOrg) {
    return (
      <AuthPanel title="Choose a workspace" subtitle="Every Code Colony session must operate inside an active organization.">
        {organizationList.length > 0 && <div className="queue-grid" style={{ marginBottom: 16 }}>{organizationList.map((org) => <button key={org.id} className="mini-card" onClick={() => { void handleSelectOrganization(org.id); }} disabled={pending}><h4>{org.name}</h4><p>{org.slug}</p></button>)}</div>}
        <form onSubmit={handleCreateOrganization}>
          <Field name="organization" label="New workspace name" />
          <button className="btn primary" disabled={pending}>{pending ? "Creating…" : "Create workspace"}</button>
        </form>
        <Feedback failure={failure} notice={notice} />
      </AuthPanel>
    );
  }

  return (
    <>
      <div className="auth-strip">
        <span className="badge system">{activeOrg.name}</span>
        <span className="badge trust">{userName}</span>
        <select className="auth-select" value={activeOrg.id} disabled={pending} onChange={(event) => { void handleSelectOrganization(event.currentTarget.value); }}>
          {organizationList.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        <button className="btn" disabled={pending} onClick={() => { void handleSignOut(); }}>{pending ? "Working…" : "Sign out"}</button>
      </div>
      {isOwnerOrAdmin && (
        <form className="auth-strip" onSubmit={handleInvite}>
          <span className="badge system">Invite member</span>
          <input className="auth-input compact" type="email" name="inviteEmail" placeholder="email@example.com" required />
          <select className="auth-select" name="role" defaultValue="member"><option value="member">member</option><option value="admin">admin</option></select>
          <button className="btn" disabled={pending}>{pending ? "Inviting…" : "Invite"}</button>
        </form>
      )}
      <Feedback failure={failure} notice={notice} />
      {children}
    </>
  );
}

function AuthPanel({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return <main className="colony-shell"><section className="hero compact bracket" style={{ maxWidth: 720, margin: "8vh auto" }}><div><div className="hero-tag">AUTH REQUIRED</div><h1 className="hero-title code-colony">{title}<span className="sep">|</span>SECURE TENANT</h1><p className="hero-blurb">{subtitle}</p>{children}</div><span className="bl" /><span className="br" /></section></main>;
}

function AuthForm({ includeName = false, pending, submitLabel, onSubmit }: { includeName?: boolean; pending: boolean; submitLabel: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit}>{includeName && <Field name="name" label="Name" />}<Field name="email" label="Email" type="email" /><Field name="password" label="Password" type="password" /><button className="btn primary" disabled={pending}>{pending ? "Working…" : submitLabel}</button></form>;
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return <label className="auth-field"><span className="eyebrow">{label}</span><input className="auth-input" name={name} type={type} required /></label>;
}

function Feedback({ failure, notice }: { failure: string | null; notice: string | null }) {
  return <>{failure && <div className="notice mini">{failure}</div>}{notice && <div className="notice mini">{notice}</div>}</>;
}

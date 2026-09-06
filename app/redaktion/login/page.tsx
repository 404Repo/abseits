import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getAuthorizedEditor, hasConfiguredEditor } from "@/lib/editor-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAuthorizedEditor()) redirect("/redaktion");
  const configured = hasConfiguredEditor();
  if (!configured) redirect("/redaktion/setup");
  const { error } = await searchParams;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="page-shell login-shell">
        <form className="login-card" action="/api/auth/login" method="post">
          <div className="eyebrow-chip"><LockKeyhole className="size-3.5" />Redaktion</div>
          <h1>Anmelden</h1>
          <p>Der Redaktionsbereich ist nicht öffentlich zugänglich.</p>
          {error === "credentials" && <div className="login-error" role="alert">E-Mail-Adresse oder Passwort ist falsch.</div>}
          <label>
            <span className="field-label">E-Mail-Adresse</span>
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            <span className="field-label">Passwort</span>
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button type="submit">Anmelden</button>
        </form>
      </section>
    </main>
  );
}

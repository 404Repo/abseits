import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { hasConfiguredEditor } from "@/lib/editor-auth";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  "setup-token": "Der Einrichtungsschlüssel ist falsch.",
  email: "Bitte trage eine gültige E-Mail-Adresse ein.",
  password: "Das Passwort muss mindestens 12 Zeichen lang sein.",
  "already-configured": "Das Redaktionskonto wurde bereits eingerichtet.",
  unknown: "Das Redaktionskonto konnte nicht eingerichtet werden.",
};

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (hasConfiguredEditor()) redirect("/redaktion/login");
  const { error } = await searchParams;
  const requiresToken = Boolean(process.env.SETUP_TOKEN);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="page-shell login-shell">
        <form className="login-card" action="/api/auth/setup" method="post">
          <div className="eyebrow-chip"><KeyRound className="size-3.5" />Ersteinrichtung</div>
          <h1>Redaktion einrichten</h1>
          <p>Lege das einmalige Administratorkonto für .ABSEITS an.</p>
          {error && <div className="login-error" role="alert">{messages[error] || messages.unknown}</div>}
          <label>
            <span className="field-label">E-Mail-Adresse</span>
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            <span className="field-label">Passwort</span>
            <input type="password" name="password" minLength={12} autoComplete="new-password" required />
          </label>
          {requiresToken && (
            <label>
              <span className="field-label">Einrichtungsschlüssel</span>
              <input type="password" name="setupToken" autoComplete="off" required />
            </label>
          )}
          <button type="submit">Redaktion einrichten</button>
        </form>
      </section>
    </main>
  );
}

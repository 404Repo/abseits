import { LockKeyhole } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="magazine-header" data-app=".ABSEITS" data-version="0.6.1">
      <div className="page-shell masthead-row"><Link className="masthead" href="/" aria-label=".ABSEITS – Startseite"><span><em>.</em>ABSEITS</span></Link><p>Außergewöhnliche Fälle.<br />Nüchtern erzählt.</p></div>
      <div className="header-navigation"><div className="page-shell"><nav aria-label="Hauptnavigation"><Link href="/#archiv">Neueste Fälle</Link><Link href="/#kategorien">Kategorien</Link><Link href="/#archiv">Alle Dossiers</Link></nav><Link className="editor-entry" href="/redaktion"><LockKeyhole className="size-4" aria-hidden="true" />Redaktion</Link></div></div>
    </header>
  );
}

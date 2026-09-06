import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: ".ABSEITS", template: "%s — .ABSEITS" },
  description: "Dossiers über außergewöhnliche Kriminalfälle, Mysterien, wissenschaftliche Fälle und folgenschwere Vorfälle.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body suppressHydrationWarning>{children}</body></html>;
}

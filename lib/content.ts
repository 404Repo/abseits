export const categories = ["Kriminalfälle", "Mysterien", "Wissenschaft", "Unfälle & Vorfälle"] as const;

export type PublicArticle = {
  id: string;
  slug: string;
  title: string;
  kicker?: string;
  subtitle?: string;
  excerpt: string;
  summary?: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  imageAlt: string | null;
  publishedAt: string;
  readingMinutes: number;
};

export const sampleArticles: PublicArticle[] = [
  {
    id: "sample-isdal", slug: "die-unbekannte-von-isdal",
    title: "Die Unbekannte von Isdal: Eine Identität aus Fragmenten",
    excerpt: "Ein ungeklärter Todesfall, entfernte Etiketten und wechselnde Namen: Was im Fall der Isdal-Frau als belegt gilt – und wo die Spekulation beginnt.",
    content: "Im November 1970 wurde im Isdal nahe Bergen die Leiche einer unbekannten Frau gefunden. Persönliche Gegenstände waren teilweise von Hinweisen auf ihre Herkunft befreit worden. Ermittlungen führten zu mehreren Hotels, in denen sie unter verschiedenen Namen eingecheckt hatte.\n\nDer Fall wurde über Jahrzehnte immer wieder neu betrachtet. Moderne Analysen lieferten zusätzliche Hinweise auf ihre mögliche Herkunft und Reisen, doch eine zweifelsfreie Identifizierung steht weiterhin aus. Gerade deshalb ist eine klare Trennung wichtig: zwischen dokumentierten Spuren, späteren Untersuchungen und Erzählungen, die sich um den Fall gebildet haben.\n\nDieses Dossier ist ein Beispielbeitrag für die Struktur von .ABSEITS. Vor einer echten Veröffentlichung sollten Primärquellen und belastbare Sekundärquellen ergänzt werden.",
    category: "Kriminalfälle", tags: ["Norwegen", "Cold Case", "Identität"], coverImage: "/editorial/isdal.webp", imageAlt: "Redaktionelle Illustration: eine anonyme Frau blickt über ein nebliges norwegisches Tal", publishedAt: "2026-09-04T09:00:00.000Z", readingMinutes: 4,
  },
  {
    id: "sample-wow", slug: "das-wow-signal",
    title: "Das Wow!-Signal: 72 Sekunden ohne Wiederholung",
    excerpt: "1977 registrierte ein Radioteleskop ein ungewöhnlich starkes Signal. Warum eine kurze Notiz bis heute Teil der Wissenschaftsgeschichte ist.",
    content: "Am 15. August 1977 erfasste das Big-Ear-Radioteleskop der Ohio State University ein auffälliges Schmalbandsignal. Der Astronom Jerry Ehman markierte den Ausdruck später mit dem Wort „Wow!“.\n\nDie Dauer von 72 Sekunden entsprach dem Zeitfenster, in dem das Teleskop einen Punkt am Himmel beobachten konnte. Das Signal wurde jedoch nicht erneut in gleicher Weise registriert. Verschiedene natürliche und technische Erklärungen wurden diskutiert, ohne dass sich eine davon abschließend durchgesetzt hätte.\n\nDer Fall zeigt, wie Wissenschaft mit einmaligen Messungen umgeht: Ein ungewöhnlicher Befund ist ein Anlass zur Prüfung, aber noch kein Beweis für eine spektakuläre Erklärung.",
    category: "Wissenschaft", tags: ["Astronomie", "SETI", "Messsignal"], coverImage: "/editorial/wow-signal.webp", imageAlt: "Redaktionelle Illustration: ein Radioteleskop unter einem nächtlichen Himmel", publishedAt: "2026-08-28T09:00:00.000Z", readingMinutes: 3,
  },
  {
    id: "sample-dyatlov", slug: "dyatlov-pass-zwischen-fakten-und-mythos",
    title: "Dyatlov-Pass: Zwischen gesicherten Spuren und Mythos",
    excerpt: "Neun Tote, ein verlassenes Zelt und Jahrzehnte voller Theorien. Eine nüchterne Einordnung der bekannten Fakten.",
    content: "Im Februar 1959 starben neun Mitglieder einer Wandergruppe im nördlichen Ural. Ihr Zelt wurde später verlassen und beschädigt aufgefunden; die Fundorte und Verletzungen führten zu zahlreichen Theorien.\n\nViele populäre Darstellungen vermischen Ermittlungsakten, spätere Rekonstruktionen und Spekulationen. Untersuchungen verwiesen unter anderem auf extreme Wetterbedingungen und eine mögliche Schneebrettsituation. Einzelne Details werden dennoch bis heute unterschiedlich bewertet.\n\nEin seriöses Dossier macht sichtbar, welche Aussage aus welcher Quelle stammt und wie sicher sie ist. Genau diese Trennung bildet den Kern der redaktionellen Arbeit von .ABSEITS.",
    category: "Mysterien", tags: ["Ural", "Expedition", "Rekonstruktion"], coverImage: "/editorial/dyatlov.webp", imageAlt: "Redaktionelle Illustration: ein verlassenes Zelt auf einem verschneiten Berghang", publishedAt: "2026-08-16T09:00:00.000Z", readingMinutes: 5,
  },
  {
    id: "sample-tacoma", slug: "tacoma-narrows-resonanz",
    title: "Tacoma Narrows: Als eine Brücke zu schwingen begann",
    excerpt: "Der Einsturz von 1940 wurde zum Sinnbild für technische Dynamik – und wird trotzdem oft zu einfach erklärt.",
    content: "Am 7. November 1940 stürzte die Tacoma-Narrows-Brücke im US-Bundesstaat Washington ein. Starker Wind versetzte die Fahrbahn in zunehmend ausgeprägte Torsionsschwingungen. Menschen kamen beim Einsturz nicht ums Leben.\n\nHäufig wird das Ereignis allein mit Resonanz erklärt. Die technische Einordnung ist differenzierter: Aerodynamische Instabilität und das Zusammenspiel von Wind und Bauwerk waren entscheidend. Die Aufnahmen des Einsturzes prägten Forschung und Lehre im Brückenbau nachhaltig.\n\nDer Vorfall erinnert daran, dass spektakuläre Bilder eine gute Erklärung nicht ersetzen. Technische Fälle brauchen Begriffe, die verständlich sind, ohne den Mechanismus zu verfälschen.",
    category: "Unfälle & Vorfälle", tags: ["Brückenbau", "Aerodynamik", "1940"], coverImage: "/editorial/tacoma.webp", imageAlt: "Redaktionelle Illustration: die Tacoma-Narrows-Brücke unter einem stürmischen Himmel", publishedAt: "2026-08-03T09:00:00.000Z", readingMinutes: 4,
  },
];

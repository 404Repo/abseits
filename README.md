# .ABSEITS

Eigenständig entwickelte Magazin-Anwendung für außergewöhnliche Kriminalfälle,
Mysterien, wissenschaftliche Fälle sowie Unfälle und Vorfälle.

## Technik

- Next.js mit TypeScript
- SQLite direkt über die integrierte Node.js-Laufzeit
- eigener, sitzungsbasierter Redaktionszugang
- Bilder und Daten im persistenten Verzeichnis `data/`
- Docker optional

Cloudflare Workers, WordPress und externe Redaktionsdienste werden nicht benötigt.

## Lokal ohne Docker

Voraussetzung ist Node.js 22 oder neuer. Unter Windows genügt:

Das ZIP immer in einen **neuen, leeren Ordner** entpacken. Es darf nicht über
eine frühere Cloudflare- oder Docker-Fassung kopiert werden. Falls die alte
Docker-Version noch läuft, im alten Projektordner zuerst ausführen:

```powershell
docker compose down --remove-orphans
```

Danach im neuen Ordner:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1
```

Die Website läuft standardmäßig unter `http://localhost:4173`. Beim ersten
Öffnen von `http://localhost:4173/redaktion` wird das Redaktionskonto direkt im
Browser eingerichtet.

Alternativ manuell:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev -- --port 4173
```

## Produktiv mit Docker

```powershell
Copy-Item .env.example .env
notepad .env
docker compose up -d --build
```

Vor dem öffentlichen Start muss `SETUP_TOKEN` in `.env` geändert werden. Dieser
Schlüssel wird nur bei der erstmaligen Einrichtung des Redaktionskontos
abgefragt. Die Datenbank und hochgeladene Bilder liegen im lokalen Ordner
`data/` und bleiben bei Container-Updates erhalten.

Für einen öffentlich per HTTPS erreichbaren Server muss zusätzlich
`SESSION_COOKIE_SECURE=true` gesetzt werden. Beim lokalen HTTP-Test bleibt der
Wert `false`.

## Produktiv ohne Docker

Auf einem Node-fähigen Webhosting:

```bash
npm ci
npm run build
npm run start
```

Die Umgebungsvariablen aus `.env.example` müssen im Hosting-Panel hinterlegt
werden. Das konfigurierte Datenverzeichnis muss dauerhaft beschreibbar sein.

## Redaktion

Der Zugang liegt unter `/redaktion`. Artikel können als Entwurf gespeichert
oder veröffentlicht und mit Kategorie, Schlagwörtern sowie einem Aufmacherbild
versehen werden. Unterstützte Bildformate sind JPG, PNG, WebP und GIF bis 12 MB.

## Git-Workflow

Der stabile Entwicklungszweig ist `main`. Änderungen werden künftig in einem
eigenen Feature- oder Fix-Branch entwickelt, kurz getestet und anschließend in
`main` übernommen. Lokale Inhalte unter `data/` sowie `.env`-Dateien werden
nicht versioniert.

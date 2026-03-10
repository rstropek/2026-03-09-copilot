## Plan: Hero List Page

**TL;DR**: Neue Seite unter `/heroes`, die alle gespeicherten Helden als Card-Grid anzeigt. Erfordert eine neue Data-Access-Funktion, einen GET-API-Endpunkt, eine Server-Component-Page und gestylte Komponenten im bestehenden Comic-Book-Aesthetic. Reine Display-Logik wird extrahiert, um Unit-Tests zu ermöglichen.

---

### Phase 1: Data & API Layer

1. **`getAllHeroes()` in `data/heroes.ts` hinzufügen**
   - Alle Reihen aus `heroes`-Tabelle abfragen, sortiert nach `id DESC` (neueste zuerst)
   - `super_powers` JSON-String → `string[]` deserialisieren (selbes Muster wie `createHero`)
   - Rückgabetyp: `Hero[]`

2. **GET-Handler in `app/api/heroes/route.ts` ergänzen** *(parallel mit Schritt 1)*
   - `getAllHeroes` importieren und als JSON-Array mit Status 200 zurückgeben
   - Keine Paginierung (kleiner Datensatz)

### Phase 2: UI — Hero List Page

3. **`app/heroes/page.tsx` erstellen** (Server Component) *(hängt von 1 ab)*
   - `getAllHeroes()` direkt serverseitig aufrufen (kein API-Fetch nötig)
   - Page-Header (gleiches Muster wie `app/heroes/new/page.tsx`) + `<HeroList>` Client-Component
   - Helden als Props übergeben

4. **`app/heroes/HeroList.tsx` erstellen** (Client Component) *(hängt von 3 ab)*
   - Empfängt `Hero[]` als Props
   - Card-Grid: jeder Held als Karte mit Name, Real Name, First Appearance, Powers (als Tags), Coolness (Sterne)
   - Empty-State-Nachricht, wenn keine Helden existieren
   - Reine Display-Logik in `lib/heroFormatters.ts` extrahieren (testbar)

5. **`app/heroes/HeroList.module.css` erstellen** *(parallel mit Schritt 4)*
   - Comic-Book-Aesthetic aus `app/heroes/new/HeroForm.module.css` übernehmen
   - CSS-Grid-Layout (1 Spalte mobil → 2–3 Spalten Desktop)
   - Dicke schwarze Borders, Offset-Shadows, chromatische Text-Shadows
   - Power-Tags mit alternierenden Cyan/Magenta-Hintergründen
   - Star-Rating-Anzeige (gefüllt/leer)
   - Ausreichend Spacing für gute Lesbarkeit

### Phase 3: Navigation

6. **Navigation-Link auf Home-Page ergänzen** *(hängt von 3 ab)*
   - `app/page.tsx`: "ALL HEROES"-Button neben bestehenden CTAs, verlinkt zu `/heroes`

7. **Navigation-Link auf Hero-Erstellungsseite** *(parallel mit 6)*
   - `app/heroes/new/page.tsx` oder HeroForm: Link zu `/heroes`

### Phase 4: Unit Tests

8. **`lib/heroFormatters.ts` erstellen** *(parallel mit Phase 2)*
   - `renderStarRating(coolness: number): string` — gibt visuellen Stern-String zurück (z.B. "★★★☆☆")
   - `formatRealName(realName: string | null): string` — gibt "Unknown" oder den echten Namen zurück
   - Reine Funktionen ohne Seiteneffekte → ideale Unit-Test-Kandidaten

9. **`lib/__tests__/heroFormatters.test.ts` erstellen** *(hängt von 8 ab)*
   - `renderStarRating`: Edge Cases (0, 1, 5, Grenzwerte)
   - `formatRealName`: null, leerer String, gültiger Name

---

### Relevante bestehende Dateien
- `data/heroes.ts` — `getAllHeroes()` ergänzen (Muster von `createHero()`)
- `app/api/heroes/route.ts` — GET-Handler hinzufügen
- `app/heroes/new/HeroForm.tsx` — Referenz für Star-Rating & Power-Tags
- `app/heroes/new/HeroForm.module.css` — Referenz für CSS-Patterns
- `app/page.tsx` — CTA-Button ergänzen
- `types/hero.ts` — `Hero`-Interface für Props

### Neue Dateien
- `app/heroes/page.tsx` — Server Component für Heldenliste
- `app/heroes/HeroList.tsx` — Client Component mit Card-Grid
- `app/heroes/HeroList.module.css` — Styles
- `lib/heroFormatters.ts` — Reine Display-Hilfsfunktionen
- `lib/__tests__/heroFormatters.test.ts` — Unit Tests

---

### Verification
1. `npm run lint` — keine Fehler
2. `npm run build` — kompiliert erfolgreich
3. `npm run test` — alle Tests bestehen (inkl. neue `heroFormatters.test.ts`)
4. Manuell: `/heroes` aufrufen, Helden mit allen Feldern prüfen
5. Manuell: Empty State prüfen (keine Helden)
6. Manuell: Held anlegen → Liste prüfen ob er erscheint
7. Manuell: Responsive Layout auf Mobilgerät (< 600px)

---

### Designentscheidungen
- **Server-Side Data Fetching**: Liste nutzt `getAllHeroes()` direkt im Server Component — einfacher, schneller, Next.js Best Practice
- **GET-Endpoint trotzdem**: Nützlich für künftige Client-Interaktionen (Suche, Refresh)
- **Keine Paginierung**: Kleiner Datensatz angenommen; kann später ergänzt werden
- **Card-Layout statt Tabelle**: Passt besser zur Comic-Ästhetik und ist responsiver
- **Formatter-Funktionen extrahiert**: Hält Logik aus den Komponenten, ermöglicht Unit-Tests ohne Rendering

---

### Unit-Test-Vorschlag (nicht-triviale Logik)
| Funktion | Warum testen? |
|---|---|
| `renderStarRating(coolness)` | Numerischen Wert (0–5) in visuelle Darstellung umwandeln. Edge Cases bei Grenzwerten. |
| `formatRealName(realName)` | Null-Handling mit Fallback. |
| `getAllHeroes()` JSON-Deserialisierung | Gleiches Pattern wie `createHero`, aber über mehrere Zeilen — eher Integrationstest. |

**Empfehlung**: Fokus auf `renderStarRating` und `formatRealName` als reine Unit-Tests.

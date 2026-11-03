# NIMBR website

Statische website, klaar voor GitHub Pages of jullie eigen EU-server. Geen build-stap nodig.

## Pagina's

| Bestand | Pagina |
| --- | --- |
| `index.html` | Home (met laadanimatie, één keer per bezoek) |
| `oplossingen.html` | Oplossingen en branches |
| `resultaten.html` | Vastgoedcase en voorbeelden |
| `samenwerken.html` | Aanpak, budget, niveaus, looptijden, FAQ |
| `over-ons.html` | Verhaal, team en Nimbr |
| `vraag-nimbr.html` | Chat met Nimbr |
| `contact.html` | Gratis automatiseringsscan (formulier) |
| `privacy.html`, `voorwaarden.html` | Concepten, juridisch laten controleren |
| `404.html` | Pagina niet gevonden |

## Voor livegang invullen

1. **Webhooks** bovenaan `assets/site.js`:
   - `leadWebhook`: ontvangt elke aanvraag uit de chat en het formulier (veld `bron`: `chat` of `formulier`).
   - `aiWebhook`: ontvangt `taak`, `nu`, `tijd`, `systemen` en stuurt terug: `{"intro": "...", "stappen": ["...","...","..."], "let_op": "..."}`.
   - `leadmagnetWebhook`: ontvangt elke aanvraag voor de checklist (zie de map leadmagneet voor de mails en de flow).
   - Zet CORS aan voor jullie domein en bouw in n8n een limiet per IP-adres.
2. **Domein**: in alle pagina's, `robots.txt` en `sitemap.xml` staat `https://www.nimbr.nl/`, passend bij het bestand `CNAME`. Wijkt het domein af, zoek en vervang dat.
3. **Gegevens**: e-mailadres, telefoonnummer, KvK-nummer en de teksten tussen [haken] in privacy en voorwaarden.

## Spambescherming

- Onzichtbaar extra veld in chat en formulier: bots vullen het in, mensen niet.
- Aanvragen binnen 4 seconden na het laden worden genegeerd.
- Maximaal 3 aanvragen per bezoek.
- Aanvulling in n8n: limiet per IP-adres en controle op het e-mailadres.

## Privacy

- Lettertype Inter staat lokaal in `assets/fonts` (geen Google Fonts, licentie in `LICENSE-Inter.txt`).
- Google Analytics (meet-ID in `assets/analytics.js`) laadt pas nadat de bezoeker op "Accepteren" klikt (Consent Mode v2, standaard alles geweigerd). Zonder toestemming gaan er geen cookies en geen verzoeken naar Google. Via "Cookie-instellingen" in de footer kan de keuze gewijzigd worden.
- Verder geen externe scripts.

## GitHub Pages

Upload de inhoud van deze map naar de root van de repository en zet Pages aan op de `main`-branch. Voor een eigen domein: voeg een bestand `CNAME` toe met de domeinnaam.

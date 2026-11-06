# NIMBR Kennisbank

Deze map komt niet op de website (GitHub Pages slaat mappen met een `_` over). Hier staan alle artikelen klaar, ook de artikelen die nog niet gepubliceerd zijn.

## Hoe publiceren werkt

- Elk artikel staat in `artikelen/`, met bovenaan een blok met gegevens (titel, datum, auteur, samenvatting, veelgestelde vragen).
- Elke ochtend draait de GitHub Action **Kennisbank publiceren** (`.github/workflows/kennisbank.yml`).
- Artikelen waarvan de `datum` is bereikt, worden gebouwd naar `kennisbank/<slug>.html`. Het overzicht, het blok op de homepage en de sitemap worden bijgewerkt.
- Schema: 2 artikelen per maand, op de 6e en de 20e, van november 2026 tot en met oktober 2027. Tim en Stephan schrijven om en om.

## Een artikel aanpassen

- **Tekst wijzigen:** pas het bestand in `artikelen/` aan. Bij een gepubliceerd artikel: zet `"bijgewerkt": "JJJJ-MM-DD"` in het gegevensblok, zodat Google ziet dat het is bijgewerkt.
- **Later publiceren:** verander de `datum`. Staat het artikel al online, dan verdwijnt het tot de nieuwe datum.
- **Niet publiceren:** verplaats het bestand uit de map `artikelen/`.
- **Direct publiceren:** zet de datum op vandaag en start de Action handmatig (GitHub → Actions → Kennisbank publiceren → Run workflow).

## Een nieuw artikel toevoegen

Kopieer een bestaand artikel, geef het een nieuw nummer, een unieke `slug` en een datum. Opmaak in gewone HTML: `<h2>` voor tussenkoppen (die komen in de inhoudsopgave), `<p>`, `<ul>`, `<ol>`, `<table>`. Zet `<!--tip-->` op de plek waar het tipblok moet komen. Mogelijke tips: `checklist`, `demo`, `scan`, `rekenen`.

## Lokaal testen

```
python3 _kennisbank/publiceer.py                        # bouw met de datum van vandaag
KB_DATUM=2027-11-01 python3 _kennisbank/publiceer.py    # kijk hoe het eruitziet met alle artikelen
python3 _kennisbank/publiceer.py                        # daarna weer terugzetten naar vandaag
```

Alle teksten zijn origineel geschreven voor NIMBR.

#!/usr/bin/env python3
"""NIMBR Kennisbank: zet artikelen online zodra hun publicatiedatum is bereikt.

Werking
- Elk artikel staat in _kennisbank/artikelen/*.html, met bovenaan een JSON-blok tussen <!-- en -->.
- Artikelen met een datum op of voor vandaag (Nederlandse tijd) worden gebouwd naar kennisbank/<slug>.html.
- Daarna worden het overzicht (kennisbank/index.html), het blok op de homepage en de sitemap bijgewerkt.
- De map _kennisbank komt niet op de site (GitHub Pages/Jekyll slaat mappen met een _ over).

Gebruik
  python3 _kennisbank/publiceer.py               # bouw met de datum van vandaag
  KB_DATUM=2027-03-01 python3 _kennisbank/publiceer.py   # test: bouw alsof het die datum is
"""
import datetime as dt
import html
import json
import math
import os
import re
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / '_kennisbank' / 'artikelen'
OUT = ROOT / 'kennisbank'
SITE = 'https://www.nimbr.nl'
MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
           'september', 'oktober', 'november', 'december']

AUTEURS = {
    'tim': {
        'naam': 'Tim Boeve', 'foto': 'tim.webp',
        'rol': 'Co-founder · Lean Six Sigma Black Belt',
        'bio': 'Tim brengt processen in kaart en zorgt dat elke automatisering aantoonbaar tijd en geld oplevert. '
               'Hij heeft jarenlange ervaring in kosten- en procesoptimalisatie.',
    },
    'stephan': {
        'naam': 'Stephan Spauwen', 'foto': 'stephan.webp',
        'rol': 'Co-founder · Lean Six Sigma Green Belt',
        'bio': 'Stephan vertaalt procesverbeteringen naar slimme oplossingen en zorgt dat Nimbr dag en nacht '
               'betrouwbaar draait.',
    },
}

TIPS = {
    'checklist': ('Gratis checklist', '10 taken die je vandaag kunt automatiseren. Vink aan wat jullie nog met de hand doen en zie in vijf minuten waar de tijd weglekt.',
                  '../index.html#checklist', 'Download de checklist'),
    'demo': ('Probeer het zelf', 'In onze interactieve demo zie je hoe Nimbr dit in de praktijk doet, met fictieve gegevens.',
             '../demo.html', 'Bekijk de demo'),
    'scan': ('Gratis automatiseringsscan', 'In 30 minuten kijken we samen naar jouw processen. Je krijgt je top 3 automatiseringen, vrijblijvend.',
             '../contact.html', 'Plan je gratis scan'),
    'rekenen': ('Reken het zelf uit', 'Met de rekentool op onze homepage zie je in een paar seconden wat automatisering jouw bedrijf per jaar oplevert.',
                '../index.html#rekenen', 'Naar de rekentool'),
}


def vandaag():
    if os.environ.get('KB_DATUM'):
        return dt.date.fromisoformat(os.environ['KB_DATUM'])
    return dt.datetime.now(ZoneInfo('Europe/Amsterdam')).date()


def nl_datum(d):
    return f'{d.day} {MAANDEN[d.month - 1]} {d.year}'


def esc(t):
    return html.escape(str(t), quote=True)


def slugify(t):
    t = t.lower()
    for a, b in (('ë', 'e'), ('é', 'e'), ('è', 'e'), ('ï', 'i'), ('ö', 'o'), ('ü', 'u'), ('á', 'a'), ('&', 'en')):
        t = t.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def lees_artikelen():
    arts = []
    for f in sorted(SRC.glob('*.html')):
        s = f.read_text(encoding='utf-8')
        m = re.match(r'\s*<!--(.*?)-->(.*)', s, re.S)
        if not m:
            sys.exit(f'Geen JSON-kop gevonden in {f.name}')
        meta = json.loads(m.group(1))
        meta['body'] = m.group(2).strip()
        meta['datum_d'] = dt.date.fromisoformat(meta['datum'])
        meta['bron'] = f.name
        for k in ('titel', 'slug', 'datum', 'auteur', 'categorie', 'samenvatting', 'beschrijving', 'kort', 'faq'):
            if k not in meta:
                sys.exit(f'{f.name}: veld "{k}" ontbreekt')
        if meta['auteur'] not in AUTEURS:
            sys.exit(f'{f.name}: onbekende auteur {meta["auteur"]}')
        arts.append(meta)
    slugs = [a['slug'] for a in arts]
    if len(slugs) != len(set(slugs)):
        sys.exit('Dubbele slug gevonden')
    return sorted(arts, key=lambda a: a['datum_d'])


# ---------- onderdelen van de bestaande site hergebruiken (header, footer, logo) ----------
def site_onderdelen():
    s = (ROOT / 'samenwerken.html').read_text(encoding='utf-8')
    def pak(start, eind):
        i = s.index(start); j = s.index(eind, i) + len(eind)
        return s[i:j]
    svg = pak('<svg width="0" height="0"', '</symbol></svg>')
    header = pak('<a class="skip"', '</header>')
    fab = pak('<a class="fab"', '</a>')
    footer = pak('<footer>', '</footer>')
    return svg, header, fab, footer


def relatief(fragment, prefix):
    """Maak links in een stuk HTML geschikt voor een pagina in een submap."""
    if not prefix:
        return fragment
    return re.sub(r'(href|src)="(?!https?:|#|/|mailto:|tel:|data:)([^"]+)"', lambda m: f'{m.group(1)}="{prefix}{m.group(2)}"', fragment)


def kop(titel, beschrijving, canonical, prefix, extra_ld, og_type='website', robots='index,follow,max-image-preview:large'):
    return f'''<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<script src="{prefix}assets/analytics.js"></script>
<title>{esc(titel)}</title>
<meta name="description" content="{esc(beschrijving)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="NIMBR">
<meta property="og:title" content="{esc(titel)}">
<meta property="og:description" content="{esc(beschrijving)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/assets/og-image.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="NIMBR – Minder herhaalwerk. Meer ruimte.">
<meta property="og:locale" content="nl_NL">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(titel)}">
<meta name="twitter:description" content="{esc(beschrijving)}">
<meta name="twitter:image" content="{SITE}/assets/og-image.png">
<meta name="theme-color" content="#0D3038">
<link rel="icon" href="{prefix}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{prefix}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{prefix}apple-touch-icon.png">
<link rel="preload" href="{prefix}assets/fonts/Inter-SemiBold.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="{prefix}assets/site.css">
{extra_ld}
</head>
'''


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + '</script>'


def leestijd(body):
    woorden = len(re.sub(r'<[^>]+>', ' ', body).split())
    return max(2, math.ceil(woorden / 200))


def kaart(a, prefix_link):
    au = AUTEURS[a['auteur']]
    return (f'<a class="kb-card" href="{prefix_link}{a["slug"]}.html" data-cat="{esc(slugify(a["categorie"]))}">'
            f'<span class="kb-cat">{esc(a["categorie"])}</span>'
            f'<h3>{esc(a["titel"])}</h3><p>{esc(a["samenvatting"])}</p>'
            f'<span class="kb-cmeta">{esc(au["naam"])} · {leestijd(a["body"])} min lezen</span>'
            f'<span class="go" aria-hidden="true">→</span></a>')


def bouw_artikel(a, gepubliceerd, svg, header, fab, footer):
    au = AUTEURS[a['auteur']]
    p = '../'
    url = f'{SITE}/kennisbank/{a["slug"]}.html'
    body = a['body']
    # koppen voorzien van ids en inhoudsopgave maken
    toc = []
    def h2(m):
        tekst = re.sub(r'<[^>]+>', '', m.group(1))
        i = slugify(tekst)[:60]
        toc.append((i, tekst))
        return f'<h2 id="{i}">{m.group(1)}</h2>'
    body = re.sub(r'<h2>(.*?)</h2>', h2, body)
    tip = TIPS[a.get('tip', 'checklist')]
    tipbox = (f'<aside class="kb-tip"><b>{tip[0]}</b><p>{tip[1]}</p>'
              f'<a class="link" href="{tip[2]}">{tip[3]} <span>→</span></a></aside>')
    body = body.replace('<!--tip-->', tipbox) if '<!--tip-->' in body else body + tipbox
    faq_html = ''.join(f'<details><summary>{esc(v)}</summary><p>{esc(ant)}</p></details>' for v, ant in a['faq'])
    toc.append(('veelgestelde-vragen', 'Veelgestelde vragen'))
    toc_html = ''.join(f'<li><a href="#{i}">{esc(t)}</a></li>' for i, t in toc)
    rel_slugs = [s for s in a.get('gerelateerd', []) if s in gepubliceerd and s != a['slug']]
    if len(rel_slugs) < 3:
        rest = [x['slug'] for x in sorted(gepubliceerd.values(), key=lambda x: x['datum_d'], reverse=True)
                if x['slug'] != a['slug'] and x['slug'] not in rel_slugs]
        rel_slugs += rest[:3 - len(rel_slugs)]
    rel = ''.join(kaart(gepubliceerd[s], '') for s in rel_slugs[:3])
    gewijzigd = dt.date.fromisoformat(a.get('bijgewerkt', a['datum']))
    lds = '\n'.join([
        ld({'@context': 'https://schema.org', '@type': 'BlogPosting', 'headline': a['titel'], 'description': a['beschrijving'],
            'datePublished': a['datum'], 'dateModified': gewijzigd.isoformat(), 'inLanguage': 'nl-NL',
            'mainEntityOfPage': url, 'image': f'{SITE}/assets/og-image.png',
            'author': {'@type': 'Person', 'name': au['naam'], 'jobTitle': au['rol'], 'url': f'{SITE}/over-ons.html'},
            'publisher': {'@id': f'{SITE}/#org', '@type': 'Organization', 'name': 'NIMBR', 'logo': {'@type': 'ImageObject', 'url': f'{SITE}/icon-512.png'}},
            'articleSection': a['categorie']}),
        ld({'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': v, 'acceptedAnswer': {'@type': 'Answer', 'text': ant}} for v, ant in a['faq']]}),
        ld({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': f'{SITE}/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Kennisbank', 'item': f'{SITE}/kennisbank/'},
            {'@type': 'ListItem', 'position': 3, 'name': a['titel'], 'item': url}]}),
    ])
    pagina = kop(f'{a["titel"]} | NIMBR Kennisbank', a['beschrijving'], url, p, lds, 'article')
    pagina += f'''<body data-page="kennisbank">
{svg}
{relatief(header, p)}
<main id="inhoud">
<section class="phero kb-hero"><div class="wrap">
  <div class="pcopy">
    <nav class="kb-crumb" aria-label="Kruimelpad"><a href="./">Kennisbank</a><span aria-hidden="true">/</span>{esc(a["categorie"])}</nav>
    <h1>{esc(a["titel"])}</h1>
    <p class="lead">{esc(a["samenvatting"])}</p>
    <div class="kb-by"><img src="{p}assets/img/{au["foto"]}" alt="" width="44" height="44" loading="lazy"><span>Door <b>{esc(au["naam"])}</b><br>{nl_datum(a["datum_d"])} · {leestijd(a["body"])} min lezen</span></div>
  </div>
  <img fetchpriority="high" decoding="async" class="nb" src="{p}assets/img/{a.get("afbeelding", "nimbr-think")}.webp" alt="">
</div></section>
<section class="pg kb-pg"><div class="wrap kb-grid">
  <article class="kb-art">
    <div class="kb-kort"><b>Kort antwoord</b><p>{esc(a["kort"])}</p></div>
    {body}
    <h2 id="veelgestelde-vragen">Veelgestelde vragen</h2>
    <div class="faq">{faq_html}</div>
    <div class="kb-auteur"><img src="{p}assets/img/{au["foto"]}" alt="{esc(au["naam"])}" width="72" height="72" loading="lazy"><div><small>Over de auteur</small><b>{esc(au["naam"])}</b><span>{esc(au["rol"])}</span><p>{esc(au["bio"])}</p></div></div>
  </article>
  <aside class="kb-side">
    <nav class="kb-toc" aria-label="In dit artikel"><b>In dit artikel</b><ul>{toc_html}</ul></nav>
    <div class="kb-scan"><b>Benieuwd wat dit voor jouw bedrijf betekent?</b><p>Plan een gratis scan van 30 minuten. Je krijgt je top 3 automatiseringen, vrijblijvend.</p><a class="btn sage" href="{p}contact.html">Plan je gratis scan <span class="ar">→</span></a></div>
  </aside>
</div></section>
{f'<section class="pg alt"><div class="wrap"><div class="shead"><div><span class="eyebrow">Verder lezen</span><h2>Meer uit de kennisbank.</h2></div></div><div class="kb-cards">{rel}</div></div></section>' if rel else ''}
<section class="cband"><svg class="ghost" aria-hidden="true"><use href="#mk"/></svg><div class="wrap"><h2>Welke taak wil jij<br><span>nooit meer doen?</span></h2><div style="display:grid;gap:18px"><p class="lead">Ontdek het in een gratis scan van 30 minuten.</p><a class="btn sage" href="{p}contact.html" style="justify-self:start">Plan je gratis scan <span class="ar">→</span></a></div></div></section>
</main>
{relatief(fab, p)}
{relatief(footer, p)}
<script src="{p}assets/site.js" defer></script>
</body>
</html>
'''
    return pagina


def bouw_overzicht(lijst, svg, header, fab, footer):
    p = '../'
    cats = []
    for a in lijst:
        if a['categorie'] not in cats:
            cats.append(a['categorie'])
    chips = '<button type="button" class="on" data-f="">Alles</button>' + ''.join(
        f'<button type="button" data-f="{esc(slugify(c))}">{esc(c)}</button>' for c in cats)
    kaarten = ''.join(kaart(a, '') for a in lijst) or '<p>Binnenkort verschijnen hier de eerste artikelen.</p>'
    url = f'{SITE}/kennisbank/'
    lds = '\n'.join([
        ld({'@context': 'https://schema.org', '@type': 'Blog', 'name': 'NIMBR Kennisbank', 'url': url, 'inLanguage': 'nl-NL',
            'publisher': {'@id': f'{SITE}/#org'},
            'blogPost': [{'@type': 'BlogPosting', 'headline': a['titel'], 'url': f'{SITE}/kennisbank/{a["slug"]}.html', 'datePublished': a['datum']} for a in lijst[:20]]}),
        ld({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': f'{SITE}/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Kennisbank', 'item': url}]}),
    ])
    pagina = kop('Kennisbank: automatisering voor het MKB, in gewone taal | NIMBR',
                 'Praktische artikelen over automatisering voor het MKB: wat het kost, welke taken je kunt automatiseren, welke tools passen en hoe je veilig met AI werkt.',
                 url, p, lds)
    pagina += f'''<body data-page="kennisbank">
{svg}
{relatief(header, p)}
<main id="inhoud">
<section class="phero"><div class="wrap">
  <div class="pcopy"><span class="eyebrow">Kennisbank</span><h1>Automatisering,<br><span>in gewone taal.</span></h1><p class="lead">Praktische antwoorden op de vragen die ondernemers ons het vaakst stellen. Over kosten, aanpak, tools en AI. Elke twee weken een nieuw artikel.</p></div>
  <img fetchpriority="high" decoding="async" class="nb" src="{p}assets/img/nimbr-idea.webp" alt="Nimbr met een idee">
</div></section>
<section class="pg"><div class="wrap">
  <div class="kb-filter" role="group" aria-label="Filter op onderwerp">{chips}</div>
  <div class="kb-cards" id="kb-lijst">{kaarten}</div>
</div></section>
<section class="cband"><svg class="ghost" aria-hidden="true"><use href="#mk"/></svg><div class="wrap"><h2>Liever direct<br><span>persoonlijk advies?</span></h2><div style="display:grid;gap:18px"><p class="lead">In een gratis scan van 30 minuten kijken we samen naar jouw processen.</p><a class="btn sage" href="{p}contact.html" style="justify-self:start">Plan je gratis scan <span class="ar">→</span></a></div></div></section>
</main>
{relatief(fab, p)}
{relatief(footer, p)}
<script src="{p}assets/site.js" defer></script>
<script>(function(){{var f=document.querySelector('.kb-filter');if(!f)return;f.addEventListener('click',function(e){{var b=e.target.closest('button');if(!b)return;f.querySelectorAll('button').forEach(function(x){{x.classList.toggle('on',x===b)}});var c=b.dataset.f;document.querySelectorAll('#kb-lijst .kb-card').forEach(function(k){{k.hidden=!!c&&k.dataset.cat!==c}})}})}})();</script>
</body>
</html>
'''
    return pagina


def werk_homepage_bij(lijst):
    f = ROOT / 'index.html'
    s = f.read_text(encoding='utf-8')
    a, b = '<!-- KB:START -->', '<!-- KB:END -->'
    if a not in s:
        return
    if lijst:
        blok = (f'{a}<section class="pg kb-home"><div class="wrap"><div class="shead rv"><div><span class="eyebrow">Kennisbank</span>'
                f'<h2>Uit de kennisbank.</h2></div><p class="lead" style="max-width:38ch">Praktische antwoorden op vragen van ondernemers. '
                f'<a class="link" href="kennisbank/">Alle artikelen <span>→</span></a></p></div>'
                f'<div class="kb-cards">{"".join(kaart(x, "kennisbank/") for x in lijst[:3])}</div></div></section>{b}')
    else:
        blok = a + b
    s = s[:s.index(a)] + blok + s[s.index(b) + len(b):]
    f.write_text(s, encoding='utf-8')


def werk_sitemap_bij(lijst):
    f = ROOT / 'sitemap.xml'
    s = f.read_text(encoding='utf-8')
    s = re.sub(r'<url><loc>https://www\.nimbr\.nl/kennisbank/[^<]*</loc>(?:<lastmod>[^<]*</lastmod>)?</url>', '', s)
    if lijst:
        nieuw = f'<url><loc>{SITE}/kennisbank/</loc><lastmod>{lijst[0]["datum"]}</lastmod></url>' + ''.join(
            f'<url><loc>{SITE}/kennisbank/{a["slug"]}.html</loc><lastmod>{a.get("bijgewerkt", a["datum"])}</lastmod></url>' for a in lijst)
        s = s.replace('</urlset>', nieuw + '</urlset>')
    f.write_text(s, encoding='utf-8')


def main():
    nu = vandaag()
    alle = lees_artikelen()
    live = [a for a in alle if a['datum_d'] <= nu]
    lijst = sorted(live, key=lambda a: a['datum_d'], reverse=True)  # nieuwste eerst
    gepubliceerd = {a['slug']: a for a in live}
    svg, header, fab, footer = site_onderdelen()
    OUT.mkdir(exist_ok=True)
    verwacht = {'index.html'} | {f'{a["slug"]}.html' for a in live}
    for f in OUT.glob('*.html'):
        if f.name not in verwacht:
            f.unlink()  # artikel verwijderd of datum naar later verschoven
    for a in live:
        (OUT / f'{a["slug"]}.html').write_text(bouw_artikel(a, gepubliceerd, svg, header, fab, footer), encoding='utf-8')
    (OUT / 'index.html').write_text(bouw_overzicht(lijst, svg, header, fab, footer), encoding='utf-8')
    werk_homepage_bij(lijst)
    werk_sitemap_bij(lijst)
    gepland = [a for a in alle if a['datum_d'] > nu]
    print(f'Datum: {nu}. Online: {len(live)} artikelen. Gepland: {len(gepland)}.')
    if gepland:
        print(f'Volgende: {gepland[0]["datum"]} – {gepland[0]["titel"]}')


if __name__ == '__main__':
    main()

/* NIMBR website – gedeeld script voor alle pagina's */

// ===== INSTELLINGEN: vul hier de webhook-adressen van jullie n8n-flows in =====
const CONFIG = {
  leadWebhook: 'https://n8n.nimbr.nl/webhook/nimbr-aanvraag', // bijv. 'https://n8n.nimbr.nl/webhook/nimbr-aanvraag'  (ontvangt elke aanvraag)
  aiWebhook: '',   // bijv. 'https://n8n.nimbr.nl/webhook/nimbr-voorstel'  (geeft het voorstel van Nimbr terug)
  leadmagnetWebhook: 'https://n8n.nimbr.nl/webhook/nimbr-checklist' // bijv. 'https://n8n.nimbr.nl/webhook/nimbr-checklist'  (ontvangt elke checklist-aanvraag)
};

document.documentElement.classList.add('js');
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const LOADED_AT = Date.now();

async function post(url, data, ms = 15000) {
  if (!url) throw new Error('geen webhook');
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data), signal:c.signal});
    if (!r.ok) throw new Error('status ' + r.status);
    const tx = await r.text(); try { return JSON.parse(tx); } catch (e) { return {}; }
  } finally { clearTimeout(t); }
}

// ----- spambescherming -----
// 1) onzichtbaar veld dat alleen bots invullen, 2) te snel na laden = bot, 3) max 3 aanvragen per sessie
function looksLikeBot(hpValue) {
  if (hpValue) return true;
  if (Date.now() - LOADED_AT < 4000) return true;
  return false;
}
function underLimit() {
  try { const n = +(sessionStorage.getItem('nimbr-sent') || 0); return n < 3; } catch (e) { return true; }
}
function countSent() {
  try { sessionStorage.setItem('nimbr-sent', String(+(sessionStorage.getItem('nimbr-sent') || 0) + 1)); } catch (e) {}
}

// ----- laadanimatie (alleen homepage, één keer per bezoek) -----
(function () {
  const sp = $('splash'); if (!sp) return;
  let seen = false; try { seen = sessionStorage.getItem('nimbr-intro') === '1'; sessionStorage.setItem('nimbr-intro', '1'); } catch (e) {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { sp.remove(); return; }
  sp.classList.add('play'); setTimeout(() => sp.classList.add('out'), 2900); setTimeout(() => sp.remove(), 3700);
})();

// ----- header en mobiel menu -----
const hd = document.querySelector('header'), bg = $('burger');
addEventListener('scroll', () => hd.classList.toggle('scrolled', scrollY > 8), {passive:true});
if (bg) bg.addEventListener('click', () => { const o = hd.classList.toggle('open'); bg.setAttribute('aria-expanded', o); bg.textContent = o ? 'Sluit' : 'Menu'; });
(function () { const p = document.body.dataset.page; document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === p) { a.classList.add('on'); a.setAttribute('aria-current', 'page'); } }); })();

// ----- manifest: woorden lichten op tijdens scrollen -----
(function () {
  const m = $('mani'); if (!m) return;
  m.innerHTML = m.textContent.trim().split(/\s+/).map(w => '<span class="w' + (/^(makkelijker|wordt\.)$/.test(w) ? ' hl' : '') + '">' + w + '</span>').join(' ');
  const words = [...m.querySelectorAll('.w')];
  function lit() { const r = m.getBoundingClientRect(), vh = innerHeight; const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35))); const n = Math.round(p * words.length); words.forEach((w, i) => w.classList.toggle('lit', i < n)); }
  addEventListener('scroll', lit, {passive:true}); lit();
})();

// ----- calculator -----
(function () {
  const rp = $('r-p'), rh = $('r-h'), rt = $('r-t'); if (!rp) return;
  const nf = new Intl.NumberFormat('nl-NL');
  const fill = r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
  let shown = 68040;
  function calc() {
    [rp, rh, rt].forEach(fill);
    $('o-p').textContent = rp.value; $('o-h').textContent = rh.value; $('o-t').textContent = '€ ' + rt.value;
    const hrs = Math.round(rp.value * rh.value * .7 * 45), eur = hrs * rt.value;
    $('r-hrs').textContent = nf.format(hrs);
    $('r-fte').textContent = (hrs / 1800).toLocaleString('nl-NL', {maximumFractionDigits:1});
    const from = shown, t0 = performance.now(); shown = eur;
    (function a(t) { const k = Math.min(1, (t - t0) / 400), v = Math.round(from + (eur - from) * (1 - Math.pow(1 - k, 3))); $('r-eur').textContent = '€ ' + nf.format(v); if (k < 1) requestAnimationFrame(a); })(t0);
  }
  [rp, rh, rt].forEach(r => r.addEventListener('input', calc)); calc();
})();

// ----- elementen rustig in beeld laten komen -----
(function () {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv').forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); } });
  // vangnet: wat boven of in beeld staat, altijd tonen
  addEventListener('scroll', () => document.querySelectorAll('.rv.pre').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * .92) { el.classList.remove('pre'); io.unobserve(el); } }), {passive:true});
})();

// ----- zwevende knop: op de homepage pas na de hero -----
(function () {
  const fab = $('fab'); if (!fab) return;
  const isHome = document.body.dataset.page === 'home';
  const f = () => fab.classList.toggle('away', isHome && scrollY < 520);
  addEventListener('scroll', f, {passive:true}); f();
})();

// ----- contactformulier -----
(function () {
  const cf = $('cform'); if (!cf) return;
  cf.addEventListener('submit', e => {
    e.preventDefault(); const er = $('ferr');
    const miss = [['f-naam','je naam'],['f-bedrijf','je bedrijfsnaam'],['f-mail','een geldig e-mailadres']].filter(([id]) => !$(id).checkValidity() || !$(id).value.trim());
    if (miss.length) { er.textContent = 'Vul nog ' + miss.map(m => m[1]).join(', ') + ' in.'; $(miss[0][0]).focus(); return; }
    if (looksLikeBot($('f-website').value)) { cf.classList.add('sent'); return; } // stil negeren
    if (!underLimit()) { er.textContent = 'Je hebt al een paar aanvragen verstuurd. We nemen snel contact op, of mail ons op nimbrautomation@gmail.com.'; return; }
    er.textContent = ''; const btn = cf.querySelector('button[type=submit]'); btn.disabled = true;
    const v = id => $(id).value.trim();
    const data = {bron:'formulier', datum:new Date().toISOString(), naam:v('f-naam'), bedrijf:v('f-bedrijf'), email:v('f-mail'), telefoon:v('f-tel'), medewerkers:v('f-size'), budget:v('f-budget'), taak:v('f-taak'), systemen:[...cf.querySelectorAll('input[name=sys]:checked')].map(i => i.value).join(', '), pagina:location.pathname};
    post(CONFIG.leadWebhook, data).then(() => { countSent(); cf.classList.add('sent'); }).catch(() => { er.textContent = 'Versturen lukte niet. Mail ons op nimbrautomation@gmail.com of probeer het later opnieuw.'; btn.disabled = false; });
  });
})();

// ----- chat met Nimbr -----
(function () {
  const $m = $('msgs'); if (!$m) return;
  const $q = $('quick'), $f = $('composer'), $in = $('c-in');
  let S, log, handler = null;
  const HOURS = {'Minder dan 1 uur':0.5,'1 tot 3 uur':2,'3 tot 8 uur':5,'Meer dan 8 uur':10};
  const pose = p => document.querySelectorAll('#pose .nb').forEach(i => i.style.opacity = i.dataset.p === p ? 1 : 0);
  const progress = n => document.querySelectorAll('.chat-steps i').forEach((i, k) => i.classList.toggle('on', k < n));
  function add(who, html, cls = '') { const d = document.createElement('div'); d.className = 'm ' + who + ' ' + cls; d.innerHTML = html; $m.appendChild(d); $m.scrollTop = $m.scrollHeight; return d; }
  function me(t) { add('me', esc(t)); log.push({van:'Bezoeker', tekst:t}); }
  async function bot(t, delay = 650) { const ty = add('bot', '<i></i><i></i><i></i>', 'typing'); await wait(delay); ty.remove(); add('bot', t); log.push({van:'Nimbr', tekst:t.replace(/<[^>]+>/g, '')}); }
  function chips(list) { $q.innerHTML = ''; list.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.onclick = () => answer(c); $q.appendChild(b); }); }
  function ask(placeholder, list = []) { chips(list); $in.placeholder = placeholder || 'Typ je antwoord…'; $in.disabled = false; $in.focus({preventScroll:true}); }
  function answer(t) { t = String(t).trim(); if (!t || !handler) return; $q.innerHTML = ''; $in.value = ''; const h = handler; handler = null; me(t); h(t); }
  $f.addEventListener('submit', e => { e.preventDefault(); answer($in.value); });

  async function start() {
    S = {}; log = []; $m.innerHTML = ''; $q.innerHTML = ''; pose('wave'); progress(1);
    await bot('Hoi! Ik ben Nimbr, je virtuele collega.', 300);
    await bot('Welke taak wil jij nooit meer doen?');
    handler = t => { S.taak = t; step2(); }; ask('Bijvoorbeeld: huurfacturen versturen', ['Facturen maken','Offertes opstellen','Mails sorteren','Rapportages bijwerken','Planning maken']);
  }
  async function step2() { pose('think'); await bot('Duidelijk. Hoe gaat dat nu, in het kort?'); handler = t => { S.nu = t; step3(); }; ask('Bijvoorbeeld: ik zet alles over vanuit Excel', ['Handmatig overtypen','Met Excel-lijstjes','Via mail heen en weer']); }
  async function step3() { await bot('Hoeveel tijd kost dit jullie ongeveer per week?'); handler = t => { S.tijd = t; step4(); }; ask('Of typ een aantal uren', Object.keys(HOURS)); }
  async function step4() { progress(2); await bot('En welke systemen gebruik je hierbij?'); handler = t => { S.systemen = t; stepB(); }; ask('Bijvoorbeeld: Exact Online en Outlook', ['Boekhoudpakket','Excel','Outlook of Gmail','CRM','Weet ik niet']); }
  async function stepB() { await bot('Wil je klein beginnen, of meteen meerdere processen aanpakken? We stemmen het af op je budget.'); handler = t => { S.aanpak = t; step5(); }; ask('', ['Klein beginnen','Meerdere processen','Weet ik nog niet']); }
  const hoursOf = t => { if (HOURS[t] != null) return HOURS[t]; const n = parseFloat(String(t).replace(',', '.')); return isFinite(n) && n > 0 ? Math.min(n, 60) : 2; };
  const fallbackPlan = () => ({intro:'Dit kan ik overnemen.', stappen:['Zodra er iets binnenkomt of klaarstaat, pak ik het automatisch op.', 'Ik verwerk de gegevens in ' + (/weet ik niet/i.test(S.systemen) ? 'jullie systemen' : S.systemen) + ', zonder overtypen.', 'Jij krijgt alleen nog een seintje als er iets te beslissen valt.'], let_op:'Tim en Stephan kijken samen met je naar de details.'});
  async function makePlan() {
    try { const v = await post(CONFIG.aiWebhook, {taak:S.taak, nu:S.nu, tijd:S.tijd, systemen:S.systemen});
      if (v && v.intro && Array.isArray(v.stappen) && v.stappen.length) return {intro:String(v.intro), stappen:v.stappen.slice(0, 3).map(String), let_op:String(v.let_op || '')}; } catch (e) {}
    return fallbackPlan();
  }
  async function step5() {
    const ty = add('bot', '<i></i><i></i><i></i>', 'typing');
    const plan = await makePlan(); await wait(300); ty.remove(); pose('idea'); progress(3);
    const yr = Math.round(hoursOf(S.tijd) * 0.7 * 45); S.winst = yr; S.plan = plan;
    const vast = /huur|vastgoed|huurder|index/i.test(S.taak + ' ' + S.nu) ? '<p class="note">Lijkt op onze vastgoedcase, waar facturatie, betalingscontrole, mailing en indexatie volledig automatisch gaan.</p>' : '';
    add('bot', `<h4>Dit kan ik overnemen</h4><p>${esc(plan.intro)}</p><ol>${plan.stappen.map(s => '<li>' + esc(s) + '</li>').join('')}</ol><div class="win"><span>Geschatte tijdwinst</span><b>±${yr.toLocaleString('nl-NL')} uur per jaar</b></div>${plan.let_op ? '<p class="note">' + esc(plan.let_op) + '</p>' : ''}${vast}<p class="note">Schatting: 70% van ${esc(S.tijd)} per week, 45 werkweken.</p>`, 'card');
    log.push({van:'Nimbr', tekst:'Voorstel: ' + plan.intro + ' ' + plan.stappen.join(' ') + ' Tijdwinst ±' + yr + ' uur per jaar.'});
    await bot('Zal ik dit doorzetten naar Tim en Stephan? Dan krijg je binnen één werkdag een voorstel met vaste prijs, afgestemd op je budget.', 900);
    handler = t => { if (/^nee|later|niet/i.test(t)) { bot('Helemaal goed. Wil je eerst zelf ontdekken waar de tijd zit? Download dan onze gratis <a class="link" href="index.html#checklist">checklist met 10 taken</a>. Of kijk alvast hoe we <a class="link" href="samenwerken.html">samenwerken</a>.'); ask('', ['Toch doorzetten']); handler = () => step6(); } else step6(); };
    ask('', ['Ja, graag','Nee, nog niet']);
  }
  async function step6() { progress(4); await bot('Top! Wat is je naam?'); handler = t => { S.naam = t; step7(); }; ask('Je naam'); }
  async function step7() { await bot(`Leuk je te spreken, ${esc(S.naam.split(' ')[0])}. Bij welk bedrijf werk je?`); handler = t => { S.bedrijf = t; step8(); }; ask('Bedrijfsnaam'); }
  async function step8(again) { await bot(again ? 'Dat lijkt geen geldig e-mailadres. Probeer het nog eens?' : 'Op welk e-mailadres kunnen we je bereiken?'); handler = t => { if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return step8(true); S.email = t; step9(); }; ask('naam@bedrijf.nl'); }
  async function step9() { await bot('En je telefoonnummer? Dat mag je ook overslaan.'); handler = t => { S.telefoon = /overslaan/i.test(t) ? '' : t; finish(); }; ask('06…', ['Overslaan']); }
  async function save() {
    if (looksLikeBot($('c-website').value)) return true; // bots stil negeren
    if (!underLimit()) return false;
    const item = {bron:'chat', datum:new Date().toISOString(), taak:S.taak, nu:S.nu, tijd:S.tijd, systemen:S.systemen, aanpak:S.aanpak || '', winstUurPerJaar:S.winst, voorstel:S.plan.intro + ' ' + S.plan.stappen.join(' '), naam:S.naam, bedrijf:S.bedrijf, email:S.email, telefoon:S.telefoon || '', gesprek:log.slice(-40)};
    try { await post(CONFIG.leadWebhook, item); countSent(); return true; } catch (e) { return false; }
  }
  async function finish() {
    $in.disabled = true; $in.placeholder = '';
    const ty = add('bot', '<i></i><i></i><i></i>', 'typing'); const ok = await save(); await wait(500); ty.remove(); pose('cheer');
    add('bot', `<h4>Doorgezet naar Tim en Stephan</h4><dl><dt>Taak</dt><dd>${esc(S.taak)}</dd><dt>Tijd nu</dt><dd>${esc(S.tijd)} per week</dd><dt>Aanpak</dt><dd>${esc(S.aanpak || '')}</dd><dt>Winst</dt><dd>±${S.winst.toLocaleString('nl-NL')} uur per jaar</dd><dt>Contact</dt><dd>${esc(S.naam)}, ${esc(S.bedrijf)}<br>${esc(S.email)}${S.telefoon ? ' · ' + esc(S.telefoon) : ''}</dd></dl>${ok ? '' : '<p class="note">Let op: het doorsturen lukte niet. Mail ons gerust op nimbrautomation@gmail.com, dan pakken we het direct op.</p>'}`, 'card');
    await bot('Klaar! Je hoort binnen één werkdag van ons. Ik ga alvast nadenken over je proces.');
    chips(['Nieuwe vraag stellen']); handler = () => start();
  }
  $('c-reset').onclick = () => { handler = null; start(); };
  start();
})();

// ----- animaties op Oplossingen: alleen afspelen in beeld -----
(function(){const sc=document.querySelectorAll('.scene');if(!sc.length)return;const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('on',e.isIntersecting)),{threshold:.35});sc.forEach(s=>io.observe(s));})();

// ----- taken rond Nimbr: pauzeren buiten beeld -----
(function(){const m=document.querySelector('.meet-art');if(!m||!('IntersectionObserver' in window))return;new IntersectionObserver(es=>es.forEach(e=>m.classList.toggle('off',!e.isIntersecting)),{threshold:.15}).observe(m)})();


// ----- leadmagneet: checklist -----
(function(){
  const LM_T0=Date.now();
  const sent=()=>{try{return localStorage.getItem('nimbr-lm')==='1'}catch(e){return false}};
  const markSent=()=>{try{localStorage.setItem('nimbr-lm','1')}catch(e){}};
  async function deliver(d){
    if(typeof CONFIG!=='undefined'&&CONFIG.leadmagnetWebhook){await post(CONFIG.leadmagnetWebhook,d);return}
    if(typeof dbP!=='undefined'){const db=await dbP,u=await userP;if(!db||!u)throw new Error('geen opslag');
      const id=await u.id(),ref=db.collection('leads').doc(id),snap=await ref.get(),prev=snap.exists?(snap.data().aanvragen||[]):[];
      await ref.set({aanvragen:[...prev,{id:Date.now().toString(36),datum:d.datum,status:'Nieuw',bron:'checklist',taak:'Checklist gedownload',nu:d.branche||'-',tijd:'-',systemen:'-',winstUurPerJaar:0,voorstel:d.tips?'Wil tips ontvangen':'Alleen checklist',naam:d.voornaam,bedrijf:'',email:d.email,telefoon:'',gesprek:[]}].slice(-20)});return}
    throw new Error('geen webhook');
  }
  document.querySelectorAll('.lmf').forEach(f=>f.addEventListener('submit',e=>{
    e.preventDefault();const q=n=>f.querySelector('[name='+n+']'),er=f.querySelector('.lm-err');
    const naam=q('voornaam').value.trim(),mail=q('email').value.trim();
    if(!naam||!mail||!q('email').checkValidity()){er.textContent=!naam?'Vul je voornaam in.':'Vul een geldig e-mailadres in.';(!naam?q('voornaam'):q('email')).focus();return}
    er.textContent='';
    if(q('website').value||Date.now()-LM_T0<3000){f.classList.add('sent');return}
    const d={bron:'checklist',datum:new Date().toISOString(),voornaam:naam,email:mail,branche:q('branche').value,tips:q('tips').checked,pagina:location.pathname+location.hash};
    const btn=f.querySelector('button[type=submit]');btn.disabled=true;
    deliver(d).catch(()=>{}).finally(()=>{f.classList.add('sent');markSent();const b=document.getElementById('lmbar');if(b)b.hidden=true});
  }));
  const bar=document.getElementById('lmbar');if(!bar)return;
  let closed=false;try{closed=sessionStorage.getItem('nimbr-lmbar')==='1'}catch(e){}
  bar.querySelector('.lm-x').onclick=()=>{bar.hidden=true;closed=true;try{sessionStorage.setItem('nimbr-lmbar','1')}catch(e){}};
  bar.querySelector('a').addEventListener('click',()=>{bar.hidden=true});
  function chk(){const home=document.querySelector('[data-view=home]');const onHome=home?!home.hidden:document.body.dataset.page==='home';
    const sec=document.getElementById('checklist');const r=sec?sec.getBoundingClientRect():null;const inView=r&&r.top<innerHeight&&r.bottom>0;
    const deep=scrollY>(document.documentElement.scrollHeight-innerHeight)*.55;
    const show=onHome&&deep&&!inView&&!closed&&!sent();if(bar.hidden===show)bar.hidden=!show}
  addEventListener('scroll',chk,{passive:true});addEventListener('hashchange',()=>setTimeout(chk,80));chk();
})();

// ----- levende vastgoedapp: pauzeren buiten beeld -----
(function(){const a=document.querySelector('.app-live');if(!a||!('IntersectionObserver' in window))return;new IntersectionObserver(es=>es.forEach(e=>a.classList.toggle('off',!e.isIntersecting)),{threshold:.2}).observe(a)})();
(function(){if(!('IntersectionObserver' in window))return;document.querySelectorAll('.uc-flowbox,.uc-result').forEach(a=>new IntersectionObserver(es=>es.forEach(e=>a.classList.toggle('off',!e.isIntersecting)),{threshold:.2}).observe(a))})();

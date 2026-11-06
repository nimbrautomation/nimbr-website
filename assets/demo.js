/* NIMBR demo – toegang en demo-omgeving
   Modus:
   - 'code'   : statische site zonder server. Aanvraag gaat naar de lead-webhook (als ingevuld), toegang met toegangscode.
   - 'claude' : Claude-versie. Aanvraag wordt opgeslagen in de database van het artifact, toegang met toegangscode.
   - 'server' : met de NIMBR-server. Echte bevestigingsmail, sessiecookie en afgeschermde demobestanden.
   LET OP: in de modi 'code' en 'claude' is de toegangscode geen echte beveiliging. Gebruik de servermodus voor echte afscherming. */
(function(){
'use strict';
const MODE = window.NIMBR_DEMO_MODE || 'code';
const APPS_SRC = window.NIMBR_DEMO_APPS || 'assets/demo-apps.js';
const CODE_HASH = '1j95usc';            // hash van de toegangscode (DEMO123). Wijzig met: hash('nimbr:' + NIEUWECODE)
const ACCESS_DAYS = 30;                 // zo lang blijft toegang geldig in de modi 'code' en 'claude'
const KEY = 'nimbr-demo-toegang';

const root = document.getElementById('demos'); if (!root) return;
const $ = id => document.getElementById(id);
const modal = $('dm-modal'), stage = $('demo-omgeving');
const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const loadedAt = Date.now();
let want = 'vastgoed', access = null, appsReady = null, lastReq = null, viewed = new Set();

function hash(s){let x=0x811c9dc5;for(const c of s){x^=c.charCodeAt(0);x=Math.imul(x,0x01000193)>>>0}return x.toString(36)}
const store = {
  get(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}},
  set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}},
  del(){try{localStorage.removeItem(KEY)}catch(e){}}
};
const validEmail = e => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i.test(e) && e.length <= 254;

// ---------- modal ----------
function step(n){modal.querySelectorAll('.dm-step').forEach(s=>s.hidden=s.dataset.step!==String(n));const f=modal.querySelector(`.dm-step[data-step="${n}"] input:not([type=checkbox]):not([tabindex="-1"])`);setTimeout(()=>f&&f.focus(),60)}
function openModal(n){step(n||1);if(!modal.open){if(modal.showModal)modal.showModal();else modal.setAttribute('open','')}}
function closeModal(){if(modal.open){modal.close?modal.close():modal.removeAttribute('open')}}
modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]'))closeModal();const g=e.target.closest('[data-goto]');if(g)step(g.dataset.goto)});

// ---------- aanvraag ----------
async function postJSON(url,data){const r=await fetch(url,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});let j={};try{j=await r.json()}catch(e){}return{ok:r.ok,status:r.status,data:j}}

async function saveLeadClaude(item){
  try{const db=await (window.claude&&window.claude.use?window.claude.use('db'):null),user=await (window.claude&&window.claude.use?window.claude.use('user'):null);if(!db||!user)return false;
    const id=await user.id();const ref=db.collection('leads').doc(id);const snap=await ref.get();const prev=snap.exists?(snap.data().aanvragen||[]):[];
    await ref.set({aanvragen:[...prev,item].slice(-20)});return item.id}catch(e){return false}
}
async function updateLeadClaude(id,fn){
  try{const db=await window.claude.use('db'),user=await window.claude.use('user');const uid=await user.id();const ref=db.collection('leads').doc(uid);const snap=await ref.get();if(!snap.exists)return;
    const arr=(snap.data().aanvragen||[]).map(a=>a.id===id?fn({...a}):a);await ref.set({aanvragen:arr})}catch(e){}
}

$('dm-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const f=e.target,er=$('dm-err'),btn=$('dm-send');er.textContent='';
  const d={email:f.email.value.trim().toLowerCase(),voornaam:f.voornaam.value.trim().slice(0,60),bedrijf:f.bedrijf.value.trim().slice(0,100),marketing:f.marketing.checked,website:f.website.value,demo:want};
  if(!validEmail(d.email)){f.email.setAttribute('aria-invalid','true');er.textContent='Vul een geldig e-mailadres in, bijvoorbeeld naam@bedrijf.nl.';f.email.focus();return}
  f.email.removeAttribute('aria-invalid');
  if(d.website||Date.now()-loadedAt<3000){step(MODE==='server'?'mail':'code');return} // bot: doe alsof
  btn.disabled=true;
  try{
    if(MODE==='server'){
      const r=await postJSON('/api/demo/aanvraag',{...d,ms:Date.now()-loadedAt});
      if(r.status===429){er.textContent='Je hebt al een paar keer een mail aangevraagd. Probeer het over een kwartier opnieuw.';return}
      if(!r.ok){er.textContent=r.data.fout||'Versturen lukte niet. Probeer het later opnieuw of mail nimbrautomation@gmail.com.';return}
      lastReq=d;try{localStorage.setItem('nimbr-demo-wens',d.demo)}catch(x){}$('dm-sent-to').textContent=d.email;step('mail');
    }else{
      const item={id:Date.now().toString(36),bron:'demo',datum:new Date().toISOString(),status:'Nieuw',email:d.email,voornaam:d.voornaam,bedrijf:d.bedrijf,naam:d.voornaam||d.email,marketing:d.marketing,demoGevraagd:d.demo,demos:[],geverifieerd:null,laatsteBezoek:null};
      if(MODE==='claude'){item.ref=await saveLeadClaude(item)}
      else if(typeof CONFIG!=='undefined'&&CONFIG.leadWebhook){fetch(CONFIG.leadWebhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...item,pagina:location.pathname})}).catch(()=>{})}
      lastReq=item;try{localStorage.setItem('nimbr-demo-email',d.email);localStorage.setItem('nimbr-demo-wens',d.demo)}catch(x){}$('dm-thx').textContent=d.voornaam?', '+d.voornaam:'';const ct=$('dm-code-to');if(ct)ct.textContent=d.email;step('code');
    }
  }catch(x){er.textContent='Versturen lukte niet. Controleer je verbinding en probeer het opnieuw.'}
  finally{btn.disabled=false}
});

$('dm-resend').addEventListener('click',async()=>{if(!lastReq)return step(1);const b=$('dm-resend');b.disabled=true;const r=await postJSON('/api/demo/aanvraag',{...lastReq,ms:Date.now()-loadedAt}).catch(()=>({ok:false}));b.textContent=r.ok?'mail opnieuw verstuurd':'versturen lukte niet';setTimeout(()=>{b.disabled=false;b.textContent='stuur de mail opnieuw'},8000)});

$('dm-codeform').addEventListener('submit',e=>{
  e.preventDefault();const c=$('dm-code'),er=$('dm-cerr');const v=c.value.trim().toUpperCase();
  if(hash('nimbr:'+v)!==CODE_HASH){c.setAttribute('aria-invalid','true');er.textContent='Deze code klopt niet. Controleer hem en probeer het opnieuw.';return}
  c.removeAttribute('aria-invalid');er.textContent='';
  const now=Date.now();access={email:lastReq?lastReq.email:'',voornaam:lastReq?lastReq.voornaam:'',ref:lastReq&&lastReq.ref||null,tot:now+ACCESS_DAYS*864e5,sinds:now};
  store.set(access);
  if(MODE==='claude'&&access.ref)updateLeadClaude(access.ref,a=>({...a,geverifieerd:new Date().toISOString(),laatsteBezoek:new Date().toISOString()}));
  closeModal();unlock(true);
});

// ---------- toegang controleren ----------
async function checkAccess(){
  if(MODE==='server'){
    try{const r=await fetch('/api/demo/sessie',{credentials:'same-origin'});if(r.ok){const j=await r.json();return{email:j.email,voornaam:j.voornaam,tot:Date.parse(j.tot)}}}catch(e){}
    return null;
  }
  const a=store.get();if(!a)return null;
  if(!a.tot||a.tot<Date.now())return{verlopen:true};
  return a;
}

function loadApps(){
  if(window.NimbrDemo)return Promise.resolve(true);
  if(appsReady)return appsReady;
  appsReady=new Promise(res=>{const s=document.createElement('script');s.src=APPS_SRC;s.onload=()=>res(!!window.NimbrDemo);s.onerror=()=>res(false);document.head.appendChild(s)});
  return appsReady;
}

let mounted={};
async function show(name,scroll){
  want=name;
  stage.hidden=false;
  stage.querySelectorAll('.dm-switch button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.show===name)));
  stage.querySelectorAll('.dm-appwrap').forEach(w=>w.hidden=w.dataset.app!==name);
  const el=$('dm-app-'+name);
  if(!mounted[name]){
    el.innerHTML='<div class="dm-loading">Demo wordt geladen…</div>';
    const ok=await loadApps();
    if(!ok){
      if(MODE==='server'){el.innerHTML='';stage.hidden=true;access=null;openModal('expired');return}
      el.innerHTML='<div class="dm-loading">De demo kon niet worden geladen. Ververs de pagina.</div>';return;
    }
    window.NimbrDemo.mount(el,name);mounted[name]=true;
  }
  track(name);nudge();
  if(scroll)requestAnimationFrame(()=>{const t=el.querySelector('.ns')||stage;window.scrollTo({top:t.getBoundingClientRect().top+scrollY-(innerWidth<760?72:96),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
}
function track(name){
  if(viewed.has(name))return;viewed.add(name);
  if(MODE==='server'){postJSON('/api/demo/bekeken',{demo:name}).catch(()=>{});return}
  if(MODE==='claude'&&access&&access.ref){updateLeadClaude(access.ref,a=>({...a,demos:[...new Set([...(a.demos||[]),name])],laatsteBezoek:new Date().toISOString()}));return}
  if(typeof CONFIG!=='undefined'&&CONFIG.leadWebhook&&access&&access.email){fetch(CONFIG.leadWebhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bron:'demo-bekeken',email:access.email,demo:name,datum:new Date().toISOString()})}).catch(()=>{})}
}
function nudge(){
  const n=$('dm-nudge');
  if(viewed.has('vastgoed')&&viewed.has('financieel'))n.textContent='Je hebt beide demo\'s gezien: complete software op maat én een digitale collega die zelf zoekt en koppelt. In een gesprek vertalen we dit naar jouw processen.';
  else if(viewed.has('financieel'))n.textContent='Je bekijkt demo B. Probeer ook demo A: een complete vastgoedapplicatie met facturatie, bankcontrole en prognoses.';
  else n.textContent='Je bekijkt demo A. Probeer ook demo B: de digitale collega die facturen terugvindt en koppelt.';
}
function unlock(scroll){
  root.classList.add('dm-unlocked');
  root.querySelectorAll('.dm-open').forEach(b=>{b.lastChild.textContent=b.lastChild.textContent.replace('Start demo','Open demo')});
  const w=$('dm-who-in');
  if(access&&access.email){const d=new Date(access.tot);w.innerHTML=`Toegang voor <b>${esc(access.email)}</b>${isNaN(d)?'':' · geldig tot '+d.toLocaleDateString('nl-NL',{day:'numeric',month:'long'})} · <button type="button" class="dm-linkbtn" id="dm-logout">afmelden</button>`;
    $('dm-logout').onclick=async()=>{if(MODE==='server'){await postJSON('/api/demo/afmelden',{}).catch(()=>{})}store.del();location.reload()}}
  show(want,scroll);
}

root.addEventListener('click',async e=>{
  const b=e.target.closest('.dm-open');if(!b)return;
  want=b.dataset.demo;
  if(access&&!access.verlopen)return show(want,true);
  const a=await checkAccess();
  if(a&&!a.verlopen){access=a;return unlock(true)}
  openModal(a&&a.verlopen?'expired':1);
});
stage.querySelector('.dm-switch').addEventListener('click',e=>{const b=e.target.closest('button[data-show]');if(b)show(b.dataset.show,false)});

// zwevende chatknop verbergen zolang de demo-omgeving in beeld is (valt anders over de ballonnetjes)
if('IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(x=>document.body.classList.toggle('dm-in-stage',x.isIntersecting&&!stage.hidden)),{threshold:.05}).observe(stage);
// voorbeelden op de demokaarten alleen animeren in beeld
if('IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(x=>root.classList.toggle('dm-vis',x.isIntersecting))).observe(root);else root.classList.add('dm-vis');
// hero-animatie pauzeren buiten beeld
const run=document.querySelector('.dm-run');
if(run&&'IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(x=>run.classList.toggle('dm-off',!x.isIntersecting))).observe(run);

// bij laden: bestaande toegang of terugkomst uit de bevestigingslink
(async()=>{
  const q=new URLSearchParams(location.search);
  // link uit de mail: ?code=... opent de demo direct
  const qc=(q.get('code')||'').trim().toUpperCase();
  if(qc&&MODE!=='server'){history.replaceState(null,'',location.pathname);if(hash('nimbr:'+qc)===CODE_HASH){let em='';try{em=localStorage.getItem('nimbr-demo-email')||'';const w=localStorage.getItem('nimbr-demo-wens');if(w==='vastgoed'||w==='financieel')want=w}catch(x){}const now=Date.now();access={email:em,voornaam:'',ref:null,tot:now+ACCESS_DAYS*864e5,sinds:now};store.set(access);unlock(true);return}}
  const a=await checkAccess();
  if(a&&!a.verlopen){access=a;if(q.get('bevestigd')==='1'){history.replaceState(null,'',location.pathname+'#demo-omgeving');try{const w=localStorage.getItem('nimbr-demo-wens');if(w==='vastgoed'||w==='financieel')want=w}catch(x){}unlock(true)}else{root.classList.add('dm-unlocked');root.querySelectorAll('.dm-open').forEach(b=>{b.lastChild.textContent=b.lastChild.textContent.replace('Start demo','Open demo')})}}
  else if(q.get('link')==='ongeldig'){history.replaceState(null,'',location.pathname);openModal(1);$('dm-err').textContent='Deze bevestigingslink is verlopen of al gebruikt. Vraag hieronder een nieuwe aan.'}
  else if(q.get('verlopen')==='1'||(a&&a.verlopen)){if(q.get('verlopen')==='1'){history.replaceState(null,'',location.pathname);openModal('expired')}}
})();
})();

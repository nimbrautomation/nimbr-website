/* NIMBR interactieve demo's: A Vastgoedbeheer en B Financiële automatisering.
   Alles draait in de browser met fictieve gegevens. Er worden geen echte systemen aangesproken. */
(function(){
'use strict';
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur=(n,d=0)=>'€ '+Number(n).toLocaleString('nl-NL',{minimumFractionDigits:d,maximumFractionDigits:d});
const eur2=n=>eur(n,2);
const MN=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const MS=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
const today=new Date();today.setHours(12,0,0,0);
const addM=(d,m)=>{const x=new Date(d);x.setDate(1);x.setMonth(x.getMonth()+m);return x};
const fmtD=d=>d.toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric'});
const fmtShort=d=>d.toLocaleDateString('nl-NL',{day:'2-digit',month:'2-digit',year:'numeric'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const W=ms=>wait(reduce?Math.min(ms,120):ms);
const nowTime=()=>new Date().toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});
const I={ // iconen
  dash:'<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z"/>',
  home:'<path d="M3 11 12 4l9 7M5 10v10h14V10"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2"/>',
  doc:'<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
  inv:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
  bank:'<path d="M3 9 12 4l9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  chart:'<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3"/>',
  tx:'<path d="M4 7h13l-3-3M20 17H7l3 3"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V4z"/>',
  reset:'<path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5"/>',
  play:'<path d="M8 5v14l11-7z"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  split:'<path d="M12 3l9 9-9 9-9-9z"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5-2.7L3.6 14a1.5 1.5 0 0 1 2.5-1.7L8 15"/>',
  flow:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/>'
};
const ic=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

function toast(app,msg){
  const t=app.querySelector('.na-toast');t.textContent=msg;t.classList.remove('on');void t.offsetWidth;t.classList.add('on');
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),3200);
}
function inMain(main,el,block){if(!main||!el)return;const r=el.getBoundingClientRect(),m=main.getBoundingClientRect();
  if(main.scrollHeight<=main.clientHeight+2)return;
  const z=(m.height/main.offsetHeight)||1;const visTop=r.top>=m.top+8,visBot=r.bottom<=m.bottom-8;if(visTop&&visBot&&block!=='top')return;
  let d=(r.top-m.top)/z-(block==='center'?(main.clientHeight-r.height/z)/2:16);main.scrollTo({top:main.scrollTop+d,behavior:reduce?'auto':'smooth'})}
function setNav(app,v){app.querySelectorAll('.na-side button').forEach(b=>{if(b.dataset.v===v)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
function shell(title,sub,nav,badge){
  return `<div class="na-app">
  <div class="na-top"><div class="na-brand"><span class="na-mk"><svg><use href="#mk"/></svg></span><div><b>${title}</b><small>${sub}</small></div></div><span class="na-sim">${badge}</span></div>
  <nav class="na-side" aria-label="Menu van de demo">${nav.map((n,i)=>`<button type="button" data-v="${n[0]}"${i?'':' aria-current="page"'}>${ic(n[2])}<span>${n[1]}</span></button>`).join('')}</nav>
  <div class="na-main" tabindex="-1"></div>
  <div class="na-toast" role="status" aria-live="polite"></div>
</div>`;
}
function setBusy(app,on){app.classList.toggle('na-busy',on);app.querySelectorAll('.na-side button,.na-reset').forEach(b=>b.disabled=on)}

/* =====================================================================
   DEMO A · VASTGOEDBEHEER
   ===================================================================== */
function vastgoed(el,hooks={}){
  const emit=n=>{if(hooks.emit)hooks.emit(n)};
  const m0=addM(today,0);
  const ym=d=>d.getFullYear()*100+d.getMonth()+1;
  const S={
    panden:[
      {id:'P1',adres:'Lindenhof 12',plaats:'Utrecht',type:'Kantoorruimte',m2:240},
      {id:'P2',adres:'Havenkade 3',plaats:'Rotterdam',type:'Bedrijfsunit',m2:410},
      {id:'P3',adres:'Marktstraat 8A',plaats:'Eindhoven',type:'Winkelruimte',m2:120},
      {id:'P4',adres:'Molenweg 21',plaats:'Amersfoort',type:'Kantoorruimte',m2:180}
    ],
    huurders:[
      {id:'H1',naam:'Studio Veldkamp',contact:'Lotte Veldkamp',email:'lotte@studioveldkamp.voorbeeld'},
      {id:'H2',naam:'Van Dijk Logistiek',contact:'Ruben van Dijk',email:'administratie@vandijk.voorbeeld'},
      {id:'H3',naam:'Bloem & Zo',contact:'Sanne Bloem',email:'sanne@bloemenzo.voorbeeld'}
    ],
    contracten:[
      {id:'C-2023-014',pand:'P1',huurder:'H1',huur:2450,start:addM(m0,-26),jaren:5,opzeg:6,index:3.1},
      {id:'C-2024-007',pand:'P2',huurder:'H2',huur:3120,start:addM(m0,-14),jaren:3,opzeg:3,index:2.8},
      {id:'C-2021-031',pand:'P3',huurder:'H3',huur:1680,start:addM(m0,-50),jaren:5,opzeg:3,index:3.1}
    ],
    facturen:[],
    audit:[],
    view:'dash',sel:null
  };
  const mp=addM(m0,-1),pref=ym(mp);
  // vorige maand: alles betaald. Deze maand handelt Nimbr af in stap 1 van de demo.
  S.facturen=[
    {nr:`F${pref}-01`,contract:'C-2023-014',bedrag:2450,status:'betaald',maand:mp,verstuurd:'1 '+MS[mp.getMonth()],betaald:'4 '+MS[mp.getMonth()]},
    {nr:`F${pref}-02`,contract:'C-2024-007',bedrag:3120,status:'betaald',maand:mp,verstuurd:'1 '+MS[mp.getMonth()],betaald:'3 '+MS[mp.getMonth()]},
    {nr:`F${pref}-03`,contract:'C-2021-031',bedrag:1680,status:'betaald',maand:mp,verstuurd:'1 '+MS[mp.getMonth()],betaald:'9 '+MS[mp.getMonth()]}
  ];
  const log=(t,type)=>S.audit.unshift({t,type:type||'info',tijd:nowTime()});
  log('Alle huur van '+MN[mp.getMonth()]+' ontvangen','pay');

  const P=id=>S.panden.find(p=>p.id===id), H=id=>S.huurders.find(h=>h.id===id), C=id=>S.contracten.find(c=>c.id===id);
  const cOfPand=pid=>S.contracten.find(c=>c.pand===pid);
  const endOf=c=>addM(c.start,c.jaren*12);
  const invOf=c=>S.facturen.filter(f=>f.contract===c.id).slice(-1)[0];
  const stLabel={concept:['Concept','idle'],verstuurd:['Verstuurd','sent'],betaald:['Betaald','ok'],herinnering:['Herinnering','wait']};
  const pill=s=>`<i class="pill ${stLabel[s][1]}">${stLabel[s][0]}</i>`;
  const monthRent=()=>S.contracten.reduce((n,c)=>n+c.huur,0);
  const open=()=>S.facturen.filter(f=>f.status!=='betaald');
  function forecast(withIndex){
    const out=[];
    for(let i=1;i<=12;i++){const d=addM(m0,i);let sum=0;
      S.contracten.forEach(c=>{if(d>=addM(c.start,0)&&d<endOf(c)){let h=c.huur;if(withIndex){const jan=new Date(m0.getFullYear()+1,0,1);if(d>=jan)h=h*(1+c.index/100)}sum+=h}});
      out.push({d,sum:Math.round(sum)})}
    return out;
  }

  el.innerHTML=shell('Hofstede Vastgoed','Vastgoedbeheer · fictief bedrijf',[['dash','Dashboard','dash'],['panden','Vastgoed','home'],['huurders','Huurders','users'],['contracten','Contracten','doc'],['facturen','Facturatie','inv'],['betalingen','Betalingen','bank'],['prognose','Prognoses','chart']],'Demo met fictieve gegevens');
  const app=el.querySelector('.na-app'),main=app.querySelector('.na-main');
  app.querySelector('.na-side').addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(b)go(b.dataset.v)});
  function go(v,sel){if(S.busy||app.classList.contains('na-lock'))return;if(v==='panden'&&sel)emit('pand');S.view=v;S.sel=sel||null;setNav(app,v);main.scrollTop=0;render()}
  const head=(h,p,act)=>`<div class="na-h"><div><h3>${h}</h3>${p?`<p>${p}</p>`:''}</div>${act||''}</div>`;

  function vDash(){
    const fc=forecast(true),exp=fc.reduce((n,x)=>n+x.sum,0);
    const occ=S.panden.filter(p=>cOfPand(p.id)).length;
    return head('Dashboard',`Overzicht van ${MN[m0.getMonth()]} ${m0.getFullYear()}`)+
    `<div class="na-kpis">
      <button type="button" class="na-kpi" data-go="panden"><small>Panden</small><b>${S.panden.length}</b><span>${occ} verhuurd · ${S.panden.length-occ} leeg</span></button>
      <button type="button" class="na-kpi" data-go="huurders"><small>Actieve huurders</small><b>${S.huurders.length}</b><span>allemaal met contract</span></button>
      <button type="button" class="na-kpi" data-go="contracten"><small>Maandelijkse huur</small><b>${eur(monthRent())}</b><span>totaal per maand</span></button>
      <button type="button" class="na-kpi${open().length?' warn':''}" data-go="betalingen"><small>Openstaand</small><b>${eur(open().reduce((n,f)=>n+f.bedrag,0))}</b><span>${open().length} factuur${open().length===1?'':'en'} niet betaald</span></button>
      <button type="button" class="na-kpi" data-go="prognose"><small>Verwacht, 12 maanden</small><b>${eur(exp)}</b><span>incl. indexatie</span></button>
    </div>
    <div class="na-grid2">
      <div class="na-card"><div class="na-ch"><b>Panden</b><button type="button" class="na-lnk" data-go="panden">Alles bekijken</button></div>
        ${S.panden.map(p=>{const c=cOfPand(p.id),f=c&&invOf(c);return `<button type="button" class="na-row" data-pand="${p.id}"><span><b>${esc(p.adres)}</b><small>${esc(p.plaats)} · ${c?esc(H(c.huurder).naam):'Leegstand'}</small></span>${c?pill(f?f.status:'concept'):'<i class="pill idle">Beschikbaar</i>'}</button>`}).join('')}</div>
      <div class="na-card"><div class="na-ch"><b>Audittrail</b><small>facturen, communicatie, betalingen</small></div><ol class="na-audit">${S.audit.slice(0,6).map(a=>`<li class="t-${a.type}"><span>${esc(a.t)}</span><time>${a.tijd}</time></li>`).join('')}</ol></div>
    </div>`;
  }
  function vPanden(){
    const sel=S.sel&&P(S.sel);
    return head('Vastgoed','Klik op een pand voor de details.')+
    `<div class="na-split${sel?' has':''}"><div class="na-cards">${S.panden.map(p=>{const c=cOfPand(p.id);return `<button type="button" class="na-pc${S.sel===p.id?' on':''}" data-pand="${p.id}"><span class="na-ph" aria-hidden="true">${ic('home')}</span><b>${esc(p.adres)}</b><small>${esc(p.plaats)} · ${p.type} · ${p.m2} m²</small><span class="na-pc-f">${c?`<span>${eur(c.huur)} p/m</span>${pill((invOf(c)||{}).status||'concept')}`:'<span>Leegstand</span><i class="pill idle">Beschikbaar</i>'}</span></button>`}).join('')}</div>
    ${sel?detPand(sel):''}</div>`;
  }
  function detPand(p){
    const c=cOfPand(p.id);
    if(!c)return `<aside class="na-det" aria-label="Details van ${esc(p.adres)}"><button type="button" class="na-close" data-close-det aria-label="Sluit details">×</button><small>Pand ${p.id}</small><h4>${esc(p.adres)}, ${esc(p.plaats)}</h4><dl><dt>Type</dt><dd>${p.type}, ${p.m2} m²</dd><dt>Huurder</dt><dd>Geen, het pand staat leeg</dd></dl><button type="button" class="na-btn" data-go="huurders" data-add="${p.id}">Huurder toevoegen</button></aside>`;
    const f=invOf(c),h=H(c.huurder);
    return `<aside class="na-det" aria-label="Details van ${esc(p.adres)}"><button type="button" class="na-close" data-close-det aria-label="Sluit details">×</button><small>Pand ${p.id}</small><h4>${esc(p.adres)}, ${esc(p.plaats)}</h4>
      <dl><dt>Adres</dt><dd>${esc(p.adres)}, ${esc(p.plaats)}</dd><dt>Type</dt><dd>${p.type}, ${p.m2} m²</dd><dt>Huurder</dt><dd>${esc(h.naam)}<br><small>${esc(h.contact)}</small></dd><dt>Huurprijs</dt><dd>${eur(c.huur)} per maand</dd><dt>Contractduur</dt><dd>${c.jaren} jaar · ${fmtD(c.start)} t/m ${fmtD(addM(endOf(c),0))}</dd><dt>Betalingsstatus</dt><dd>${f?pill(f.status)+' <small>factuur '+f.nr+'</small>':'Geen factuur'}</dd></dl>
      <div class="na-acts"><button type="button" class="na-btn ghost" data-contract="${c.id}">Contract bekijken</button>${f&&f.status!=='betaald'?`<button type="button" class="na-btn" data-inv="${f.nr}">Naar factuur</button>`:''}</div></aside>`;
  }
  function vHuurders(pre){
    const free=S.panden.filter(p=>!cOfPand(p.id));
    return head('Huurders',`${S.huurders.length} actieve huurders`)+
    `<div class="na-grid2 wide"><div class="na-card"><table class="na-tbl"><thead><tr><th>Huurder</th><th>Pand</th><th class="r">Huur</th></tr></thead><tbody>${S.huurders.map(h=>{const c=S.contracten.find(x=>x.huurder===h.id);const p=c&&P(c.pand);return `<tr class="${h.nieuw?'na-new':''}"><td><b>${esc(h.naam)}</b><small>${esc(h.contact)} · ${esc(h.email)}</small></td><td>${p?esc(p.adres)+'<small>'+esc(p.plaats)+'</small>':'–'}</td><td class="r">${c?eur(c.huur):'–'}</td></tr>`}).join('')}</tbody></table></div>
    <form class="na-card na-form" id="na-add" novalidate><div class="na-ch"><b>Huurder toevoegen</b><small>maakt direct een contract en factuur aan</small></div>
      ${free.length?`<label>Bedrijfsnaam<input name="naam" required maxlength="60" placeholder="Bijv. Atelier Noord"></label>
      <label>Contactpersoon<input name="contact" required maxlength="60" placeholder="Voor- en achternaam"></label>
      <label>E-mail voor facturen<input name="email" type="email" required maxlength="80" placeholder="facturen@bedrijf.nl"></label>
      <div class="na-2"><label>Pand<select name="pand" required>${free.map(p=>`<option value="${p.id}"${pre===p.id?' selected':''}>${esc(p.adres)}, ${esc(p.plaats)}</option>`).join('')}</select></label>
      <label>Huur per maand (€)<input name="huur" type="number" inputmode="numeric" min="100" max="50000" step="10" required value="1950"></label></div>
      <div class="na-2"><label>Startdatum<input name="start" type="month" required value="${addM(m0,1).toISOString().slice(0,7)}"></label>
      <label>Looptijd<select name="jaren"><option value="1">1 jaar</option><option value="3" selected>3 jaar</option><option value="5">5 jaar</option></select></label></div>
      <p class="na-err" role="alert"></p><button class="na-btn" type="submit">Huurder toevoegen</button>`:
      `<p class="na-empty">Alle panden zijn verhuurd. In de echte app voeg je hier eerst een nieuw pand toe.</p>`}
    </form></div>`;
  }
  function vContracten(){
    const sel=S.sel&&C(S.sel);
    return head('Contracten','Klik op een contract voor alle afspraken.')+
    `<div class="na-split${sel?' has':''}"><div class="na-card"><table class="na-tbl click"><thead><tr><th>Contract</th><th>Looptijd</th><th class="r">Huur</th></tr></thead><tbody>${S.contracten.map(c=>{const e=endOf(c);const left=Math.round((e-today)/(864e5*30.4));return `<tr tabindex="0" data-contract="${c.id}" class="${S.sel===c.id?'on':''}${c.nieuw?' na-new':''}"><td><b>${esc(H(c.huurder).naam)}</b><small>${c.id} · ${esc(P(c.pand).adres)}</small></td><td>${c.jaren} jaar<small>${left>0?'nog '+left+' mnd':'verlopen'}</small></td><td class="r">${eur(c.huur)}</td></tr>`}).join('')}</tbody></table></div>
    ${sel?detContract(sel):''}</div>`;
  }
  function detContract(c){
    const h=H(c.huurder),p=P(c.pand),e=endOf(c);const opz=addM(e,-c.opzeg);
    return `<aside class="na-det"><button type="button" class="na-close" data-close-det aria-label="Sluit details">×</button><small>Huurovereenkomst ${c.id}</small><h4>${esc(h.naam)}</h4>
    <dl><dt>Pand</dt><dd>${esc(p.adres)}, ${esc(p.plaats)}</dd><dt>Ingangsdatum</dt><dd>${fmtD(c.start)}</dd><dt>Einddatum</dt><dd>${fmtD(e)}</dd><dt>Contractduur</dt><dd>${c.jaren} jaar</dd><dt>Opzegtermijn</dt><dd>${c.opzeg} maanden (uiterlijk ${fmtD(opz)})</dd><dt>Huurprijs</dt><dd>${eur(c.huur)} per maand, vooruit</dd><dt>Indexatie</dt><dd>${c.index}% per 1 januari (CPI)</dd><dt>Facturatie</dt><dd>Automatisch op de 1e, naar ${esc(h.email)}</dd></dl>
    <p class="na-note">Nimbr herinnert je ${c.opzeg+2} maanden voor de opzegdatum aan verlenging of heronderhandeling.</p></aside>`;
  }
  function vFacturen(){
    const sel=S.sel&&S.facturen.find(f=>f.nr===S.sel);
    return head('Facturatie','Alle facturen · klik op een factuur om hem te bekijken')+
    `<div class="na-split${sel?' has wide':''}"><div class="na-card"><table class="na-tbl click"><thead><tr><th>Factuur</th><th class="r">Bedrag</th><th class="r">Status</th></tr></thead><tbody>${S.facturen.map(f=>{const c=C(f.contract);return `<tr tabindex="0" data-inv="${f.nr}" class="${S.sel===f.nr?'on':''}${f.nieuw?' na-new':''}"><td><b>${f.nr}</b><small>${esc(H(c.huurder).naam)} · ${MN[f.maand.getMonth()]}</small></td><td class="r">${eur2(f.bedrag)}</td><td class="r">${pill(f.status)}</td></tr>`}).join('')}</tbody></table></div>
    ${sel?detFactuur(sel):''}</div>`;
  }
  function detFactuur(f){
    const c=C(f.contract),h=H(c.huurder),p=P(c.pand);const btw=0;
    const act=f.status==='concept'?`<button type="button" class="na-btn" data-send="${f.nr}">${ic('mail')}Registreer als verstuurd</button>`:f.status==='verstuurd'||f.status==='herinnering'?`<button type="button" class="na-btn ghost" data-go="betalingen">Betaling controleren</button>`:'';
    return `<aside class="na-det na-invw"><button type="button" class="na-close" data-close-det aria-label="Sluit factuur">×</button>
    <div class="na-inv" aria-label="Voorbeeldfactuur ${f.nr}"><div class="na-inv-h"><b>Hofstede Vastgoed</b><span>FACTUUR</span></div>
      <div class="na-inv-m"><div><small>Aan</small>${esc(h.naam)}<br>t.a.v. ${esc(h.contact)}</div><div><small>Factuurnummer</small>${f.nr}<small>Datum</small>1 ${MN[f.maand.getMonth()]} ${f.maand.getFullYear()}</div></div>
      <table><tr><td>Huur ${esc(p.adres)}, ${esc(p.plaats)}<small>${MN[f.maand.getMonth()]} ${f.maand.getFullYear()} · contract ${c.id}</small></td><td class="r">${eur2(f.bedrag)}</td></tr><tr class="t"><td>Totaal</td><td class="r">${eur2(f.bedrag+btw)}</td></tr></table>
      <p class="na-inv-f">Graag voldoen binnen 14 dagen onder vermelding van ${f.nr}. Voorbeeldfactuur met fictieve gegevens.</p></div>
    <div class="na-acts">${pill(f.status)}${f.verstuurd?`<small>verstuurd op ${f.verstuurd}</small>`:''}${act}</div></aside>`;
  }
  function vBetalingen(){
    const op=S.facturen.filter(f=>f.status==='verstuurd'||f.status==='herinnering');
    const con=S.facturen.filter(f=>f.status==='concept');
    return head('Betalingen','Controleer of verstuurde facturen betaald zijn.',`<button type="button" class="na-btn" id="na-bank"${op.length?'':' disabled'}>${ic('bank')}Voer bankcontrole uit</button>`)+
    `<div class="na-card"><div class="na-ch"><b>Te controleren</b><small>bankrekening NL00 DEMO 0123 4567 89 (fictief)</small></div>
      ${op.length?op.map(f=>{const c=C(f.contract);return `<div class="na-pay" id="pay-${f.nr}"><span><b>${esc(H(c.huurder).naam)}</b><small>${f.nr} · ${eur2(f.bedrag)}</small></span><span class="na-pay-r">${pill(f.status)}</span></div>`}).join(''):'<p class="na-empty">Geen openstaande verstuurde facturen. Alles is betaald of nog niet verstuurd.</p>'}
      ${con.length?`<p class="na-note">${con.length} factuur nog in concept. <button type="button" class="na-lnk" data-go="facturen">Eerst versturen</button></p>`:''}
    </div>
    <div class="na-card" id="na-bankres" hidden></div>`;
  }
  function vPrognose(){
    const withI=S.idx!==false;const fc=forecast(withI);const max=Math.max(...fc.map(x=>x.sum))*1.18||1;const tot=fc.reduce((n,x)=>n+x.sum,0);
    const bw=100/fc.length;
    return head('Financiële prognose','Verwachte huurinkomsten voor de komende 12 maanden, op basis van de lopende contracten.')+
    `<div class="na-card"><div class="na-ch"><div><b>${eur(tot)}</b><small>verwacht in 12 maanden</small></div><label class="na-tog"><input type="checkbox" id="na-idx"${withI?' checked':''}> Met indexatie per 1 januari</label></div>
    <div class="na-chart" role="img" aria-label="Staafdiagram van verwachte huurinkomsten per maand, totaal ${eur(tot)}">
      <div class="na-bars">${fc.map((x,i)=>`<div class="na-bar" style="--h:${(x.sum/max*100).toFixed(1)}%;--i:${i}"><span class="na-tip">${eur(x.sum)}</span><i></i><small>${MS[x.d.getMonth()]}</small></div>`).join('')}</div></div>
    ${(()=>{const end=S.contracten.filter(c=>{const e=endOf(c);return e>today&&e<=addM(m0,13)});return end.length?`<div class="na-alert"><b>Let op</b>${end.map(c=>`<span>Het contract van ${esc(H(c.huurder).naam)} loopt af op ${fmtD(endOf(c))}. Zonder verlenging daalt de huur met ${eur(c.huur)} per maand.</span>`).join('')}</div>`:''})()}
    <details class="na-more"><summary>Bekijk per maand</summary><table class="na-tbl sm"><thead><tr><th>Maand</th><th class="r">Verwacht</th></tr></thead><tbody>${fc.map(x=>`<tr><td>${MN[x.d.getMonth()]} ${x.d.getFullYear()}</td><td class="r">${eur(x.sum)}</td></tr>`).join('')}</tbody></table></details></div>`;
  }

  function render(){
    const v=S.view;
    main.innerHTML=v==='dash'?vDash():v==='panden'?vPanden():v==='huurders'?vHuurders(S.sel):v==='contracten'?vContracten():v==='facturen'?vFacturen():v==='betalingen'?vBetalingen():vPrognose();
    emit('view:'+v);
    const det=main.querySelector('.na-det');if(det&&!app.classList.contains('na-coach-on'))inMain(main,det,'top');
  }
  main.addEventListener('click',async e=>{
    const t=e.target;
    let b;
    if(S.busy)return;
    if(t.closest('[data-close-det]')){S.sel=null;render();return}
    if((b=t.closest('[data-add]'))){go('huurders',b.dataset.add);return}
    if((b=t.closest('[data-go]'))){go(b.dataset.go);return}
    if((b=t.closest('[data-pand]'))){go('panden',b.dataset.pand);return}
    if((b=t.closest('[data-contract]'))){go('contracten',b.dataset.contract);return}
    if((b=t.closest('[data-send]'))){const f=S.facturen.find(x=>x.nr===b.dataset.send);const h=H(C(f.contract).huurder);
      b.disabled=true;b.innerHTML='Versturen…';await W(700);
      f.status='verstuurd';f.verstuurd=today.getDate()+' '+MS[today.getMonth()];log(`Factuur ${f.nr} verstuurd naar ${h.email} (gesimuleerd)`,'mail');
      toast(app,`Factuur ${f.nr} geregistreerd als verstuurd`);emit('factuur');render();return}
    if((b=t.closest('[data-inv]'))){go('facturen',b.dataset.inv);return}
    if(t.closest('#na-bank')){bankcheck(t.closest('#na-bank'));return}
    if((b=t.closest('[data-remind]'))){const f=S.facturen.find(x=>x.nr===b.dataset.remind);f.status='herinnering';log(`Vriendelijke herinnering voor ${f.nr} verstuurd (gesimuleerd)`,'mail');b.outerHTML='<span class="na-done">Herinnering verstuurd ✓</span>';toast(app,'Herinnering verstuurd');const p=main.querySelector('#pay-'+f.nr+' .na-pay-r');if(p)p.innerHTML=pill('herinnering');return}
  });
  main.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('tr[tabindex]')){e.preventDefault();e.target.click()}});
  main.addEventListener('change',e=>{if(e.target.id==='na-idx'){S.idx=e.target.checked;render()}});
  main.addEventListener('submit',e=>{
    if(e.target.id!=='na-add')return;e.preventDefault();const f=e.target,er=f.querySelector('.na-err');
    const d=Object.fromEntries(new FormData(f));const huur=+d.huur;
    const bad=[];if(!d.naam.trim())bad.push('naam');if(!d.contact.trim())bad.push('contact');if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email))bad.push('email');if(!(huur>=100&&huur<=50000))bad.push('huur');if(!d.start)bad.push('start');
    f.querySelectorAll('input,select').forEach(i=>i.toggleAttribute('aria-invalid',bad.includes(i.name)));
    if(bad.length){er.textContent='Controleer de gemarkeerde velden.';f.querySelector('[aria-invalid]').focus();return}
    const n=S.huurders.length+1,hid='H'+n+'x'+Date.now()%1000;
    S.huurders.push({id:hid,naam:d.naam.trim(),contact:d.contact.trim(),email:d.email.trim(),nieuw:true});
    const [y,mo]=d.start.split('-').map(Number);const start=new Date(y,mo-1,1,12);
    const cid=`C-${y}-${String(40+n).padStart(3,'0')}`;
    S.contracten.push({id:cid,pand:d.pand,huurder:hid,huur,start,jaren:+d.jaren,opzeg:3,index:3.0,nieuw:true});
    const fnr=`F${y*100+mo}-${String(S.facturen.length+1).padStart(2,'0')}`;
    S.facturen.push({nr:fnr,contract:cid,bedrag:huur,status:'concept',maand:start,nieuw:true});
    log(`Nieuwe huurder ${d.naam.trim()} toegevoegd, contract ${cid} aangemaakt`,'auto');
    log(`Eerste factuur ${fnr} klaargezet voor ${MN[mo-1]}`,'auto');
    toast(app,`${d.naam.trim()} toegevoegd. Contract en eerste factuur staan klaar.`);
    render();emit('huurder');
  });

  async function bankcheck(btn){
    const op=S.facturen.filter(f=>f.status==='verstuurd'||f.status==='herinnering');if(!op.length)return;
    btn.disabled=true;btn.innerHTML='Bezig met controleren…';
    const res=main.querySelector('#na-bankres');res.hidden=false;
    res.innerHTML=`<div class="na-ch"><b>Bankcontrole</b><small>fictieve bankmutaties</small></div><div class="na-scan"><div class="na-prog"><i></i></div><p class="na-scan-t">Bankmutaties ophalen…</p></div>`;
    const bar=res.querySelector('.na-prog i'),txt=res.querySelector('.na-scan-t');
    const steps=['Bankmutaties ophalen…','38 mutaties sinds de 1e gevonden','Bedragen en omschrijvingen vergelijken…','Klaar'];
    for(let i=0;i<steps.length;i++){txt.textContent=steps[i];bar.style.width=((i+1)/steps.length*100)+'%';await W(650)}
    const lines=[];
    op.forEach(f=>{const c=C(f.contract),h=H(c.huurder);
      // in deze demo betaalt Van Dijk Logistiek wel, nieuwe huurders en herinneringen nog niet
      const paid=h.id==='H2'||f.status==='herinnering'&&f._tries>0;f._tries=(f._tries||0)+1;
      const row=main.querySelector('#pay-'+f.nr+' .na-pay-r');
      if(paid){f.status='betaald';f.betaald=today.getDate()+' '+MS[today.getMonth()];log(`Betaling ${eur2(f.bedrag)} van ${h.naam} gevonden en gekoppeld aan ${f.nr}`,'pay');
        lines.push(`<div class="na-hit ok"><b>Betaling gevonden</b><span>${esc(h.naam)} · ${eur2(f.bedrag)} · omschrijving "${f.nr}"</span></div>`);if(row)row.innerHTML=pill('betaald')}
      else{log(`Geen betaling gevonden voor ${f.nr} (${h.naam})`,'warn');
        lines.push(`<div class="na-hit no"><b>Geen betaling gevonden</b><span>${esc(h.naam)} · ${f.nr} · ${eur2(f.bedrag)}</span>${f.status==='herinnering'?'<span class="na-done">Herinnering al verstuurd</span>':`<button type="button" class="na-btn sm" data-remind="${f.nr}">Stuur herinnering</button>`}</div>`)}
    });
    res.querySelector('.na-scan').outerHTML=`<div class="na-hits">${lines.join('')}</div><p class="na-note">In de echte app draait deze controle elke ochtend vanzelf, gekoppeld aan de bank.</p>`;
    btn.disabled=false;btn.innerHTML=ic('bank')+'Opnieuw controleren';toast(app,'Bankcontrole afgerond');
  }
  render();
  return {S,P,H,C,endOf,ym,m0,log,render,go,app,main,eur,eur2,
    lock(on){app.classList.toggle('na-lock',on);app.querySelectorAll('.na-side button').forEach(b=>b.disabled=on)}};
}

/* =====================================================================
   DEMO B · FINANCIËLE AUTOMATISERING
   ===================================================================== */
function financieel(el,hooks={}){
  const emit=n=>{if(hooks.emit)hooks.emit(n)};
  const d=n=>{const x=new Date(today);x.setDate(x.getDate()-n);return x};
  const MB=['facturen@voorbeeldshop.nl','inkoop@voorbeeldshop.nl','info@voorbeeldshop.nl'];
  const MBN={'facturen@voorbeeldshop.nl':412,'inkoop@voorbeeldshop.nl':268,'info@voorbeeldshop.nl':1290};
  const S={
    tx:[
      {id:'TX-8F21A',lev:'Verpakkingsgroothandel Noord',bedrag:248.50,datum:d(1),status:'open',inv:{nr:'VGN-26-1187',mb:1,dag:3}},
      {id:'TX-8F1C7',lev:'Drukkerij Lindeman',bedrag:89.00,datum:d(2),status:'open',inv:{nr:'DL2026-0432',mb:0,dag:2}},
      {id:'TX-8F0B2',lev:'Logistiek Express',bedrag:1120.00,datum:d(4),status:'open',inv:{nr:'LE-110934',mb:2,dag:5}},
      {id:'TX-8E9D4',lev:'Hosting Europa',bedrag:39.99,datum:d(6),status:'gekoppeld',inv:{nr:'HE-2026-11-58',mb:0,dag:6}},
      {id:'TX-8E7A0',lev:'Verpakkingsgroothandel Noord',bedrag:312.00,datum:d(10),status:'gekoppeld',inv:{nr:'VGN-26-1102',mb:1,dag:11}},
      {id:'TX-8E51F',lev:'Marketingbureau Helder',bedrag:650.00,datum:d(13),status:'open',inv:{nr:'MBH-0291',mb:2,dag:14}},
      {id:'TX-8E3C9',lev:'Kantoorartikelen Online',bedrag:57.30,datum:d(16),status:'open',inv:null}
    ],
    mem:{'Verpakkingsgroothandel Noord':{mb:1,n:3},'Hosting Europa':{mb:0,n:5},'Drukkerij Lindeman':{mb:0,n:1}},
    f:{lev:'',min:'',max:'',van:'',tot:'',status:''},
    sel:null,flow:0,found:null,busy:false,log:[],view:'tx'
  };
  el.innerHTML=shell('Voorbeeldshop B.V.','Financiële automatisering · fictief bedrijf',[['tx','Transacties','tx'],['mem','Geheugen','brain']],'Simulatie · geen echte koppeling');
  const app=el.querySelector('.na-app'),main=app.querySelector('.na-main');
  const goB=v=>{if(S.busy||app.classList.contains('na-lock'))return;S.view=v;setNav(app,v);main.scrollTop=0;render()};
  app.querySelector('.na-side').addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(b)goB(b.dataset.v)});
  const levs=[...new Set(S.tx.map(t=>t.lev))].sort();
  const stp={open:['Factuur ontbreekt','wait'],gekoppeld:['Gekoppeld','ok'],handmatig:['Handmatig controleren','chk']};
  const pill=s=>`<i class="pill ${stp[s][1]}">${stp[s][0]}</i>`;
  const FLOW=['Transactie ontvangen','Filter toegepast','Mailbox doorzocht','Factuur gevonden','Factuur gekoppeld'];
  const list=()=>S.tx.filter(t=>{const f=S.f;
    if(f.lev&&t.lev!==f.lev)return false;if(f.status&&t.status!==f.status)return false;
    if(f.min!==''&&t.bedrag<+f.min)return false;if(f.max!==''&&t.bedrag>+f.max)return false;
    const ds=t.datum.toISOString().slice(0,10);if(f.van&&ds<f.van)return false;if(f.tot&&ds>f.tot)return false;return true});
  const active=()=>Object.values(S.f).some(v=>v!=='');
  const tx=()=>S.tx.find(t=>t.id===S.sel);

  function flowBar(){return `<ol class="na-flow" aria-label="Workflowstatus">${FLOW.map((s,i)=>`<li class="${i<S.flow?'fdone':i===S.flow&&S.busy?'fnow':''}"><span>${i<S.flow?'✓':i+1}</span>${s}</li>`).join('')}</ol>`}
  function vTx(){
    const L=list();
    return `<div class="na-h"><div><h3>Transacties</h3><p>Bankrekening (gesimuleerd, vergelijkbaar met Revolut) · selecteer een transactie</p></div></div>
    <form class="na-filters" id="nf" aria-label="Filters">
      <label>Leverancier<select name="lev"><option value="">Alle leveranciers</option>${levs.map(l=>`<option${S.f.lev===l?' selected':''}>${esc(l)}</option>`).join('')}</select></label>
      <label>Bedrag van<input name="min" type="number" inputmode="decimal" min="0" step="1" placeholder="€ 0" value="${S.f.min}"></label>
      <label>tot<input name="max" type="number" inputmode="decimal" min="0" step="1" placeholder="€ max" value="${S.f.max}"></label>
      <label>Datum vanaf<input name="van" type="date" value="${S.f.van}"></label>
      <label>tot en met<input name="tot" type="date" value="${S.f.tot}"></label>
      <label>Status<select name="status"><option value="">Alle statussen</option><option value="open"${S.f.status==='open'?' selected':''}>Factuur ontbreekt</option><option value="gekoppeld"${S.f.status==='gekoppeld'?' selected':''}>Gekoppeld</option><option value="handmatig"${S.f.status==='handmatig'?' selected':''}>Handmatig controleren</option></select></label>
      <div class="na-fq"><button type="button" class="na-chip${S.f.status==='open'?' on':''}" data-quick="open">Slim filter: zonder factuur</button>${active()?'<button type="button" class="na-lnk" data-reset>Filters wissen</button>':''}<span class="na-cnt">${L.length} van ${S.tx.length} transacties</span></div>
    </form>
    <div class="na-txw${S.sel?' has':''}">
      <div class="na-card na-txl" role="listbox" aria-label="Transacties">${L.length?L.map(t=>`<button type="button" role="option" aria-selected="${S.sel===t.id}" class="na-tx${S.sel===t.id?' on':''}" data-tx="${t.id}"><span class="na-tx-a"><b>${esc(t.lev)}</b><small>${fmtShort(t.datum)} · ${t.id}</small></span><span class="na-tx-b"><b>− ${eur2(t.bedrag)}</b>${pill(t.status)}</span></button>`).join(''):'<p class="na-empty">Geen transacties gevonden met deze filters.</p>'}</div>
      <div class="na-work">${S.sel?work():`<div class="na-card na-hint2">${ic('flow')}<p><b>Kies een transactie</b>Selecteer links een transactie zonder factuur en laat Nimbr de factuur zoeken.</p></div>`}</div>
    </div>`;
  }
  function work(){
    const t=tx();const m=S.mem[t.lev];
    let body='';
    if(t.status==='gekoppeld'){const nxt=S.tx.find(x=>x.status==='open');body=`<div class="na-hit ok"><b>${S.just===t.id?'Factuur gekoppeld ✓':'Al gekoppeld'}</b><span>Factuur ${t.inv.nr} uit ${MB[t.inv.mb]} hoort bij ${t.id}.</span></div>${invCard(t)}${S.just===t.id?`<p class="na-memhint">${ic('brain')}<span>Geheugen bijgewerkt: ${esc(t.lev)} → <b>${MB[t.inv.mb]}</b> (${S.mem[t.lev].n}×). Bekijk het onder Geheugen.</span></p>`:''}${nxt?`<button type="button" class="na-btn ghost" data-tx="${nxt.id}">Volgende transactie zonder factuur →</button>`:'<p class="na-note">Alle transacties zijn verwerkt.</p>'}`}
    else if(S.found==='none')body=`<div class="na-hit no"><b>Geen factuur gevonden</b><span>In geen van de mailboxen staat een factuur van ${esc(t.lev)} van ${eur2(t.bedrag)}.</span><button type="button" class="na-btn sm ghost" data-manual>Markeer voor handmatige controle</button></div>`;
    else if(S.found)body=invCard(t);
    else body=`<div class="na-search" id="na-search">${MB.map((mb,i)=>`<div class="na-mb" data-mb="${i}"><span>${ic('mail')}<b>${mb}</b>${m&&m.mb===i?'<em>geheugen</em>':''}</span><div class="na-prog"><i></i></div><small>klaar om te doorzoeken</small></div>`).join('')}</div>`;
    return `<div class="na-card"><div class="na-sel"><small>Geselecteerde transactie</small><b>${esc(t.lev)}</b><span>− ${eur2(t.bedrag)} · ${fmtD(t.datum)} · ${t.id}</span></div>
      ${flowBar()}
      ${m&&t.status!=='gekoppeld'?`<p class="na-memhint">${ic('brain')}<span>Nimbr kent deze leverancier: ${m.n} eerdere koppeling${m.n===1?'':'en'} via <b>${MB[m.mb]}</b>. Die mailbox wordt eerst doorzocht.</span></p>`:''}
      ${body}
      ${t.status==='open'&&!S.found?`<button type="button" class="na-btn" id="na-find"${S.busy?' disabled':''}>${ic('mail')}Zoek factuur</button>`:''}
    </div>`;
  }
  function invCard(t){
    const i=t.inv;const id=new Date(t.datum);id.setDate(id.getDate()-(i.dag-1));
    return `<div class="na-found"><div class="na-found-h"><span class="na-pdf">PDF</span><div><b>Factuur gevonden</b><small>${i.nr}.pdf · bijlage in ${MB[i.mb]}</small></div></div>
    <dl><dt>Factuurnummer</dt><dd>${i.nr}</dd><dt>Leverancier</dt><dd>${esc(t.lev)}</dd><dt>Bedrag</dt><dd>${eur2(t.bedrag)} <i class="na-ok">komt overeen</i></dd><dt>Factuurdatum</dt><dd>${fmtD(id)}</dd><dt>Mailbox</dt><dd>${MB[i.mb]}</dd></dl>
    ${t.status==='gekoppeld'?'':`<button type="button" class="na-btn" id="na-link">Koppel factuur aan transactie</button>`}</div>`;
  }
  function vMem(){
    const rows=Object.entries(S.mem).sort((a,b)=>b[1].n-a[1].n);
    return `<div class="na-h"><div><h3>Geheugen</h3><p>Wat Nimbr onthoudt van eerdere koppelingen, en gebruikt bij volgende zoekopdrachten.</p></div></div>
    <div class="na-card"><table class="na-tbl"><thead><tr><th>Leverancier</th><th>Eerder gebruikte mailbox</th><th class="r">Koppelingen</th></tr></thead><tbody>${rows.map(([l,m])=>`<tr class="${m.nieuw?'na-new':''}"><td><b>${esc(l)}</b></td><td>${MB[m.mb]}</td><td class="r">${m.n}</td></tr>`).join('')}</tbody></table>
    <p class="na-note">${ic('brain')} Bij een nieuwe transactie van een bekende leverancier zoekt Nimbr eerst in de mailbox die eerder raak was. Zo hoeft hij niet alle ${Object.values(MBN).reduce((a,b)=>a+b,0).toLocaleString('nl-NL')} berichten door te lopen.</p></div>
    <div class="na-card"><div class="na-ch"><b>Activiteit</b></div>${S.log.length?`<ol class="na-audit">${S.log.map(a=>`<li class="t-${a.type}"><span>${esc(a.t)}</span><time>${a.tijd}</time></li>`).join('')}</ol>`:'<p class="na-empty">Nog geen activiteit in deze sessie. Koppel een factuur bij Transacties.</p>'}</div>`;
  }
  function render(){main.innerHTML=S.view==='mem'?vMem():vTx();emit('view:'+S.view)}

  async function search(){
    const t=tx();if(!t||S.busy)return;S.busy=true;S.flow=1;emit('zoek');
    const btn=main.querySelector('#na-find');if(btn){btn.disabled=true;btn.textContent='Nimbr zoekt…'}
    const fb=()=>{const o=main.querySelector('.na-flow');if(o)o.outerHTML=flowBar()};
    fb();await W(500);S.flow=2;fb();
    const m=S.mem[t.lev];const order=m?[m.mb,...[0,1,2].filter(i=>i!==m.mb)]:[0,1,2];
    let hit=null;
    for(const i of order){
      const box=main.querySelector(`.na-mb[data-mb="${i}"]`);if(!box)break;box.classList.add('busy');
      const bar=box.querySelector('i'),sm=box.querySelector('small');
      const dur=m&&i===m.mb?600:1100;const total=MBN[MB[i]];
      for(let k=1;k<=10;k++){bar.style.width=k*10+'%';sm.textContent=`${Math.round(total*k/10)} van ${total} berichten`;await W(dur/10)}
      box.classList.remove('busy');
      if(t.inv&&t.inv.mb===i){box.classList.add('hit');sm.textContent='factuur gevonden';hit=i;break}
      box.classList.add('miss');sm.textContent='niets gevonden';
    }
    order.filter(i=>hit!==null&&i!==hit&&!main.querySelector(`.na-mb[data-mb="${i}"]`).className.match(/miss|hit/)).forEach(i=>{const b=main.querySelector(`.na-mb[data-mb="${i}"]`);b.classList.add('skip');b.querySelector('small').textContent=m?'overgeslagen dankzij geheugen':'niet meer nodig'});
    S.flow=3;fb();await W(500);
    if(hit===null){S.found='none';S.busy=false;S.log.unshift({t:`Geen factuur gevonden voor ${t.id} (${t.lev})`,type:'warn',tijd:nowTime()});render();return}
    S.found=true;S.flow=4;S.busy=false;setTimeout(()=>emit('gevonden'),0);
    S.log.unshift({t:`Factuur ${t.inv.nr} gevonden in ${MB[t.inv.mb]}${m&&m.mb===hit?' (eerst gezocht dankzij geheugen)':''}`,type:'auto',tijd:nowTime()});
    render();
  }
  main.addEventListener('click',e=>{
    const t=e.target;let b;
    if(S.busy)return;
    if((b=t.closest('[data-tx]'))){if(S.sel!==b.dataset.tx){S.sel=b.dataset.tx;const x=tx();S.found=x.status==='gekoppeld'?true:null;S.flow=x.status==='gekoppeld'?5:1;render();emit('tx');if(window.innerWidth<1000&&!app.classList.contains('na-coach-on'))inMain(main,main.querySelector('.na-work'),'top')}return}
    if((b=t.closest('[data-quick]'))){S.f.status=S.f.status==='open'?'':'open';render();return}
    if(t.closest('[data-reset]')){S.f={lev:'',min:'',max:'',van:'',tot:'',status:''};render();return}
    if(t.closest('#na-find')){search();return}
    if(t.closest('[data-manual]')){const x=tx();x.status='handmatig';S.log.unshift({t:`${x.id} gemarkeerd voor handmatige controle`,type:'warn',tijd:nowTime()});toast(app,'Gemarkeerd voor handmatige controle');S.found=null;render();return}
    if(t.closest('#na-link')){const x=tx();x.status='gekoppeld';S.flow=5;S.just=x.id;
      const m=S.mem[x.lev];if(m){m.n++;m.mb=x.inv.mb;m.nieuw=true}else S.mem[x.lev]={mb:x.inv.mb,n:1,nieuw:true};
      S.log.unshift({t:`Factuur ${x.inv.nr} gekoppeld aan ${x.id}. Geheugen bijgewerkt voor ${x.lev}`,type:'pay',tijd:nowTime()});
      toast(app,`Gekoppeld: ${x.inv.nr} aan ${x.id}. Nimbr onthoudt ${MB[x.inv.mb]} voor ${x.lev}.`);render();emit('koppel');return}
  });
  const onF=e=>{const f=e.target.closest('#nf');if(!f||!e.target.name)return;S.f[e.target.name]=e.target.value;const pos=e.target.name;render();const n=main.querySelector(`#nf [name="${pos}"]`);if(n&&e.type==='input'){n.focus();try{const v=n.value.length;n.setSelectionRange&&n.type==='text'&&n.setSelectionRange(v,v)}catch(x){}}};
  main.addEventListener('change',onF);
  main.addEventListener('input',e=>{if(e.target.type==='number')onF(e)});
  main.addEventListener('submit',e=>e.preventDefault());
  render();
  return {S,MB,MBN,render,go:goB,app,main,L:(t,type)=>S.log.unshift({t,type:type||'info',tijd:nowTime()}),
    lock(on){app.classList.toggle('na-lock',on);app.querySelectorAll('.na-side button').forEach(b=>b.disabled=on)},
    nieuw(){const d=n=>{const x=new Date(today);x.setDate(x.getDate()-n);return x};
      S.tx.unshift({id:'TX-8F3D1',lev:'Drukkerij Lindeman',bedrag:45.00,datum:d(0),status:'open',inv:{nr:'DL2026-0451',mb:0,dag:1},nieuw:true},{id:'TX-8F33B',lev:'Verpakkingsgroothandel Noord',bedrag:176.20,datum:d(0),status:'open',inv:{nr:'VGN-26-1203',mb:1,dag:1},nieuw:true});
      S.sel=null;S.found=null;S.flow=0;S.view='tx';setNav(app,'tx');render()}};
}


/* =====================================================================
   VERHAAL: 1 Nimbr aan het werk → 2 Het resultaat → 3 Zelf proberen
   ===================================================================== */
function avatarSrc(){const i=document.querySelector('#pose [data-p=wave],img[src*="nimbr-wave"]');return i?i.src:'assets/img/nimbr-wave.webp'}
const say=(av,txt,cls)=>`<div class="ns-say ${cls||''}"><img src="${av}" alt="" class="ns-av"><p>${txt}</p></div>`;

function storyDefA(api){
  const {S,H,C,P,endOf,ym,m0,log}=api;let made=[];
  return {
    intro:'Hoi! Ik ben Nimbr. Ik laat je zien hoe ik de huuradministratie van een hele maand afhandel. Klik op <b>Start</b> en ik neem je stap voor stap mee.',
    counters:[['fact','Facturen verstuurd'],['paid','Betalingen ontvangen'],['rem','Herinneringen'],['hand','Handwerk','0 min']],
    steps:[
      {i:'clock',t:`1 ${MN[m0.getMonth()]}: de maand start`,say:'Het is de 1e van de maand. Ik start vanzelf, niemand hoeft op een knop te drukken.',
       run:async x=>{await x.add(`Workflow "Maandelijkse huur" gestart`,'ok');await x.add(`${S.huurders.length} huurders, ${S.panden.length} panden`);return 'automatisch gestart'}},
      {i:'doc',t:'Contracten checken',say:'Eerst kijk ik welke huurcontracten deze maand lopen en hoeveel huur er betaald moet worden.',
       run:async x=>{const act=S.contracten.filter(c=>c.start<=m0&&m0<endOf(c));for(const c of act)await x.add(`${esc(H(c.huurder).naam)} · ${esc(P(c.pand).adres)} · <b>${eur(c.huur)}</b>`,'ok');return act.length+' lopende contracten'}},
      {i:'mail',t:'Facturen maken en versturen',say:'Voor elke huurder maak ik de factuur en stuur ik hem per e-mail. Met een vast kenmerk, zodat ik de betaling straks herken.',
       run:async x=>{const act=S.contracten.filter(c=>c.start<=m0&&m0<endOf(c));made=[];
         for(const c of act){const nr=`F${ym(m0)}-${String(made.length+1).padStart(2,'0')}`;const f={nr,contract:c.id,bedrag:c.huur,status:'verstuurd',maand:m0,verstuurd:'1 '+MS[m0.getMonth()],nieuw:true};S.facturen.push(f);made.push(f);
           log(`Factuur ${nr} verstuurd naar ${H(c.huurder).email}`,'mail');await x.add(`Factuur <b>${nr}</b> → ${esc(H(c.huurder).email)}`,'mail');x.set('fact',made.length)}
         return made.length+' facturen verstuurd'}},
      {i:'bank',t:'Betalingen controleren',say:'Elke ochtend vergelijk ik de bank met de openstaande facturen. Op bedrag én kenmerk.',
       run:async x=>{await x.add('41 bankmutaties opgehaald');let n=0;
         for(const f of made){const h=H(C(f.contract).huurder);
           if(h.id==='H3'){await x.add(`${esc(h.naam)}: nog niets ontvangen`,'warn')}
           else{f.status='betaald';f.betaald='6 '+MS[m0.getMonth()];n++;log(`Betaling ${eur2(f.bedrag)} van ${h.naam} gekoppeld aan ${f.nr}`,'pay');await x.add(`${esc(h.naam)}: <b>${eur2(f.bedrag)}</b> ontvangen`,'ok');x.set('paid',n)}}
         return n+' van '+made.length+' betaald'}},
      {i:'mail',t:'Herinnering sturen',say:'Bloem & Zo heeft nog niet betaald. Ik stuur een vriendelijke herinnering en zet alles in de audittrail.',
       run:async x=>{let n=0;for(const f of made.filter(f=>f.status!=='betaald')){const h=H(C(f.contract).huurder);f.status='herinnering';f._tries=1;n++;
           log(`Vriendelijke herinnering voor ${f.nr} verstuurd naar ${h.email}`,'mail');await x.add(`Herinnering → ${esc(h.email)}`,'mail');x.set('rem',n)}
         await x.add('Audittrail bijgewerkt','ok');return n+' herinnering verstuurd'}}
    ],
    win:sec=>({title:'De hele maand afgehandeld.',stats:[[made.length,'facturen verstuurd'],[made.filter(f=>f.status==='betaald').length,'betalingen gevonden'],[made.filter(f=>f.status==='herinnering').length,'herinnering']],
      manual:`±${S.huurders.length} uur`,note:'Gemiddeld 1 uur per huurder per maand, zoals bij 4B Investment.'}),
    tips2:[
      {sel:'.na-kpi[data-go=betalingen]',text:'Dit is het dashboard na mijn run. Alles is verstuurd en gecontroleerd. Alleen de huur van Bloem &amp; Zo staat nog open.'},
      {sel:'.na-row[data-pand="P3"]',text:'Bij Bloem &amp; Zo staat nu <b>Herinnering</b>. Die heb ik al verstuurd. Jij hoeft niets te doen.'},
      {sel:'.na-grid2 .na-card:last-child',text:'Alles wat ik doe, staat in de audittrail: facturen, mails en betalingen. Zo is altijd terug te zien wat er is gebeurd.'},
      {sel:'.na-kpi[data-go=prognose]',text:'Op basis van de contracten reken ik ook de verwachte inkomsten voor het komende jaar uit.',btn:'Nu zelf proberen'}
    ],
    tips3:[
      {sel:['.na-pc','.na-side [data-v=panden]'],task:'pand',text:'Jouw beurt! Open <b>Vastgoed</b> en klik op een pand om de details te zien.'},
      {sel:['#na-add','.na-side [data-v=huurders]'],task:'huurder',text:'Voeg een huurder toe voor het lege pand in Amersfoort. Ik maak er direct een contract en eerste factuur bij.'},
      {sel:['.na-chart','.na-side [data-v=prognose]'],task:'view:prognose',text:'Kijk bij <b>Prognoses</b>: de nieuwe huurder telt al mee in de verwachte inkomsten.'}
    ],
    endText:'Zo werkt het ook voor jouw processen: ik doe het terugkerende werk, jij houdt het overzicht.'
  };
}
function storyDefB(api){
  const {S,MB}=api;let todo=[];
  return {
    intro:'Hoi! Ik ben Nimbr. Bij elke betaling zoek ik de bijbehorende factuur op in de mailboxen. Klik op <b>Start</b> en kijk mee.',
    counters:[['link','Gekoppeld'],['mem','Via geheugen'],['hand','Melding aan team']],
    steps:[
      {i:'tx',t:'Nieuwe betalingen ophalen',say:'Elke ochtend haal ik de nieuwe transacties op uit de bank.',
       run:async x=>{for(const t of S.tx)await x.add(`${esc(t.lev)} · <b>− ${eur2(t.bedrag)}</b>`,null,220);return S.tx.length+' transacties'}},
      {i:'split',t:'Slim filteren',say:'Wat al een factuur heeft, sla ik over. De rest moet ik zoeken.',
       run:async x=>{todo=S.tx.filter(t=>t.status==='open');const k=S.tx.length-todo.length;await x.add(`${k} al gekoppeld, overgeslagen`);await x.add(`<b>${todo.length} transacties</b> hebben een factuur nodig`,'warn');return todo.length+' zonder factuur'}},
      {i:'brain',t:'Geheugen raadplegen',say:'Ken ik de leverancier al? Dan weet ik in welke mailbox ik eerst moet kijken. Dat scheelt veel zoeken.',
       run:async x=>{let n=0;for(const t of todo){const m=S.mem[t.lev];if(m){n++;await x.add(`${esc(t.lev)} → eerst <b>${MB[m.mb]}</b> (${m.n}× eerder)`,'ok');x.set('mem',n)}else await x.add(`${esc(t.lev)} → nieuw, ik zoek overal`)}return n+' leveranciers herkend'}},
      {i:'mail',t:'Mailboxen doorzoeken',say:'Ik zoek op leverancier, bedrag en datum. In alle drie de mailboxen, of eerst in de bekende.',
       run:async x=>{let f=0;for(const t of todo){if(t.inv){f++;await x.add(`<b>${t.inv.nr}</b> gevonden in ${MB[t.inv.mb]}`,'ok',420)}else await x.add(`${esc(t.lev)}: geen factuur te vinden`,'warn',420)}return f+' van '+todo.length+' gevonden'}},
      {i:'flow',t:'Koppelen en onthouden',say:'Ik koppel elke factuur aan de betaling en onthoud waar hij stond. Wat ik niet vind, meld ik aan het team.',
       run:async x=>{let k=0,h=0;for(const t of todo){if(t.inv){t.status='gekoppeld';k++;const m=S.mem[t.lev];if(m){m.n++;m.mb=t.inv.mb}else S.mem[t.lev]={mb:t.inv.mb,n:1};
           api.L(`Factuur ${t.inv.nr} gekoppeld aan ${t.id}`,'pay');await x.add(`${t.id} ↔ <b>${t.inv.nr}</b>`,'ok');x.set('link',k)}
         else{t.status='handmatig';h++;api.L(`${t.id} (${t.lev}) gemeld voor handmatige controle`,'warn');await x.add(`Melding aan team: ${esc(t.lev)} handmatig checken`,'warn');x.set('hand',h)}}
         return k+' gekoppeld, '+h+' melding'}}
    ],
    win:sec=>({title:'Alle betalingen verwerkt.',stats:[[todo.filter(t=>t.status==='gekoppeld').length,'gekoppeld'],[todo.filter(t=>S.mem[t.lev]&&S.mem[t.lev].n>1).length,'via geheugen'],[todo.filter(t=>t.status==='handmatig').length,'melding aan team']],
      manual:`±${todo.length*10} minuten`,note:'Uitgaande van zo\'n 10 minuten zoeken per factuur.'}),
    tips2:[
      {sel:()=>{const p=api.main.querySelector('.na-tx .pill.ok');return p&&p.closest('.na-tx')},text:'Dit zijn de transacties na mijn run. Bij deze heb ik de juiste factuur uit de mailbox gekoppeld.'},
      {sel:()=>{const p=api.main.querySelector('.na-tx .pill.chk');return p&&p.closest('.na-tx')},text:'Voor deze kon ik geen factuur vinden. Het team krijgt een melding om dit handmatig te checken.'},
      {sel:'.na-side [data-v=mem]',text:'In mijn <b>geheugen</b> staat per leverancier in welke mailbox de factuur zat. Daardoor zoek ik elke keer sneller.',btn:'Nu zelf proberen'}
    ],
    onAct3(){api.nieuw()},
    tips3:[
      {sel:'[data-tx="TX-8F33B"]',task:'tx',text:'Er zijn net twee nieuwe betalingen binnengekomen. Klik op die van <b>Verpakkingsgroothandel Noord</b>.'},
      {sel:['#na-find','.na-work'],task:'gevonden',text:'Klik op <b>Zoek factuur</b>. Ik ken deze leverancier al, dus ik kijk eerst in inkoop@.'},
      {sel:['#na-link','.na-work'],task:'koppel',text:'Gevonden! Controleer de gegevens en koppel de factuur aan de betaling.'},
      {sel:'.na-side [data-v=mem]',task:'view:mem',text:'Kijk nu in <b>Geheugen</b>: de teller van deze leverancier is omhoog gegaan.'}
    ],
    endText:'Zo werkt een digitale collega: hij zoekt, herkent en koppelt, en wordt elke keer slimmer.'
  };
}

function coach(api,av,tips,opt={}){
  const app=api.app,main=api.main;let i=-1,alive=true,ending=false;
  app.querySelectorAll('.nc-hole,.nc-tip,.nc-back').forEach(n=>n.remove());
  const hole=document.createElement('div');hole.className='nc-hole';
  const tip=document.createElement('div');tip.className='nc-tip';tip.setAttribute('role','status');tip.setAttribute('aria-live','polite');
  app.append(hole,tip);app.classList.add('na-coach-on');
  const target=()=>{const t=tips[i];if(ending||!t||!t.sel)return null;const list=Array.isArray(t.sel)?t.sel:[t.sel];
    for(const s of list){const el=typeof s==='function'?s():app.querySelector(s);if(el&&el.offsetParent!==null)return el}return null};
  function place(){
    if(!alive)return;const el=target();const a=app.getBoundingClientRect();const mob=window.innerWidth<760;
    tip.classList.toggle('mob',mob);
    if(!el){hole.style.opacity='0';tip.classList.add('center');tip.style.left='';tip.style.top='';return}
    tip.classList.remove('center');
    const z=(a.width/app.offsetWidth)||1,r0=el.getBoundingClientRect(),pad=6;
    const r={left:(r0.left-a.left)/z,top:(r0.top-a.top)/z,width:r0.width/z,height:r0.height/z};r.bottom=r.top+r.height;
    const AW=a.width/z,AH=a.height/z;
    // spotlight binnen het venster houden
    const ht=Math.max(r.top-pad,0),hb=Math.min(r.bottom+pad,AH);
    Object.assign(hole.style,{opacity:hb>ht+10?'1':'0',left:(r.left-pad)+'px',top:ht+'px',width:(r.width+pad*2)+'px',height:Math.max(hb-ht,0)+'px'});
    if(mob){tip.style.left='';tip.style.top='';app.style.setProperty('--tipH',tip.offsetHeight+'px');return}
    const tw=Math.min(330,AW-24),th=tip.offsetHeight||120;tip.style.width=tw+'px';
    tip.classList.remove('side-l','side-r','above');
    if(r.height>220||r.bottom+th+20>AH&&r.top<th+20){
      const side=r.left>tw+28?'l':(AW-r.left-r.width>tw+28?'r':null);
      if(side){tip.style.left=(side==='l'?r.left-tw-18:r.left+r.width+18)+'px';tip.style.top=Math.min(Math.max(12,r.top+12),AH-th-12)+'px';tip.classList.add('side-'+side);return}
    }
    let left=Math.max(12,Math.min(r.left+r.width/2-tw/2,AW-tw-12)),top=r.bottom+14;
    if(top+th>AH-10){top=r.top-th-14;tip.classList.add('above')}
    top=Math.max(10,Math.min(top,AH-th-10));
    tip.style.left=left+'px';tip.style.top=top+'px';
    tip.style.setProperty('--ax',Math.max(18,Math.min(tw-18,r.left+r.width/2-left))+'px');
  }
  let sched=0;const replace=()=>{if(sched)return;sched=requestAnimationFrame(()=>{sched=0;place()})};
  function show(n){
    i=Math.max(0,Math.min(n,tips.length-1));ending=false;const t=tips[i];tip.classList.remove('end');const bk0=app.querySelector('.nc-back');if(bk0)bk0.remove();
    tip.classList.remove('in','ok');
    setTimeout(()=>{if(!alive)return;
      tip.innerHTML=`<img src="${av}" alt="" class="ns-av"><div class="nc-b"><p>${t.text}</p>${t.task?'<span class="nc-wait">Jouw beurt</span>':''}</div><button type="button" class="nc-x" aria-label="Uitleg sluiten">×</button><i class="nc-arrow"></i>`;
      const el=target();if(el&&main.contains(el))inMain(main,el,window.innerWidth<760?'top':'center');
      setTimeout(()=>{if(!alive)return;place();tip.classList.add('in')},el&&main.contains(el)?320:40);
    },tip.innerHTML?160:0);
    if(opt.onChange)opt.onChange({i,n:tips.length,tip:t});
  }
  function end(){
    ending=true;i=tips.length;hole.style.opacity='0';tip.classList.remove('in');
    if(opt.endHtml){let bk=app.querySelector('.nc-back');if(!bk){bk=document.createElement('div');bk.className='nc-back';app.insertBefore(bk,tip)}requestAnimationFrame(()=>bk.classList.add('on'))}
    setTimeout(()=>{if(!alive)return;if(!opt.endHtml){stop();if(opt.onEnd)opt.onEnd();return}
      tip.innerHTML=`<img src="${av}" alt="" class="ns-av"><div class="nc-b">${opt.endHtml}</div><button type="button" class="nc-x" aria-label="Sluiten">×</button>`;tip.classList.add('end');place();tip.classList.add('in')},160);
    if(opt.onChange)opt.onChange({i,n:tips.length,end:true});
  }
  function stop(){if(!alive)return;alive=false;app.style.removeProperty('--tipH');const bk=app.querySelector('.nc-back');if(bk)bk.remove();hole.remove();tip.remove();app.classList.remove('na-coach-on');window.removeEventListener('resize',replace);main.removeEventListener('scroll',replace);ro.disconnect()}
  tip.addEventListener('click',e=>{if(e.target.closest('.nc-x')){stop();if(opt.onClose)opt.onClose()}else if(e.target.closest('[data-nc=end]')){stop();if(opt.onClose)opt.onClose()}});
  const ro=new ResizeObserver(replace);ro.observe(main);window.addEventListener('resize',replace);main.addEventListener('scroll',replace,{passive:true});
  show(0);
  return {
    next(){if(!alive)return;if(i>=tips.length-1)end();else show(i+1)},
    prev(){if(!alive)return;if(i>0)show(Math.min(i-1,tips.length-1))},
    event(ev){if(!alive)return;replace();const t=tips[i];if(!ending&&t&&t.task&&t.task===ev){tip.classList.add('ok');setTimeout(()=>{if(alive&&tips[i]===t)this.next()},800)}},
    get i(){return i},stop,place
  };
}

function story(el,name){
  const av=avatarSrc();
  const api0={};
  el.innerHTML=`<div class="ns" data-act="1">
    <div class="ns-bar"><ol class="ns-steps"><li data-a="1"><button type="button" data-goact="1"><span>1</span>Nimbr aan het werk</button></li><li data-a="2"><button type="button" data-goact="2" disabled><span>2</span>Het resultaat</button></li><li data-a="3"><button type="button" data-goact="3" disabled><span>3</span>Zelf proberen</button></li></ol>
    <button type="button" class="ns-reset" title="Zet de demo terug naar het begin">${ic('reset')}<span>Opnieuw beginnen</span></button></div>
    <div class="ns-player" tabindex="-1">
      <div class="ns-v1"></div>
      <div class="ns-v2" hidden></div>
      <div class="ns-ctrl">
        <div class="ns-prog"><span class="ns-prog-t"></span><span class="ns-prog-b"><i></i></span><span class="ns-dwell"><i></i></span></div>
        <div class="ns-btns"><button type="button" class="ns-b ghost" data-c="prev">← <span>Vorige</span></button><button type="button" class="ns-b ghost" data-c="play"></button><button type="button" class="ns-b main" data-c="next"></button></div>
      </div>
    </div>
  </div>`;
  const root=el.querySelector('.ns'),v1=root.querySelector('.ns-v1'),v2=root.querySelector('.ns-v2'),player=root.querySelector('.ns-player');
  const bPrev=root.querySelector('[data-c=prev]'),bPlay=root.querySelector('[data-c=play]'),bNext=root.querySelector('[data-c=next]');
  const progT=root.querySelector('.ns-prog-t'),progB=root.querySelector('.ns-prog-b i'),dwell=root.querySelector('.ns-dwell');
  let C=null,reached=1,act=1;
  const hooks={emit(ev){if(C)C.event(ev)}};
  const api=(name==='financieel'?financieel:vastgoed)(v2,hooks);
  const def=(name==='financieel'?storyDefB:storyDefA)(api);
  const N=def.steps.length;
  root.querySelector('.ns-reset').addEventListener('click',()=>{stopPlay();if(C)C.stop();story(el,name)});
  root.querySelector('.ns-steps').addEventListener('click',e=>{const b=e.target.closest('[data-goact]');if(b&&!b.disabled&&!busy)setAct(+b.dataset.goact)});

  // ----- stap 1 -----
  v1.innerHTML=`<ol class="ns-list2">${def.steps.map((s,n)=>`<li><button type="button" data-s="${n}" disabled><span class="ns-num">${n+1}</span><span class="ns-l-t">${s.t}</span></button></li>`).join('')}</ol>
    <div class="ns-detail"><div class="ns-cts">${def.counters.map(([k,l,v])=>`<div class="ns-ct" data-k="${k}"><b>${v||0}</b><span>${l}</span></div>`).join('')}<div class="ns-ct t"><b class="ns-t">0 s</b><span>Tijd</span></div></div>
    <div class="ns-pane"><div class="ns-pane-in"></div></div></div>`;
  const pane=v1.querySelector('.ns-pane'),paneIn=v1.querySelector('.ns-pane-in'),tEl=v1.querySelector('.ns-t');
  let view=-1,ran=0,busy=false,playing=false,elapsed=0,dwellT=null;const rec=[];
  function swap(html,cb){paneIn.classList.add('out');setTimeout(()=>{paneIn.innerHTML=html;pane.scrollTop=0;paneIn.classList.remove('out');if(cb)cb()},170)}
  const stepHead=(n,live)=>{const s=def.steps[n];return `<div class="ns-sh"><span class="ns-ic">${ic(s.i)}</span><div><small>Stap ${n+1} van ${N}</small><b>${s.t}</b>${rec[n]?`<em>✓ ${rec[n].sum}</em>`:live?'<em class="run">Nimbr is bezig…</em>':''}</div></div>${say(av,s.say)}<ul class="ns-items">${rec[n]?rec[n].items:''}</ul>`};
  function showView(){
    if(view===-1)swap(`<div class="ns-intro">${say(av,def.intro,'intro')}<p class="ns-hint">Klik op <b>Start</b> om stap voor stap mee te kijken, of op <b>Afspelen</b> om het rustig te laten lopen.</p></div>`);
    else if(view<N)swap(stepHead(view,false));
    else swap(winHtml());
    syncList();syncCtrl();
  }
  function winHtml(){const w=def.win(),sec=Math.max(1,Math.round(elapsed/1000));
    return `<div class="ns-winb">${say(av,'<b>'+w.title+'</b> Zullen we kijken wat dit oplevert?')}<div class="ns-win-g">${w.stats.map(([n,l])=>`<div><b>${n}</b><span>${l}</span></div>`).join('')}</div>
      <div class="na-vs"><span><small>Handmatig</small><b>${w.manual}</b></span><span class="na-vs-ar">→</span><span><small>Met Nimbr</small><b>${sec} seconden</b></span></div><p class="ns-note">${w.note}</p></div>`}
  function syncList(){v1.querySelectorAll('.ns-list2 button').forEach((b,n)=>{b.classList.toggle('ok',n<ran);b.classList.toggle('on',n===view);b.classList.toggle('run',busy&&n===view);b.disabled=busy||n>=ran||n===view})}
  async function runStep(n){
    busy=true;view=n;syncList();syncCtrl();
    await new Promise(r=>swap(stepHead(n,true),r));
    const ul=paneIn.querySelector('.ns-items');const t0=Date.now();const tick=setInterval(()=>{tEl.textContent=Math.round((elapsed+Date.now()-t0)/1000)+' s'},250);
    await W(playing?900:600);
    const x={add:async(html,kind,ms)=>{const it=document.createElement('li');it.className='ns-it '+(kind||'');it.innerHTML=`<span class="ns-dot"></span><span>${html}</span>`;ul.append(it);
        if(pane.scrollHeight>pane.clientHeight)pane.scrollTo({top:pane.scrollHeight,behavior:reduce?'auto':'smooth'});await W(Math.max(ms||0,playing?750:520))},
      set:(k,v)=>{const c=v1.querySelector(`.ns-ct[data-k="${k}"] b`);if(c){c.textContent=v;c.parentNode.classList.remove('bump');void c.offsetWidth;c.parentNode.classList.add('bump')}}};
    const sum=await def.steps[n].run(x);
    clearInterval(tick);elapsed+=Date.now()-t0;tEl.textContent=Math.round(elapsed/1000)+' s';
    rec[n]={items:ul.innerHTML,sum};ran=Math.max(ran,n+1);
    const em=paneIn.querySelector('.ns-sh em');if(em){em.className='';em.textContent='✓ '+sum}
    busy=false;if(ran===N){reached=Math.max(reached,2);syncBar()}
    syncList();syncCtrl();
    if(playing)scheduleNext(def.steps[n].say.length);
  }
  function scheduleNext(len){
    const ms=Math.min(5200,Math.max(2600,1600+len*22));
    dwell.classList.add('on');const i=dwell.querySelector('i');i.style.transition='none';i.style.width='0';void i.offsetWidth;i.style.transition=`width ${ms}ms linear`;i.style.width='100%';
    dwellT=setTimeout(()=>{dwell.classList.remove('on');if(playing)next(true)},ms);
  }
  function stopPlay(){playing=false;clearTimeout(dwellT);dwell.classList.remove('on');syncCtrl()}
  function next(auto){
    if(busy)return;if(!auto)stopPlay();clearTimeout(dwellT);
    if(view<ran-1){view++;showView();if(playing)scheduleNext(def.steps[view].say.length);return}
    if(view===N-1&&ran===N||view>=N&&ran===N){if(view<N){view=N;showView();stopPlay();return}return setAct(2)}
    if(ran<N)runStep(ran);
  }
  function prev(){if(busy||view<=0)return;stopPlay();view=Math.min(view-1,ran-1);showView()}
  function togglePlay(){if(playing){stopPlay();return}playing=true;syncCtrl();if(!busy)next(true)}
  v1.querySelector('.ns-list2').addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b||busy)return;stopPlay();view=+b.dataset.s;showView()});

  // ----- bedieningsbalk -----
  function syncCtrl(){
    bPlay.hidden=act!==1||view>=N;bPrev.hidden=act===3&&!C;
    if(act===1){
      const done=ran===N;
      progT.innerHTML=view===-1?'Klaar om te starten':view<N?`<b>Stap ${view+1} van ${N}</b> · ${def.steps[view].t}`:'<b>Klaar!</b> De hele run is afgerond.';
      progB.style.width=(Math.max(0,view===N?N:view+(busy?0.5:1))/N*100)+'%';
      bPrev.disabled=busy||view<=0;
      bPlay.innerHTML=playing?'❚❚ <span>Pauze</span>':'▶ <span>Afspelen</span>';bPlay.disabled=done&&view>=N-1&&!busy?false:false;
      if(done&&view===N-1&&!busy)bPlay.hidden=true;
      bNext.disabled=busy;
      bNext.innerHTML=busy?'Nimbr is bezig…':view===-1?'Start →':view<ran-1?'Volgende →':ran<N?`Volgende stap →`:view<N?'Bekijk de winst →':'Bekijk het resultaat →';
    }
  }
  function coachCtrl(st){
    const t=st.tip;const last=st.i===st.n-1;
    if(st.end){progT.innerHTML=act===3?'<b>Klaar!</b> Klik gerust zelf verder rond.':'<b>Klaar</b>';progB.style.width='100%';bPrev.hidden=true;bNext.hidden=act===3;bNext.innerHTML='Zelf proberen →';return}
    bPrev.hidden=false;bNext.hidden=false;bPrev.disabled=st.i===0;bNext.disabled=false;
    progB.style.width=((st.i+1)/st.n*100)+'%';
    if(act===2){progT.innerHTML=`<b>Uitleg ${st.i+1} van ${st.n}</b> · het dashboard na de run`;bNext.innerHTML=last?'Zelf proberen →':'Volgende →'}
    else{progT.innerHTML=`<b>Opdracht ${st.i+1} van ${st.n}</b> · ${t.task?'doe het zelf in het scherm':''}`;bNext.innerHTML='Sla over →'}
  }
  bPrev.addEventListener('click',()=>{if(act===1)prev();else if(C)C.prev()});
  bPlay.addEventListener('click',()=>{if(act===1)togglePlay()});
  bNext.addEventListener('click',()=>{if(act===1)next(false);else if(act===2){if(!C)return setAct(3);if(C.i>=def.tips2.length-1)setAct(3);else C.next()}else if(C)C.next()});
  player.addEventListener('keydown',e=>{if(e.target.closest('input,select,textarea'))return;if(e.key==='ArrowRight'){e.preventDefault();bNext.click()}else if(e.key==='ArrowLeft'){e.preventDefault();bPrev.click()}else if(e.key===' '&&act===1){e.preventDefault();togglePlay()}});

  // ----- stappen 2 en 3 -----
  const ctaHref=n=>{const a=document.querySelectorAll('.dm-after .btn')[n||0];return a?a.getAttribute('href'):'#contact'};
  let act3Init=false;
  function syncBar(){root.querySelectorAll('.ns-steps li').forEach(li=>{const n=+li.dataset.a;li.classList.toggle('on',n===act);li.classList.toggle('ok',n<reached&&n!==act);li.querySelector('button').disabled=n>reached||busy})}
  function setAct(n){
    stopPlay();if(C){C.stop();C=null}
    act=n;root.dataset.act=n;reached=Math.max(reached,n);syncBar();
    v1.hidden=n!==1;v2.hidden=n===1;bPrev.hidden=false;bNext.hidden=false;bPlay.hidden=n!==1;
    if(n===1){showView();return}
    api.lock(false);api.go(name==='financieel'?'tx':'dash');api.main.scrollTop=0;
    if(n===2){api.lock(true);C=coach(api,av,def.tips2,{onChange:coachCtrl,onClose:()=>{C=null;api.lock(false);progT.innerHTML='Uitleg gesloten · kijk gerust rond';bPrev.hidden=true;bNext.innerHTML='Zelf proberen →'}})}
    else{if(!act3Init){act3Init=true;if(def.onAct3)def.onAct3()}
      C=coach(api,av,def.tips3,{onChange:coachCtrl,onClose:()=>{C=null;progT.innerHTML='Klik gerust zelf verder rond';bPrev.hidden=true;bNext.hidden=true},
        endHtml:`<p>${def.endText} <b>Benieuwd wat ik voor jouw bedrijf kan overnemen?</b></p><div class="nc-f end"><a class="nc-next" href="${ctaHref(0)}">Plan een vrijblijvend gesprek →</a><a class="nc-skip" href="${ctaHref(1)}">Vraag een scan aan</a><button type="button" class="nc-skip" data-nc="end">Zelf verder klikken</button></div>`})}
  }
  showView();syncBar();
}

window.NimbrDemo={mount(el,name){story(el,name)}};
})();

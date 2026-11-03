/* Google Analytics 4 met toestemming (Consent Mode v2). Er wordt niets geladen of gemeten voordat de bezoeker "Accepteren" kiest. */
(function () {
  var ID = 'G-W6MR60BQ4Y', KEY = 'nimbr-cookies', loaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function load() {
    if (loaded) return;
    loaded = true;
    window['ga-disable-' + ID] = false;
    gtag('js', new Date());
    gtag('config', ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }
  function clearCookies() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0) {
        ['', '; domain=' + host, '; domain=.' + host, '; domain=www.' + host].forEach(function (d) {
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }
  function accept() { set('granted'); gtag('consent', 'update', { analytics_storage: 'granted' }); load(); }
  function decline() { set('denied'); window['ga-disable-' + ID] = true; gtag('consent', 'update', { analytics_storage: 'denied' }); clearCookies(); }

  if (get() === 'granted') accept();

  function banner() {
    var b = document.getElementById('cookiebar');
    if (b) { b.hidden = false; return; }
    b = document.createElement('div');
    b.id = 'cookiebar';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookie-instellingen');
    b.innerHTML = '<p><b>Mogen we meten hoe de site wordt gebruikt?</b> Dat helpt ons de site te verbeteren. We gebruiken daarvoor Google Analytics, alleen als jij dat goedvindt. <a href="privacy.html#cookies">Lees meer</a></p>' +
      '<div class="cb-act"><button type="button" class="btn" data-a="y">Accepteren</button><button type="button" class="btn ghostb" data-a="n">Alleen noodzakelijke</button></div>';
    b.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-a]');
      if (!a) return;
      if (a.getAttribute('data-a') === 'y') accept(); else decline();
      b.hidden = true;
    });
    document.body.appendChild(b);
  }
  function init() {
    var copy = document.querySelector('footer .copy span:last-child');
    if (copy) {
      var l = document.createElement('a');
      l.href = '#cookie-instellingen';
      l.style.color = 'inherit';
      l.textContent = 'Cookie-instellingen';
      l.addEventListener('click', function (e) { e.preventDefault(); banner(); });
      copy.appendChild(document.createTextNode(' · '));
      copy.appendChild(l);
    }
    if (!get()) banner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

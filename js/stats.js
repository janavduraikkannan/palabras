/* SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 janavduraikkannan and Linguae contributors */
/* ---------- Anonymous visitor counter ----------
   Sends a random per-browser ID and this site's name, at most once per site per day, so the owner can count how many
   people use the sites. The four sites share one browser storage area, so the same random ID (lang-vid) is used on all
   of them and a person who uses two sites is counted once overall. The ID is not tied to any account, name or progress.
   The counter stores only the day, the site name and a salted hash of the ID (see stats/README.md and PRIVACY.md).
   Nothing is sent when the browser asks not to be tracked (Global Privacy Control or Do Not Track), and any failure
   is silent: the practice sites never wait on this. */
(function () {
  var STATS_URL = 'https://verba-stats.janav-durai.workers.dev';
  function run() {
    try {
      if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') return;
      var site = (typeof SITE !== 'undefined' && SITE.id) || '';
      if (!site) return;
      var today = new Date().toISOString().slice(0, 10), pingKey = 'lang-ping-' + site;
      var id = localStorage.getItem('lang-vid');
      if (!/^[0-9a-f]{32}$/.test(id || '')) {
        var b = new Uint8Array(16); crypto.getRandomValues(b);
        id = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
        localStorage.setItem('lang-vid', id);
        if (localStorage.getItem('lang-vid') !== id) return; // storage is not keeping values: a new ID every visit would inflate the count
      }
      if (localStorage.getItem(pingKey) === today) return;
      // text/plain keeps this a simple request (no CORS preflight); the counter reads the body as JSON either way
      fetch(STATS_URL + '/hit', { method: 'POST', keepalive: true, credentials: 'omit', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ id: id, site: site }) })
        .then(function (r) { if (r.ok) { try { localStorage.setItem(pingKey, today); } catch (e) {} } }, function () {});
    } catch (e) {}
  }
  function later() { (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(run); }
  if (document.readyState === 'complete') later(); else addEventListener('load', later);
})();

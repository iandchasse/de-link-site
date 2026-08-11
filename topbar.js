/* =====================================================================
   de-link shared top bar
   ---------------------------------------------------------------------
   Single source of truth for the persistent Windows-style "links" bar.
   Include on any page with:  <script src="topbar.js"></script>
   (do NOT include on viewer.html — it is embedded in an iframe).

   Injects: its own <style>, the fixed <nav> bar, an in-flow spacer to
   push page content down, and wires the compact mailing-list form.
   ===================================================================== */
(function () {
  var KIT_ACTION = 'https://app.kit.com/forms/9627377/subscriptions';

  var CSS = '\
#topbar {\
  position: fixed; top: 0; left: 0; right: 0; z-index: 3000;\
  height: 34px; display: flex; align-items: center; gap: 1px;\
  padding: 0 6px;\
  background: linear-gradient(180deg,#f6f5f0 0%,#e7e4d9 47%,#d8d4c6 53%,#cdc9ba 100%);\
  border-bottom: 1px solid #808080;\
  box-shadow: inset 0 1px 0 #ffffff, 0 1px 4px rgba(0,0,0,0.55);\
  font-family: Tahoma, "MS Sans Serif", Geneva, sans-serif;\
  user-select: none;\
}\
#topbar-spacer { width: 100%; height: 34px; flex: 0 0 34px; }\
#topbar .grip {\
  width: 3px; height: 20px; margin: 0 6px 0 1px;\
  border-left: 1px solid #ffffff; border-right: 1px solid #a3a099; flex-shrink: 0;\
}\
#topbar .tb-label-links {\
  font-size: 11px; font-weight: bold; color: #4a4a4a;\
  letter-spacing: 0.3px; margin: 0 7px 0 2px; white-space: nowrap;\
}\
#topbar .tb-sep {\
  width: 2px; height: 20px; margin: 0 4px;\
  border-left: 1px solid #a3a099; border-right: 1px solid #ffffff; flex-shrink: 0;\
}\
#topbar .tb-btn {\
  display: inline-flex; align-items: center; gap: 6px; height: 24px;\
  padding: 0 9px; text-decoration: none; color: #232323;\
  font-size: 11px; font-weight: bold; letter-spacing: 0.2px;\
  border: 1px solid transparent; background: transparent; cursor: pointer; white-space: nowrap;\
}\
#topbar .tb-btn svg { width: 15px; height: 15px; flex-shrink: 0; fill: currentColor; }\
#topbar .tb-patreon svg { color: #d94b3b; }\
#topbar .tb-kofi    svg { color: #e8504d; }\
#topbar .tb-discord svg { color: #5865F2; }\
#topbar .tb-github  svg { color: #24292f; }\
#topbar .tb-btn:hover {\
  border-top-color: #ffffff; border-left-color: #ffffff;\
  border-bottom-color: #808080; border-right-color: #808080;\
  background: rgba(255,255,255,0.4);\
}\
#topbar .tb-btn:active {\
  border-top-color: #808080; border-left-color: #808080;\
  border-bottom-color: #ffffff; border-right-color: #ffffff;\
  background: rgba(0,0,0,0.07);\
}\
#topbar .tb-mail { display: flex; align-items: center; gap: 5px; margin-left: auto; padding-left: 8px; }\
#topbar .tb-mail-label { font-size: 11px; font-weight: bold; color: #4a4a4a; white-space: nowrap; }\
#topbar .tb-mail input[type=email] {\
  font-family: Tahoma, "MS Sans Serif", sans-serif; font-size: 11px;\
  border: 2px solid; border-top-color: #808080; border-left-color: #808080;\
  border-bottom-color: #ffffff; border-right-color: #ffffff;\
  background: #ffffff; color: #111; height: 22px; padding: 0 6px; width: 160px; outline: none;\
}\
#topbar .tb-mail input[type=email]::placeholder { color: #9a988f; }\
#topbar .tb-mail button {\
  font-family: Tahoma, "MS Sans Serif", sans-serif; font-size: 11px; font-weight: bold;\
  color: #111; background: linear-gradient(180deg,#f2f0ea,#dcd8cc);\
  border: 2px solid; border-top-color: #ffffff; border-left-color: #ffffff;\
  border-bottom-color: #808080; border-right-color: #808080;\
  height: 22px; padding: 0 11px; cursor: pointer;\
}\
#topbar .tb-mail button:hover { background: linear-gradient(180deg,#ffffff,#e4e0d4); }\
#topbar .tb-mail button:active {\
  border-top-color: #808080; border-left-color: #808080;\
  border-bottom-color: #ffffff; border-right-color: #ffffff;\
}\
#topbar .tb-mail-done { font-size: 11px; font-weight: bold; color: #0a640a; white-space: nowrap; margin-left: auto; padding-left: 8px; }\
@media (max-width: 760px) {\
  #topbar .tb-mail-label { display: none; }\
  #topbar .tb-mail input[type=email] { width: 120px; }\
}\
@media (max-width: 560px) {\
  #topbar .tb-label-links, #topbar .tb-sep { display: none; }\
  #topbar .tb-btn .tb-label { display: none; }\
  #topbar .tb-btn { padding: 0 9px; }\
}\
@media (max-width: 470px) {\
  #topbar .tb-mail { display: none; }\
}';

  var HTML = '\
<nav id="topbar" aria-label="site links">\
  <span class="grip" aria-hidden="true"></span>\
  <span class="tb-label-links">links</span>\
  <span class="tb-sep" aria-hidden="true"></span>\
  <a href="https://www.patreon.com/iandchasse" target="_blank" rel="noopener" class="tb-btn tb-patreon">\
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 2h7.5C14.9 2 18 5.4 18 9.5S14.9 17 9.5 17H6v5H2V2z"/></svg>\
    <span class="tb-label">patreon</span>\
  </a>\
  <a href="https://ko-fi.com/iandchasse" target="_blank" rel="noopener" class="tb-btn tb-kofi">\
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h14l-1.5 12H4.5L3 8zm14 2h1.5c1.7 0 2.5.9 2.5 2.2 0 1.3-.8 2.2-2.5 2.2H17v-4.4zM10 11c-.6-1.2.1-2 1-2 .9 0 1.6.8 1 2l-1 1.8L10 11z"/></svg>\
    <span class="tb-label">ko-fi</span>\
  </a>\
  <a href="https://discord.gg/zCnKFt4Y4P" target="_blank" rel="noopener" class="tb-btn tb-discord">\
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>\
    <span class="tb-label">discord</span>\
  </a>\
  <a href="https://github.com/iandchasse/de-link" target="_blank" rel="noopener" class="tb-btn tb-github">\
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>\
    <span class="tb-label">github</span>\
  </a>\
  <form id="tb-mail-form" class="tb-mail" action="' + KIT_ACTION + '" method="post">\
    <span class="tb-mail-label">mailing list</span>\
    <input type="email" name="email_address" placeholder="your@email.com" required aria-label="email address">\
    <button type="submit">subscribe</button>\
  </form>\
</nav>\
<div id="topbar-spacer"></div>';

  function init() {
    if (document.getElementById('topbar')) return; // guard against double-inject

    var style = document.createElement('style');
    style.id = 'topbar-styles';
    style.textContent = CSS;
    document.head.appendChild(style);

    // ---- Windows 98 scrollbar (main site pages, not the sim/viewer) ----
    // WebKit/Blink get the full treatment: dithered silver track, raised
    // beveled thumb, and arrow buttons. Firefox falls back to a gray thumb.
    (function () {
      function svgUrl(w, h, inner) {
        var s = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w +
                "' height='" + h + "'>" + inner + "</svg>";
        return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
      }
      // 2x2 silver/white checker = the classic Win98 track stipple
      var track = svgUrl(2, 2,
        "<rect width='2' height='2' fill='#c0c0c0'/>" +
        "<rect width='1' height='1' fill='#ffffff'/>" +
        "<rect x='1' y='1' width='1' height='1' fill='#ffffff'/>");
      function arw(d) { return svgUrl(16, 16, "<path d='" + d + "' fill='#000000'/>"); }
      var up = arw('M8 5L12 10H4z'), down = arw('M4 6H12L8 11z'),
          left = arw('M11 4V12L5 8z'), right = arw('M5 4V12L11 8z');
      // Authentic Win98 double bevel: white/black outer ring + light-gray/dark
      // inner ring, no flat border (the 98.css raised formula).
      var raised =
        'box-shadow:inset -1px -1px #0a0a0a,inset 1px 1px #ffffff,' +
        'inset -2px -2px #808080,inset 2px 2px #dfdfdf;';
      var pressed =
        'box-shadow:inset -1px -1px #ffffff,inset 1px 1px #0a0a0a,' +
        'inset -2px -2px #dfdfdf,inset 2px 2px #808080;';
      var css =
        '::-webkit-scrollbar{width:16px;height:16px;}' +
        '::-webkit-scrollbar-track{background:#c0c0c0 ' + track + ' repeat;background-size:2px 2px;}' +
        '::-webkit-scrollbar-corner{background:#c0c0c0;}' +
        '::-webkit-scrollbar-thumb{background:#c0c0c0;' + raised + '}' +
        '::-webkit-scrollbar-button:single-button{display:block;width:16px;height:16px;' +
          'background:#c0c0c0;background-repeat:no-repeat;background-position:center;' + raised + '}' +
        '::-webkit-scrollbar-button:single-button:active{' + pressed + 'background-position:calc(50% + 1px) calc(50% + 1px);}' +
        '::-webkit-scrollbar-button:single-button:vertical:decrement{background-image:' + up + ';}' +
        '::-webkit-scrollbar-button:single-button:vertical:increment{background-image:' + down + ';}' +
        '::-webkit-scrollbar-button:single-button:horizontal:decrement{background-image:' + left + ';}' +
        '::-webkit-scrollbar-button:single-button:horizontal:increment{background-image:' + right + ';}' +
        '@supports not selector(::-webkit-scrollbar){html{scrollbar-width:auto;scrollbar-color:#c0c0c0 #dfdfdf;}}';
      var sb = document.createElement('style');
      sb.id = 'win98-scrollbar';
      sb.textContent = css;
      document.head.appendChild(sb);
    })();

    var holder = document.createElement('div');
    holder.innerHTML = HTML;
    var nodes = Array.prototype.slice.call(holder.childNodes);
    for (var i = nodes.length - 1; i >= 0; i--) {
      document.body.insertBefore(nodes[i], document.body.firstChild);
    }

    var form = document.getElementById('tb-mail-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = form.querySelector('input[type=email]').value;
        // no-cors: Kit receives the POST; we don't need to read the response
        fetch(form.action, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'email_address=' + encodeURIComponent(email)
        });
        var done = document.createElement('span');
        done.className = 'tb-mail-done';
        done.textContent = '✓ you’re on the list';
        form.parentNode.replaceChild(done, form);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// =====================================================
// 58. Phoenix Group — SPOLOČNÉ JADRO (jediný zdroj)
// Supabase klient, volanie funkcií, prihlasovací chip v lište.
// Konštanty berie z config.js (musí byť načítaný pred týmto súborom).
// =====================================================
(function(){
  // Bezpečný výpis textu do HTML (ochrana proti XSS) — VŠETKY dáta z DB/Discordu
  // vkladané cez innerHTML musia ísť cez esc().
  window.esc = function (s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[&<>"'`]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" }[c];
    });
  };
  // Povolí len obrázky z Discord CDN (avatary); inak vráti prázdny reťazec.
  window.pgImgUrl = function (u) {
    u = String(u || "");
    return /^https:\/\/(cdn|media)\.discordapp\.(com|net)\/[^"'<>\s]+$/.test(u) ? u : "";
  };
  // ---- Spoločný toast (úspech / chyba) + prístupnostné štýly pre všetky stránky ----
  var TOAST_CSS = ""
    + "#pg-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);opacity:0;pointer-events:none;"
    + "z-index:9999;max-width:min(92vw,560px);padding:11px 18px;border-radius:6px;font-family:'Barlow',sans-serif;font-size:14.5px;"
    + "background:#2C3522;border:1px solid #9C9C74;color:#E8E8CC;box-shadow:0 10px 30px rgba(0,0,0,.45);transition:opacity .2s,transform .2s}"
    + "#pg-toast.zobraz{opacity:1;transform:translateX(-50%) translateY(0)}"
    + "#pg-toast.chyba{border-color:#C98B7A;color:#F0D6CC}"
    + ":focus-visible{outline:2px solid #C2C29E !important;outline-offset:2px}"
    + "@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;scroll-behavior:auto !important}}";
  function vlozCss() {
    if (document.getElementById("pg-core-css")) return;
    var st = document.createElement("style"); st.id = "pg-core-css"; st.textContent = TOAST_CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  vlozCss();
  var toastT = null;
  function toastEl() {
    var el = document.getElementById("pg-toast");
    if (!el) {
      el = document.createElement("div"); el.id = "pg-toast";
      el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite");
      (document.body || document.documentElement).appendChild(el);
    }
    return el;
  }
  // pgToast(text) = zelený úspech; pgChyba(text) = červená chyba (aj do konzoly)
  window.pgToast = function (text, jeChyba) {
    var el = toastEl();
    el.textContent = (jeChyba ? "\u2715 " : "\u2713 ") + (text || (jeChyba ? "Nepodarilo sa." : "Uložené."));
    el.className = "zobraz" + (jeChyba ? " chyba" : "");
    el.setAttribute("role", jeChyba ? "alert" : "status");
    clearTimeout(toastT); toastT = setTimeout(function(){ el.className = ""; }, jeChyba ? 6000 : 2200);
  };
  window.pgChyba = function (text) {
    try { console.error("[58PG] " + text); } catch (e) {}
    window.pgToast(text, true);
  };
  // text chyby z odpovede/výnimky
  window.pgChybaText = function (v) {
    if (!v) return "Server neodpovedal.";
    if (typeof v === "string") return v;
    if (v.error) return String(v.error);
    if (v.message) return String(v.message);
    return "Neznáma chyba.";
  };

  window.pgSupaKlient = window.pgSupaKlient || function () {
    if (!window.__pgSupa && window.supabase) {
      window.__pgSupa = window.supabase.createClient(SUPA_URL, SUPA_ANON, {
        auth: { storageKey: "pg58_auth", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    return window.__pgSupa || null;
  };
  var MENU = [
    ["Môj profil", "clenska-zona.html#profil"],
    ["Nástenka", "clenska-zona.html"],
    ["Členovia", "clenska-zona.html#orbat"],
    ["Kalendár", "clenska-zona.html#kalendar"],
    ["Archív", "clenska-zona.html#archiv"]
  ];
  function odkaz() {
    var a = document.querySelectorAll('a[href="clenska-zona.html"]');
    for (var i = 0; i < a.length; i++) {
      var t = (a[i].textContent || "").trim();
      if (t === "Prihlásiť" || t === "Členská zóna") return a[i];
    }
    return null;
  }
  function kes() { try { return JSON.parse(localStorage.getItem("pg_ucet") || "null"); } catch (e) { return null; } }
  window.pgNavChip = function () {
    var u = kes(), a = odkaz();
    if (!a) return;
    // neprihlásený → nechaj "Prihlásiť"
    if (!u) { if (document.getElementById("pg-nav-wrap")) location.reload(); return; }
    if (document.getElementById("pg-nav-wrap")) return;
    // obal (banner + dropdown)
    var wrap = document.createElement("div");
    wrap.id = "pg-nav-wrap";
    wrap.style.cssText = "position:relative;display:inline-block;";
    var chip = document.createElement("a");
    chip.href = "clenska-zona.html";
    chip.id = "pg-nav-chip";
    chip.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;border:1px solid #4A5A38;background:#2C3522;border-radius:999px;padding:4px 12px 4px 4px;text-decoration:none;";
    var h = "";
    if (window.pgImgUrl(u.avatar)) h += '<img src="' + esc(window.pgImgUrl(u.avatar)) + '" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;background:#242B1C;">';
    h += '<span style="font-family:\'Staatliches\',sans-serif;font-size:13px;letter-spacing:1px;color:#E8E8CC;">' + esc(u.nick || "") + '</span>';
    h += '<span style="font-size:10px;letter-spacing:1px;padding:1px 8px;border-radius:999px;background:rgba(156,156,116,.2);border:1px solid #9C9C74;color:#C2C29E;">' + (u.rola === "velitel" ? "Veliteľ" : "Člen") + '</span>';
    chip.innerHTML = h;
    // dropdown
    var dd = document.createElement("div");
    dd.style.cssText = "position:absolute;right:0;top:calc(100% + 6px);min-width:190px;background:#2C3522;border:1px solid #4A5A38;border-radius:8px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,.45);display:none;z-index:200;";
    var polozky = "";
    var naClenskej = location.pathname.indexOf("clenska-zona") > -1;
    MENU.forEach(function (m) {
      polozky += '<a href="' + m[1] + '" data-hash="' + (m[1].split("#")[1] || "") + '" style="display:block;padding:8px 12px;border-radius:5px;text-decoration:none;color:#D8D8C0;font-size:13.5px;font-family:\'Barlow\',sans-serif;" onmouseover="this.style.background=\'#35402A\'" onmouseout="this.style.background=\'transparent\'">' + m[0] + '</a>';
    });
    polozky += '<div style="height:1px;background:#4A5A38;margin:6px 4px;"></div>';
    polozky += '<button id="pg-odhlasit" style="width:100%;text-align:left;padding:8px 12px;border:none;border-radius:5px;background:transparent;color:#C98B7A;font-size:13.5px;font-family:\'Barlow\',sans-serif;cursor:pointer;" onmouseover="this.style.background=\'#3a2a26\'" onmouseout="this.style.background=\'transparent\'">Odhlásiť sa</button>';
    dd.innerHTML = polozky;
    wrap.appendChild(chip);
    wrap.appendChild(dd);
    a.parentNode.insertBefore(wrap, a.nextSibling);
    a.style.display = "none";
    // hover otvára/zatvára
    var t;
    function open(){ clearTimeout(t); dd.style.display = "block"; }
    function close(){ t = setTimeout(function(){ dd.style.display = "none"; }, 220); }
    wrap.addEventListener("mouseenter", open);
    wrap.addEventListener("mouseleave", close);
    if (naClenskej) {
      Array.prototype.forEach.call(dd.querySelectorAll("a[data-hash]"), function (el) {
        el.addEventListener("click", function (ev) {
          ev.preventDefault();
          var hh = el.getAttribute("data-hash");
          if (location.hash.replace("#","") === hh) { dd.style.display = "none"; return; }
          location.hash = hh ? ("#" + hh) : "";
          location.reload();
        });
      });
    }
    dd.querySelector("#pg-odhlasit").onclick = function () {
      var hotovo = function () {
        try { localStorage.removeItem("pg_ucet"); localStorage.removeItem("pg_rola"); } catch (e) {}
        location.href = "index.html";
      };
      var k = window.pgSupaKlient();
      if (k) { k.auth.signOut().then(hotovo, hotovo); } else { hotovo(); }
    };
  };
  function strazca() {
    var nav = document.querySelector("nav");
    if (!nav || nav.__pgStraz) return;
    nav.__pgStraz = true;
    new MutationObserver(function () {
      if (kes() && !document.getElementById("pg-nav-wrap")) window.pgNavChip();
    }).observe(nav, { childList: true, subtree: true });
  }
  function verziaDoPaticky() {
    if (document.getElementById("pg-verzia")) return;
    var vsetky = document.querySelectorAll("footer *, footer");
    for (var i = 0; i < vsetky.length; i++) {
      var el = vsetky[i];
      if (el.children.length === 0 && (el.textContent || "").indexOf("\u00a9 2020") > -1) {
        var s = document.createElement("span");
        s.id = "pg-verzia";
        s.textContent = " \u00b7 v" + PG_VERZIA;
        el.appendChild(s);
        return;
      }
    }
  }
  function start() {
    if (!kes()) document.documentElement.classList.remove("pg-auth");
    strazca();
    if (kes()) window.pgNavChip();
    verziaDoPaticky();
    [300, 900, 2000].forEach(function (t) { setTimeout(function(){ strazca(); verziaDoPaticky(); if (kes() && !document.getElementById("pg-nav-wrap")) window.pgNavChip(); }, t); });
  }
  // Spoločný volací pomocník na Edge Functions (jednotné volanie + chyby)
  var PG_TIMEOUT_MS = 15000;
  // Volá sa, keď server/klient hlási vypršané prihlásenie. Stránka si môže zavesiť vlastnú reakciu
  // (členská zóna ukáže overlay); inak sa iba vymaže lokálny účet a ponúkne prihlásenie.
  window.pgSessionVyprsala = function () {
    if (window.__pgVyprsaloHlasene) return; window.__pgVyprsaloHlasene = true;
    var bolPrihlaseny = !!kes();
    try { localStorage.removeItem("pg_ucet"); localStorage.removeItem("pg_rola"); } catch (e) {}
    if (!bolPrihlaseny) return; // nikdy nebol prihlásený → nič nehlásiť
    if (typeof window.pgNaVyprsanie === "function") { try { window.pgNaVyprsanie(); return; } catch (e) {} }
    window.pgChyba("Prihlásenie vypršalo — prihlás sa znova.");
  };
  window.pgVolaj = async function (nazov, telo) {
    var ctrl = (typeof AbortController === "function") ? new AbortController() : null;
    var casovac = ctrl ? setTimeout(function(){ ctrl.abort(); }, PG_TIMEOUT_MS) : null;
    try {
      var k = window.pgSupaKlient ? window.pgSupaKlient() : null;
      if (!k) return { error: "Klient nie je pripravený" };
      var sess = (await k.auth.getSession()).data.session;
      if (!sess) { window.pgSessionVyprsala(); return { error: "Nie si prihlásený", vyprsalo: true }; }
      var r = await fetch(SUPA_URL + "/functions/v1/" + nazov, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sess.access_token, "apikey": SUPA_ANON },
        body: JSON.stringify(telo || {}),
        signal: ctrl ? ctrl.signal : undefined
      });
      if (r.status === 401) { window.pgSessionVyprsala(); return { error: "Prihlásenie vypršalo", vyprsalo: true }; }
      var v = null;
      try { v = await r.json(); } catch (e) { v = null; }
      if (!v) return { error: "Server vrátil neplatnú odpoveď (" + r.status + ")" };
      if (!r.ok && !v.error) v.error = "Chyba servera (" + r.status + ")";
      return v;
    } catch (e) {
      if (e && e.name === "AbortError") return { error: "Server neodpovedá (časový limit " + (PG_TIMEOUT_MS/1000) + " s)." };
      return { error: String(e && e.message || e) };
    } finally { if (casovac) clearTimeout(casovac); }
  };

  // Skorý štart: prihlásený používateľ dostane chip hneď, ako parser vytvorí lištu —
  // bez čakania na koniec načítania stránky (odstraňuje sekundové "miznutie" pri preklikávaní).
  if (document.readyState === "loading" && kes()) {
    var skory = new MutationObserver(function () {
      strazca();
      if (!document.getElementById("pg-nav-wrap")) window.pgNavChip();
      verziaDoPaticky();
      if (document.getElementById("pg-nav-wrap") && document.getElementById("pg-verzia")) skory.disconnect();
    });
    skory.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", function () { skory.disconnect(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

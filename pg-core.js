// =====================================================
// 58. Phoenix Group — SPOLOČNÉ JADRO (jediný zdroj)
// Supabase klient, volanie funkcií, prihlasovací chip v lište.
// Konštanty berie z config.js (musí byť načítaný pred týmto súborom).
// =====================================================
(function(){
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
    if (u.avatar) h += '<img src="' + u.avatar + '" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;background:#242B1C;">';
    h += '<span style="font-family:\'Staatliches\',sans-serif;font-size:13px;letter-spacing:1px;color:#E8E8CC;">' + (u.nick || "") + '</span>';
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
  window.pgVolaj = async function (nazov, telo) {
    try {
      var k = window.pgSupaKlient ? window.pgSupaKlient() : null;
      if (!k) return { error: "Klient nie je pripravený" };
      var sess = (await k.auth.getSession()).data.session;
      if (!sess) return { error: "Nie si prihlásený" };
      var r = await fetch(SUPA_URL + "/functions/v1/" + nazov, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sess.access_token, "apikey": SUPA_ANON },
        body: JSON.stringify(telo || {})
      });
      return await r.json();
    } catch (e) { return { error: String(e) }; }
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

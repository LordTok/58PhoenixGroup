customElements.define('aliancie-mapa', class extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
<style>
:host{display:block;font-family:'Barlow',Arial,sans-serif;color:#D8D8C0}
.layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:14px}
@media (max-width:900px){.layout{grid-template-columns:1fr}}
.panel{border:1px solid #4A5A38;background:#2C3522;border-radius:6px;overflow:hidden}
.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;padding:12px 16px;border-bottom:1px solid #4A5A38;font-size:14px}
.toolbar strong{font-family:'Staatliches',sans-serif;font-weight:400;letter-spacing:2px;color:#C2C29E;font-size:15px}
.legend{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:13px;color:#A8A890}
.legend-item{display:inline-flex;align-items:center;gap:7px}
.swatch{width:13px;height:13px;border-radius:2px;border:1px solid rgba(0,0,0,.3);flex:0 0 auto}
.map-wrap{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#1C2216}
svg{display:block;width:100%;height:100%}
.country{stroke:#242B1C;stroke-width:.4;cursor:pointer;transition:filter .12s;outline:none}
.country:hover{filter:brightness(1.25)}
.country.is-selected{stroke:#E8E8CC;stroke-width:1.4;filter:brightness(1.25)}
.country:focus{outline:none}
svg:focus{outline:none}
.loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#A8A890;font-size:14px}
.tooltip{pointer-events:none;position:absolute;z-index:10;display:none;max-width:230px;border:1px solid #9C9C74;background:rgba(28,34,22,.94);color:#D8D8C0;padding:8px 10px;border-radius:6px;font-size:13.5px;line-height:1.35}
.tooltip strong{color:#C2C29E}
.sidebar{border:1px solid #4A5A38;background:#2C3522;border-radius:6px;padding:16px;min-width:0}
.eyebrow{font-family:'Staatliches',sans-serif;font-size:13px;letter-spacing:3px;color:#8A5F44}
.empty{margin-top:14px;color:#A8A890;font-size:14px}
.info{display:none;margin-top:14px}
.info-head{display:flex;gap:12px;align-items:flex-start}
.info h2{margin:0;font-family:'Staatliches',sans-serif;font-weight:400;letter-spacing:2px;font-size:20px;color:#C2C29E}
.info p{margin:4px 0 0;color:#A8A890;font-size:14px}
dl{margin:16px 0 0;display:grid;gap:12px}
dt{font-family:'Staatliches',sans-serif;color:#8A5F44;font-size:12px;letter-spacing:2px;margin-bottom:3px}
dd{margin:0;font-size:14px;line-height:1.45}
button{min-height:40px;border-radius:4px;border:1px solid #9C9C74;background:transparent;color:#C2C29E;padding:8px 12px;cursor:pointer;font-family:'Staatliches',sans-serif;letter-spacing:2px;font-size:14px}
button:hover{background:#35402A}
button:focus-visible{outline:2px solid #C2C29E;outline-offset:2px}
</style>
<div class="layout">
  <section class="panel">
    <div class="toolbar"><strong>Prejdi myšou alebo klikni na štát</strong><div class="legend" id="legenda"></div></div>
    <div class="map-wrap" id="wrap">
      <div class="loading" id="loading">Načítavam mapu…</div>
      <svg id="mapa" viewBox="0 0 1200 675" role="img" aria-label="Interaktívna geopolitická mapa sveta"></svg>
      <div class="tooltip" id="tooltip"></div>
    </div>
  </section>
  <aside class="sidebar" aria-live="polite">
    <div class="eyebrow">Informácie o štáte</div>
    <div class="empty" id="prazdne">Klikni na ľubovoľný štát na mape.</div>
    <div class="info" id="obsah">
      <div class="info-head">
        <span class="swatch" id="i-farba" style="margin-top:5px;width:16px;height:16px"></span>
        <div><h2 id="i-nazov"></h2><p id="i-blok"></p></div>
      </div>
      <dl>
        <div><dt>Postoj</dt><dd id="i-postoj"></dd></div>
        <div><dt>Poznámka</dt><dd id="i-pozn"></dd></div>
      </dl>
      <button id="zrusit" type="button" style="width:100%;margin-top:16px">Zrušiť výber</button>
    </div>
  </aside>
</div>`;

    const $ = id => root.getElementById(id);
    const skupiny = {
      nato:    { label: 'NATO',                 color: '#2d69ad', status: 'Člen / súčasť bloku NATO',      note: 'Štát je na mape vedený v modrom geopolitickom bloku.' },
      csat:    { label: 'CSAT',                 color: '#c90000', status: 'Člen / súčasť bloku CSAT',      note: 'Štát je na mape vedený ako súčasť červeného bloku CSAT.' },
      ally:    { label: 'Spojenci CSATu',       color: '#ff8300', status: 'Spojenec CSATu',                note: 'Štát je vedený ako samostatný spojenec alebo partnerská mocnosť CSATu.' },
      neutral: { label: 'Neutrálni / neznámy postoj', color: '#a6a6a6', status: 'Neutrálny alebo neurčený postoj', note: 'Na mape nie je jednoznačne zaradený k NATO ani CSAT.' }
    };
    Object.values(skupiny).forEach(g => {
      const el = document.createElement('span');
      el.className = 'legend-item';
      el.innerHTML = `<span class="swatch" style="background:${g.color}"></span><span>${g.label}</span>`;
      $('legenda').appendChild(el);
    });

    const NATO = new Set(['840','124','304','352','826','372','620','724','250','056','528','442','276','208','578','752','246','616','233','428','440','203','703','348','642','100','300','191','705','380','008','807','499','392','036','554','710','040','804']);
    const ALLY = new Set(['643']);
    const CSAT = new Set(['156','356','398','860','417','762','364','792','887','012','434','818','032','076','152','604','218','024','180','178','104','418','116','704','360','608','598','050','764','524','496','408','410','858','466']);
    const poznamky = {
      '840': 'Významná vedúca mocnosť NATO v tomto geopolitickom rozdelení.',
      '643': 'Rozsiahla eurázijská mocnosť vedená ako hlavný spojenec CSATu.',
      '156': 'Jedna z hlavných mocností bloku CSAT.',
      '036': 'Tichomorský člen modrého bloku NATO.',
      '392': 'Ázijský štát zaradený na mape k NATO.',
      '710': 'Južná Afrika je podľa pôvodnej mapy zaradená do modrého bloku.'
    };

    const id3 = d => String(d.id ?? '').padStart(3, '0');
    const skupinaPre = d => { const id = id3(d); if (NATO.has(id)) return skupiny.nato; if (ALLY.has(id)) return skupiny.ally; if (CSAT.has(id)) return skupiny.csat; return skupiny.neutral; };
    const nazov = d => d.properties?.name || `Štát ${id3(d)}`;

    let vybrany = null;
    const vyber = (node, d) => {
      if (vybrany) vybrany.classList.remove('is-selected');
      vybrany = node; if (vybrany) vybrany.classList.add('is-selected');
      const g = skupinaPre(d);
      $('prazdne').style.display = 'none'; $('obsah').style.display = 'block';
      $('i-nazov').textContent = nazov(d); $('i-blok').textContent = g.label;
      $('i-postoj').textContent = g.status; $('i-pozn').textContent = poznamky[id3(d)] || g.note;
      $('i-farba').style.background = g.color;
    };
    const zrus = () => {
      if (vybrany) vybrany.classList.remove('is-selected');
      vybrany = null; $('obsah').style.display = 'none'; $('prazdne').style.display = 'block';
    };
    $('zrusit').addEventListener('click', zrus);
    this.addEventListener('keydown', e => { if (e.key === 'Escape') zrus(); });

    (async () => {
      const [d3m, topom, worldm] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'),
        import('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'),
        import('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json/+esm')
      ]).catch(() => [null, null, null]);
      if (!d3m || !topom || !worldm) { $('loading').textContent = 'Mapu sa nepodarilo načítať.'; return; }
      $('loading').remove();
      const d3 = d3m, topo = topom, world = worldm.default;
      const krajiny = topo.feature(world, world.objects.countries).features;
      const svg = d3.select($('mapa'));
      const projekcia = d3.geoNaturalEarth1().fitExtent([[12,12],[1188,663]], { type: 'FeatureCollection', features: krajiny });
      const path = d3.geoPath(projekcia);
      const tooltip = $('tooltip'), wrap = $('wrap');
      svg.append('g').selectAll('path').data(krajiny).join('path')
        .attr('class','country').attr('d', path)
        .attr('fill', d => skupinaPre(d).color)
        .attr('tabindex', 0).attr('role','button')
        .attr('aria-label', d => `${nazov(d)}, ${skupinaPre(d).label}`)
        .on('pointerenter', function (event, d) {
          const g = skupinaPre(d);
          tooltip.innerHTML = `<strong>${nazov(d)}</strong><br><span style="opacity:.85">${g.label}</span>`;
          tooltip.style.display = 'block';
        })
        .on('pointermove', function (event) {
          const r = wrap.getBoundingClientRect();
          tooltip.style.left = Math.min(r.width - 185, Math.max(8, event.clientX - r.left + 12)) + 'px';
          tooltip.style.top  = Math.min(r.height - 60, Math.max(8, event.clientY - r.top + 12)) + 'px';
        })
        .on('pointerleave', () => { tooltip.style.display = 'none'; })
        .on('click', function (event, d) { vyber(this, d); })
        .on('focus', function (event, d) { vyber(this, d); })
        .on('keydown', function (event, d) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); vyber(this, d); }
          if (event.key === 'Escape') zrus();
        });
    })();
  }
});

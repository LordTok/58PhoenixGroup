customElements.define('aliancie-mapa', class extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
<style>
:host{display:block;font-family:'Barlow',Arial,sans-serif;color:#D8D8C0}
.panel{border:1px solid #4A5A38;background:#2C3522;border-radius:6px;overflow:hidden}
.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;padding:12px 16px;border-bottom:1px solid #4A5A38;font-size:14px}
.toolbar strong{font-family:'Staatliches',sans-serif;font-weight:400;letter-spacing:2px;color:#C2C29E;font-size:15px}
.legend{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:13px;color:#A8A890}
.legend-item{display:inline-flex;align-items:center;gap:7px}
.swatch{width:13px;height:13px;border-radius:2px;border:1px solid rgba(0,0,0,.3);flex:0 0 auto}
.map-wrap{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#1C2216}
svg{display:block;width:100%;height:100%}
.country{stroke:#242B1C;stroke-width:.4;cursor:pointer;transition:opacity .15s;outline:none}
.country:hover{opacity:.8}
.country.is-selected{stroke:#E8E8CC;stroke-width:1.2}
.country:focus{outline:none}
svg:focus{outline:none}
.loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#A8A890;font-size:14px;z-index:2}
.tooltip{pointer-events:none;position:absolute;z-index:10;display:none;max-width:280px;border:1px solid #9C9C74;background:rgba(28,34,22,.94);color:#E8E8CC;padding:10px 12px;border-radius:4px;font-size:14px;line-height:1.4}
.tooltip .bloc{font-family:'Staatliches',sans-serif;letter-spacing:1px;font-size:13px}
.tooltip .note{margin-top:6px;color:#A8A890;font-size:13px;border-top:1px solid #4A5A38;padding-top:6px}
</style>
<div class="panel"><div class="toolbar"><strong>Prejdi myšou alebo klikni na štát</strong><div id="legend" class="legend"></div></div><div id="wrap" class="map-wrap"><div id="loading" class="loading">Načítavam mapu…</div><svg id="map" viewBox="0 0 1200 675" role="img" aria-label="Interaktívna geopolitická mapa sveta"></svg><div id="tooltip" class="tooltip"></div></div></div>`;
    const $ = id => root.getElementById(id);
    const groups = {
      nato: { label: 'NATO', color: '#2d69ad', status: 'Člen / súčasť bloku NATO', note: 'Štát je na mape vedený v modrom geopolitickom bloku.' },
      csat: { label: 'CSAT', color: '#c90000', status: 'Člen / súčasť bloku CSAT', note: 'Štát je na mape vedený ako súčasť červeného bloku CSAT.' },
      ally: { label: 'Spojenci CSATu', color: '#ff8300', status: 'Spojenec CSATu', note: 'Štát je vedený ako samostatný spojenec alebo partnerská mocnosť CSATu.' },
      neutral: { label: 'Neutrálni / neznámy postoj', color: '#a6a6a6', status: 'Neutrálny alebo neurčený postoj', note: 'Na mape nie je jednoznačne zaradený k NATO ani CSAT.' }
    };
    Object.values(groups).forEach(g => {
      const item = document.createElement('span');
      item.className = 'legend-item';
      item.innerHTML = `<span class="swatch" style="background:${g.color}"></span><span>${g.label}</span>`;
      $('legend').appendChild(item);
    });
    const NATO = new Set(['840','124','304','352','826','372','620','724','250','056','528','442','276','208','578','752','246','616','233','428','440','203','703','348','642','100','300','191','705','380','008','807','499','392','410','036','554','710']);
    const ALLY = new Set(['643','112']);
    const CSAT = new Set(['156','356','586','398','860','795','417','762','004','364','368','760','792','887','012','434','788','504','732','818','032','076','152','604','218','862','024','180','178','104','418','116','704','360','608','598','458','050']);
    const specialNotes = { '840': 'Významná vedúca mocnosť NATO v tomto geopolitickom rozdelení.', '643': 'Rozsiahla eurázijská mocnosť vedená ako hlavný spojenec CSATu.', '156': 'Jedna z hlavných mocností bloku CSAT.', '036': 'Tichomorský člen modrého bloku NATO.', '392': 'Ázijský štát zaradený na mape k NATO.', '710': 'Južná Afrika je podľa pôvodnej mapy zaradená do modrého bloku.' };
    const id3 = d => String(d.id ?? '').padStart(3, '0');
    const groupFor = d => { const id = id3(d); if (NATO.has(id)) return groups.nato; if (ALLY.has(id)) return groups.ally; if (CSAT.has(id)) return groups.csat; return groups.neutral; };
    const countryName = d => d.properties?.name || `Štát ${id3(d)}`;
    const wrap = $('wrap'), tooltip = $('tooltip');
    let selectedPath = null, pinned = false;
    const place = (x, y) => {
      const rect = wrap.getBoundingClientRect();
      tooltip.style.left = `${Math.min(rect.width - 240, Math.max(8, x + 14))}px`;
      tooltip.style.top = `${Math.min(rect.height - 110, Math.max(8, y + 14))}px`;
    };
    const hoverHtml = d => { const g = groupFor(d); return `<strong>${countryName(d)}</strong><br><span class="bloc" style="color:${g.color === '#a6a6a6' ? '#C2C29E' : g.color}">${g.label}</span>`; };
    const pinHtml = d => { const g = groupFor(d); return `${hoverHtml(d)}<div class="note">${g.status}.<br>${specialNotes[id3(d)] || g.note}</div>`; };
    const unpin = () => {
      pinned = false;
      if (selectedPath) selectedPath.classList.remove('is-selected');
      selectedPath = null;
      tooltip.style.display = 'none';
    };
    Promise.all([
      import('https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'),
      import('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm'),
      import('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json/+esm')
    ]).then(([d3, topo, worldMod]) => {
      const world = worldMod?.default;
      if (!d3 || !topo || !world) { $('loading').textContent = 'Mapu sa nepodarilo načítať.'; return; }
      $('loading').remove();
      const countries = topo.feature(world, world.objects.countries).features;
      const svg = d3.select($('map'));
      const projection = d3.geoNaturalEarth1().fitExtent([[12, 12], [1188, 663]], { type: 'FeatureCollection', features: countries });
      const path = d3.geoPath(projection);
      svg.append('g').selectAll('path').data(countries).join('path')
        .attr('class', 'country').attr('d', path)
        .attr('fill', d => groupFor(d).color)
        .attr('tabindex', 0).attr('role', 'button')
        .attr('aria-label', d => `${countryName(d)}, ${groupFor(d).label}`)
        .on('pointerenter', function (event, d) { if (pinned) return; tooltip.innerHTML = hoverHtml(d); tooltip.style.display = 'block'; })
        .on('pointermove', function (event) { if (pinned) return; const rect = wrap.getBoundingClientRect(); place(event.clientX - rect.left, event.clientY - rect.top); })
        .on('pointerleave', function () { if (pinned) return; tooltip.style.display = 'none'; })
        .on('click', function (event, d) {
          if (selectedPath === this && pinned) { unpin(); return; }
          if (selectedPath) selectedPath.classList.remove('is-selected');
          selectedPath = this; this.classList.add('is-selected'); pinned = true;
          tooltip.innerHTML = pinHtml(d); tooltip.style.display = 'block';
          const rect = wrap.getBoundingClientRect(); place(event.clientX - rect.left, event.clientY - rect.top);
        })
        .on('keydown', function (event, d) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.dispatchEvent(new PointerEvent('click', { bubbles: true, clientX: 0, clientY: 0 })); }
          if (event.key === 'Escape') unpin();
        });
      window.addEventListener('keydown', e => { if (e.key === 'Escape') unpin(); });
    }).catch(() => { $('loading').textContent = 'Mapu sa nepodarilo načítať.'; });
  }
});

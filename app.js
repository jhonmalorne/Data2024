/* ============================================================
   Orden y Gestión Urbana · aplicación (HTML + JS puro)
   Los datos se guardan en localStorage (modo demostración).
   Para producción: reemplazar persist()/load() por una API real.
   ============================================================ */
(function () {
  'use strict';
  const C = window.OGU_CONFIG, D = window.OGU_SEED;
  const FAM = D.families, FEE = C.condo.fee, AREAS = D.areas;

  /* ---------- utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const uid = () => Math.random().toString(36).slice(2, 9);
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayIso = () => iso(new Date());
  const ymOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const addMonths = (ym, n) => { const [y, m] = ym.split('-').map(Number); return ymOf(new Date(y, m - 1 + n, 1)); };
  const monthLabel = (ym, short) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('es-VE', { month: short ? 'short' : 'long', year: 'numeric' }); };
  const fmtDate = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const fmtDateTime = s => new Date(s).toLocaleString('es-VE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const fmtTime = t => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'pm' : 'am'}`; };
  const money = n => '$' + Number(n || 0).toFixed(2);
  const famOf = id => FAM.find(f => f.id === Number(id)) || FAM[0];
  const unitCode = id => `Q-${pad(id)}`;
  const intl = n => '58' + String(n).replace(/\D/g, '').replace(/^0/, '');
  const waLink = (num, text) => `https://wa.me/${num ? intl(num) : ''}?text=${encodeURIComponent(text)}`;
  const telLink = n => `tel:+${intl(n)}`;
  const badge = (t, c) => `<span class="badge ${c}">${esc(t)}</span>`;
  const fmtPhone = n => String(n).replace(/^(\d{4})(\d{3})(\d{4})$/, '$1-$2-$3');

  /* ---------- estado ---------- */
  const KEY = 'ogu.v1';
  function seed() {
    const now = new Date(), cur = ymOf(now);
    const periods = []; for (let i = 9; i >= 0; i--) periods.push(addMonths(cur, -i));
    const s = { v: 1, firstPeriod: periods[0], reserveInitial: C.condo.reserveInitial, payments: {}, expenses: [], tickets: [], reports: [], reservations: [], notices: [], polls: [], maint: [], maintLog: [], visits: [], suggestions: [], nextTicket: 5, nextReceipt: 1 };
    const methods = ['Pago móvil', 'Transferencia', 'Zelle'];
    FAM.forEach(f => {
      s.payments[f.id] = {};
      periods.forEach((p, i) => {
        const back = periods.length - 1 - i;
        const miss = (D.seedDebt[f.id] || []).includes(back);
        const paid = back === 0 ? D.seedPaidCurrent.includes(f.id) : !miss;
        if (paid) {
          const day = back === 0 ? Math.min(2 + f.id % 4, now.getDate()) : 2 + f.id % 4;
          s.payments[f.id][p] = { amount: FEE, date: `${p}-${pad(day)}`, method: methods[(f.id + i) % 3], ref: String(100000 + f.id * 137 + i * 911) };
        }
      });
    });
    const base = [['Vigilancia', 180, 'Seguridad Los Guayos'], ['Jardinería', 60, 'Jardinero del condominio'], ['Electricidad áreas comunes', 45, 'Corpoelec'], ['Limpieza', 50, 'Servicio de limpieza'], ['Agua (cisterna)', 35, 'Cisternas Carabobo']];
    periods.forEach((p, i) => {
      const back = periods.length - 1 - i;
      const maxDay = back === 0 ? now.getDate() : 28;
      base.forEach((b, j) => s.expenses.push({ id: uid(), date: `${p}-${pad(Math.min(25 + j % 3, maxDay))}`, cat: b[0], provider: b[2], amount: b[1] + ((i * 7 + j * 3) % 5) * 2, note: '' }));
      if (i === 4) s.expenses.push({ id: uid(), date: `${p}-${pad(Math.min(12, maxDay))}`, cat: 'Reparaciones', provider: 'Servicio técnico de portones', amount: 120, note: 'Motor del portón eléctrico' });
    });
    const h = 3600e3, t0 = Date.now(), at = x => new Date(t0 - x * h).toISOString();
    s.tickets = [
      { id: 'OGU-0001', unit: 6, cat: 'Alumbrado', prio: 'Media', desc: 'Bombillo quemado en el poste frente a la quinta 12.', photo: '', created: at(30), status: 'Abierto', assignee: '', responses: [], firstResponseAt: null },
      { id: 'OGU-0002', unit: 3, cat: 'Portón / acceso', prio: 'Alta', desc: 'El portón principal queda trabado al cerrar.', photo: '', created: at(5), status: 'Abierto', assignee: '', responses: [], firstResponseAt: null },
      { id: 'OGU-0003', unit: 8, cat: 'Filtración / agua', prio: 'Alta', desc: 'Filtración en la tubería cerca del tanque.', photo: '', created: at(20), status: 'En proceso', assignee: 'Proveedor externo', responses: [{ by: 'Encargado', text: 'Recibido. Plomero programado para hoy en la tarde.', at: at(18) }], firstResponseAt: at(18) },
      { id: 'OGU-0004', unit: 14, cat: 'Áreas verdes', prio: 'Baja', desc: 'Poda de la maleza en el área de la churuata.', photo: '', created: at(50), status: 'Resuelto', assignee: 'Jardinero', responses: [{ by: 'Encargado', text: 'Asignado al jardinero.', at: at(40) }, { by: 'Encargado', text: 'Poda realizada. Gracias por el reporte.', at: at(26) }], firstResponseAt: at(40), resolvedAt: at(26) }
    ];
    s.reservations = [
      { id: uid(), area: 'salon', date: '2026-10-19', start: '09:00', end: '22:00', unit: 1, name: 'Andrez Tapisquent', title: 'Fiesta', status: 'Reservado', deposit: AREAS.salon.deposit, depositPaid: true },
      { id: uid(), area: 'cancha', date: '2026-10-17', start: '16:00', end: '18:00', unit: 11, name: 'Luis Alberto Páez', title: 'Partido de vecinos', status: 'Reservado', deposit: 0, depositPaid: true },
      { id: uid(), area: 'churuata', date: '2026-10-24', start: '14:00', end: '20:00', unit: 10, name: 'Carolina Villegas', title: 'Parrillada familiar', status: 'Pendiente', deposit: AREAS.churuata.deposit, depositPaid: false },
      { id: uid(), area: 'salon', date: '2026-11-07', start: '10:00', end: '21:00', unit: 5, name: 'José Gregorio Mora', title: 'Cumpleaños', status: 'Reservado', deposit: AREAS.salon.deposit, depositPaid: true }
    ];
    const day = n => iso(new Date(t0 - n * 24 * h));
    s.notices = [
      { id: uid(), level: 'Importante', title: 'Asamblea virtual de propietarios', text: 'Se abre la votación digital para aprobar la instalación de cámaras en el portón. Participa desde la sección Votaciones.', date: day(1) },
      { id: uid(), level: 'Aviso', title: 'Mantenimiento del portón eléctrico', text: 'El técnico revisará el motor del portón esta semana. Se avisará el día y la hora.', date: day(3) },
      { id: uid(), level: 'Aviso', title: 'Recordatorio de pago', text: 'La cuota se paga dentro de los primeros 5 días de cada mes. Usa el QR de pagos y reporta tu comprobante.', date: day(6) }
    ];
    s.polls = [
      { id: uid(), title: '¿Aprobamos instalar cámaras de vigilancia en el portón?', desc: 'Costo estimado a cubrir con el fondo de reserva.', options: ['Sí, aprobar', 'No', 'Aplazar'], votes: { 2: 0, 4: 0, 5: 1, 7: 0, 9: 0, 12: 2 }, status: 'Abierta', created: day(1) },
      { id: uid(), title: 'Pintura del frente del condominio', desc: 'Cuota extraordinaria única de $5 por vivienda.', options: ['A favor', 'En contra'], votes: (() => { const v = {}; for (let i = 1; i <= 14; i++) v[i] = i % 5 === 0 ? 1 : 0; return v; })(), status: 'Cerrada', created: day(40) }
    ];
    s.maint = [
      { id: uid(), name: 'Bomba de agua', area: 'Cuarto de bombas', every: 30, last: day(25) },
      { id: uid(), name: 'Portón eléctrico', area: 'Entrada principal', every: 60, last: day(70) },
      { id: uid(), name: 'Planta eléctrica', area: 'Cuarto eléctrico', every: 30, last: day(10) },
      { id: uid(), name: 'Fumigación', area: 'Todo el condominio', every: 90, last: day(80) },
      { id: uid(), name: 'Limpieza de tanque de agua', area: 'Tanque', every: 180, last: day(100) },
      { id: uid(), name: 'Poda y jardinería general', area: 'Áreas verdes', every: 15, last: day(5) }
    ];
    return s;
  }
  function persist(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s || S)); return true; }
    catch (e) { toast('No se pudo guardar: almacenamiento lleno. Elimina fotos o datos antiguos.'); return false; }
  }
  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.v === 1) return j; } catch (e) { /* ignora */ }
    const s = seed(); persist(s); return s;
  }
  let S = load();

  const ui = {
    admin: sessionStorage.getItem('ogu.admin') === '1',
    unit: Number(localStorage.getItem('ogu.unit')) || 1,
    period: ymOf(new Date()),
    cal: ymOf(new Date()),
    tkFilter: 'all',
    recon: null, reconText: '', gate: null, chat: null
  };

  /* ---------- lógica de pagos ---------- */
  const periodsAll = () => { const out = [], cur = ymOf(new Date()); let p = S.firstPeriod; while (p <= cur) { out.push(p); p = addMonths(p, 1); } return out; };
  const isPaid = (u, p) => !!(S.payments[u] && S.payments[u][p]);
  function unitStatus(u) {
    const cur = ymOf(new Date());
    const unpaid = periodsAll().filter(p => !isPaid(u, p));
    const prev = unpaid.filter(p => p < cur);
    return { unpaid, due: unpaid.length * FEE, status: prev.length ? 'mora' : (unpaid.length ? 'pend' : 'ok') };
  }
  const statusBadge = st => st === 'ok' ? badge('Solvente', 'b-ok') : st === 'pend' ? badge('Pendiente del mes', 'b-warn') : badge('Moroso', 'b-bad');
  function monthStats(p) {
    let collected = 0, paidN = 0;
    FAM.forEach(f => { const x = S.payments[f.id] && S.payments[f.id][p]; if (x) { collected += x.amount; paidN++; } });
    const expected = FAM.length * FEE;
    const spent = S.expenses.filter(e => e.date.startsWith(p)).reduce((a, e) => a + e.amount, 0);
    return { collected, expected, paidN, pct: Math.round(collected / expected * 100), spent };
  }
  function books() {
    let collected = 0; Object.values(S.payments).forEach(m => Object.values(m).forEach(x => collected += x.amount));
    const spent = S.expenses.reduce((a, e) => a + e.amount, 0);
    return { collected, spent, fund: S.reserveInitial + collected - spent };
  }
  function num(str) {
    let s = String(str).replace(/[^\d.,]/g, '').replace(/[.,]+$/, '');
    if (s.includes('.') && s.includes(',')) { s = s.lastIndexOf('.') > s.lastIndexOf(',') ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.'); }
    else if (/[.,]\d{1,2}$/.test(s)) s = s.replace(',', '.');
    else s = s.replace(/[.,]/g, '');
    return parseFloat(s);
  }
  function parseTransfer(text) {
    const t = text.replace(/\s+/g, ' ');
    const refM = t.match(/(?:ref(?:erencia)?|operaci[oó]n|comprobante|nro|n[º°o])\.?\s*[:#]?\s*(\d{5,})/i) || t.match(/\b(\d{6,})\b/);
    const amtM = t.match(/(?:monto|importe|total|bs\.?|usd|\$)\s*[:.]?\s*\$?\s*(\d[\d.,]*)/i) || t.match(/(\d+[.,]\d{2})\b/);
    let unit = null;
    const uM = t.match(/\b(?:Q|quinta|casa|apto)\s*-?\s*0?(\d{1,2})\b/i);
    if (uM && FAM.some(f => f.id === Number(uM[1]))) unit = Number(uM[1]);
    if (!unit) {
      const nt = norm(t); let best = 0, bu = null, tie = false;
      FAM.forEach(f => { const sc = norm(f.name).split(' ').filter(w => w.length >= 4 && nt.includes(w)).length; if (sc > best) { best = sc; bu = f.id; tie = false; } else if (sc === best && sc > 0) tie = true; });
      if (best > 0 && !tie) unit = bu;
    }
    const method = /pago\s*m[oó]vil/i.test(t) ? 'Pago móvil' : /zelle/i.test(t) ? 'Zelle' : /efectivo/i.test(t) ? 'Efectivo' : 'Transferencia';
    return { ref: refM ? refM[1] : '', amount: amtM ? num(amtM[1]) : null, unit, method };
  }

  /* ---------- tickets ---------- */
  function slaInfo(t) {
    const due = new Date(t.created).getTime() + C.slaHours * 3600e3;
    const fmt = ms => { const m = Math.floor(Math.abs(ms) / 60000); return `${Math.floor(m / 60)} h ${m % 60} min`; };
    if (t.status === 'Resuelto') return { txt: 'Resuelto', cls: 'b-ok', late: false };
    if (t.firstResponseAt) { const ok = new Date(t.firstResponseAt).getTime() <= due; return { txt: ok ? `Respondido dentro de ${C.slaHours} h` : 'Respondido fuera de plazo', cls: ok ? 'b-ok' : 'b-warn', late: false }; }
    const diff = due - Date.now();
    if (diff > 0) return { txt: `Responder en ${fmt(diff)}`, cls: diff < 6 * 3600e3 ? 'b-warn' : 'b-info', late: false };
    return { txt: `Vencido hace ${fmt(diff)}`, cls: 'b-bad', late: true };
  }

  /* ---------- reservas ---------- */
  const overlap = (a, b) => a.area === b.area && a.date === b.date && a.status !== 'Rechazada' && b.status !== 'Rechazada' && a.start < b.end && b.start < a.end;
  const resLine = r => `${AREAS[r.area].icon} <strong>${esc(r.name)}</strong> · Piso ${famOf(r.unit).piso} · ${esc(AREAS[r.area].name)} · ${fmtDate(r.date)} · ${fmtTime(r.start)} – ${fmtTime(r.end)} ${r.status === 'Pendiente' ? badge('Pendiente de confirmar', 'b-warn') : badge('Reservado', 'b-ok')}`;
  const upcoming = () => S.reservations.filter(r => r.date >= todayIso() && r.status !== 'Rechazada').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  /* ---------- mantenimiento / visitas ---------- */
  function maintState(m) {
    const next = new Date(m.last + 'T00:00:00'); next.setDate(next.getDate() + m.every);
    const days = Math.round((next - new Date(todayIso() + 'T00:00:00')) / 864e5);
    const nextIso = iso(next);
    if (days < 0) return { days, nextIso, cls: 'b-bad', txt: `Vencido hace ${-days} día(s)` };
    if (days <= 7) return { days, nextIso, cls: 'b-warn', txt: days === 0 ? 'Toca hoy' : `Toca en ${days} día(s)` };
    return { days, nextIso, cls: 'b-ok', txt: `Al día (faltan ${days} días)` };
  }
  function passState(p) {
    if (p.status === 'Ingresó') return { txt: 'Ingresó', cls: 'b-gray' };
    if (p.date < todayIso()) return { txt: 'Vencido', cls: 'b-bad' };
    if (p.date > todayIso()) return { txt: 'Programado', cls: 'b-info' };
    return { txt: 'Vigente hoy', cls: 'b-ok' };
  }

  /* ---------- UI base ---------- */
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 3200); }
  function modal(title, body, wide) {
    $('#modalRoot').innerHTML = `<div class="modal-backdrop" data-act="bg"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-act="close" aria-label="Cerrar">✕</button></div><div class="modal-body">${body}</div></div></div>`;
    const f = $('#modalRoot input:not([type=hidden]),#modalRoot select,#modalRoot textarea'); if (f) f.focus();
  }
  const closeModal = () => { $('#modalRoot').innerHTML = ''; };
  const modalOpen = () => !!$('#modalRoot').firstChild;
  const isNarrow = () => window.innerWidth < 640;
  const opts = (arr, sel) => arr.map(x => { const v = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x; return `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');
  const unitOpts = sel => opts(FAM.map(f => [f.id, `${unitCode(f.id)} · ${f.name} (Piso ${f.piso})`]), sel);
  const periodOpts = sel => opts(periodsAll().reverse().map(p => [p, monthLabel(p)]), sel);
  const fileToImg = file => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, 800 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.7)); }; img.onerror = rej; img.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });

  /* ---------- secciones ---------- */
  const SECTIONS = [
    ['inicio', '🏠 Inicio'], ['pagos', '💳 Pagos'], ['tickets', '🛠️ Tickets'], ['reservas', '📅 Reservas'],
    ['cartelera', '📌 Cartelera'], ['votos', '🗳️ Votaciones'], ['mant', '🔧 Mantenimiento'], ['visitas', '🚪 Visitas'],
    ['sugerencias', '💬 Sugerencias'], ['asistente', '🤖 Asistente'], ['contactos', '📞 Contactos']
  ];
  const route = () => { const r = (location.hash || '#/inicio').replace('#/', ''); return SECTIONS.some(s => s[0] === r) ? r : 'inicio'; };

  function head(title, sub, right) { return `<div class="section-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><div class="actions">${right || ''}</div></div>`; }
  const roleNote = () => ui.admin ? `<div class="alert info">🔑 <strong>Modo encargado:</strong> ves y gestionas todas las viviendas.</div>` : '';

  /* INICIO */
  function vInicio() {
    const cur = ymOf(new Date()), m = monthStats(cur), sts = FAM.map(f => unitStatus(f.id));
    const solv = sts.filter(x => x.status === 'ok').length, mora = sts.filter(x => x.status === 'mora').length;
    const openT = S.tickets.filter(t => t.status !== 'Resuelto'), late = openT.filter(t => slaInfo(t).late);
    const mine = S.tickets.filter(t => t.unit === ui.unit && t.status !== 'Resuelto');
    const mdue = S.maint.filter(x => maintState(x).days < 0).length;
    const pendRep = S.reports.filter(r => r.status === 'Pendiente').length;
    const pendRes = S.reservations.filter(r => r.status === 'Pendiente').length;
    const my = unitStatus(ui.unit), f = famOf(ui.unit);
    let alerts = '';
    if (ui.admin) {
      if (late.length) alerts += `<div class="alert bad">⏰ <strong>${late.length} ticket(s) sin respuesta pasadas las ${C.slaHours} horas.</strong> <a href="#/tickets">Atender ahora</a></div>`;
      if (pendRep) alerts += `<div class="alert warn">💳 ${pendRep} pago(s) reportado(s) por vecinos esperan confirmación. <a href="#/pagos">Revisar</a></div>`;
      if (pendRes) alerts += `<div class="alert warn">📅 ${pendRes} solicitud(es) de reserva por confirmar. <a href="#/reservas">Revisar</a></div>`;
      if (mdue) alerts += `<div class="alert warn">🔧 ${mdue} mantenimiento(s) preventivo(s) vencido(s). <a href="#/mant">Ver bitácora</a></div>`;
      if (!alerts) alerts = `<div class="alert ok">✅ Todo al día: no hay alertas pendientes.</div>`;
    } else {
      alerts = my.status === 'ok' ? `<div class="alert ok">✅ <strong>${esc(f.name)}</strong> (${unitCode(f.id)}): estás solvente. ¡Gracias!</div>`
        : `<div class="alert ${my.status === 'mora' ? 'bad' : 'warn'}">💳 <strong>${esc(f.name)}</strong> (${unitCode(f.id)}): ${my.unpaid.length} cuota(s) pendiente(s), total ${money(my.due)}. <a href="#/pagos">Ver cómo pagar</a></div>`;
    }
    const up = upcoming().slice(0, 4);
    return `
      <img class="banner" src="${C.assets.banner}" alt="Concertación" onerror="this.remove()">
      <div class="hero">
        <img class="hl" src="${C.assets.logoOGU}" alt="Orden y Gestión Urbana" onerror="this.remove()">
        <div><h1>${esc(C.condo.name)}</h1><p>${esc(C.condo.address)}</p><p><strong>${esc(C.app.name)}</strong> · ${esc(C.app.slogan)}</p></div>
      </div>
      ${roleNote()}${alerts}
      <div class="grid g4">
        <div class="card kpi ${solv >= 16 ? 'ok' : 'warn'}"><div class="n">${solv}/${FAM.length}</div><div class="l">viviendas solventes</div></div>
        <div class="card kpi ${m.pct >= 80 ? 'ok' : 'warn'}"><div class="n">${m.pct}%</div><div class="l">cobranza de ${monthLabel(cur)}</div></div>
        <div class="card kpi ${ui.admin ? (late.length ? 'bad' : '') : ''}"><div class="n">${ui.admin ? openT.length : mine.length}</div><div class="l">tickets abiertos${ui.admin ? ` (${late.length} vencidos)` : ' míos'}</div></div>
        <div class="card kpi"><div class="n">${up.length}</div><div class="l">reservas próximas</div></div>
      </div>
      <div class="grid g2">
        <div class="card"><h3>📅 Próximas reservas</h3>
          ${up.length ? `<ul class="clean">${up.map(r => `<li class="resrow">${resLine(r)}</li>`).join('')}</ul>` : '<p class="muted">No hay reservas próximas.</p>'}
          <p><a class="btn ghost sm" href="#/reservas">Ver calendario</a></p></div>
        <div class="card"><h3>📌 Cartelera</h3>
          ${S.notices.slice(0, 3).map(n => `<p><strong>${esc(n.title)}</strong> ${badge(n.level, n.level === 'Importante' ? 'b-warn' : 'b-info')}<br><small>${fmtDate(n.date)}</small><br>${esc(n.text)}</p>`).join('')}
          <a class="btn ghost sm" href="#/cartelera">Ver todo</a></div>
      </div>
      <div class="card"><h3>⚡ Accesos rápidos</h3><div class="actions">
        <a class="btn" href="#/tickets" data-quick="ticket">🛠️ Reportar una falla</a>
        <a class="btn" href="#/reservas">📅 Reservar un área</a>
        <a class="btn" href="#/visitas">🚪 Pase de visita (QR)</a>
        <a class="btn orange" href="#/sugerencias">💬 Buzón de sugerencias</a>
        <a class="btn green" href="${waLink(C.contacts.central, 'Hola, escribo desde ' + C.condo.name)}" target="_blank" rel="noopener">WhatsApp central</a>
      </div></div>
      ${ui.admin ? `<div class="card"><h3>📊 Resumen del encargado</h3><p>Morosos: <strong>${mora}</strong> · Recaudado ${monthLabel(cur)}: <strong>${money(m.collected)}</strong> de ${money(m.expected)} · Gastos del mes: <strong>${money(m.spent)}</strong> · Fondo de reserva: <strong>${money(books().fund)}</strong></p></div>` : ''}`;
  }

  /* PAGOS */
  function payForm(pre, inline) {
    pre = pre || {};
    const p = pre.period || ui.period;
    return `<form data-form="pay-register" ${inline ? 'class="card flat"' : ''}>
      <div class="row"><label class="f"><span>Vivienda</span><select name="unit" required>${unitOpts(pre.unit || '')}</select></label>
      <label class="f"><span>Mes que paga</span><select name="period">${periodOpts(p)}</select></label></div>
      <div class="row"><label class="f"><span>Monto (USD)</span><input name="amount" type="number" step="0.01" min="0" value="${pre.amount != null && !isNaN(pre.amount) ? pre.amount : FEE}" required></label>
      <label class="f"><span>Fecha</span><input name="date" type="date" value="${pre.date || todayIso()}" required></label></div>
      <div class="row"><label class="f"><span>Método</span><select name="method">${opts(['Pago móvil', 'Transferencia', 'Zelle', 'Efectivo'], pre.method)}</select></label>
      <label class="f"><span>Referencia</span><input name="ref" value="${esc(pre.ref || '')}" placeholder="N.º de operación"></label></div>
      <div class="actions"><button class="btn green" type="submit">Registrar pago y generar recibo</button></div></form>`;
  }

  function vPagos() {
    const cur = ymOf(new Date()), p = ui.period, b = books(), ms = monthStats(p);
    const exps = S.expenses.filter(e => e.date.startsWith(p)).sort((a, b2) => b2.date.localeCompare(a.date));
    const openBooks = `
      <div class="card"><h3>📖 Cuentas claras · ${monthLabel(p)}</h3>
        <div class="grid g4">
          <div class="kpi"><div class="n">${money(ms.collected)}</div><div class="l">recaudado de ${money(ms.expected)} (${ms.pct}%)</div></div>
          <div class="kpi"><div class="n">${money(ms.spent)}</div><div class="l">gastos del mes</div></div>
          <div class="kpi ${b.fund < 0 ? 'bad' : 'ok'}"><div class="n">${money(b.fund)}</div><div class="l">fondo de reserva</div></div>
          <div class="kpi"><div class="n">${FAM.length - ms.paidN}</div><div class="l">viviendas con pago pendiente este mes</div></div>
        </div>
        <p class="muted">Se muestran solo totales: el estado de cuenta de cada vivienda es privado.</p>
        <h3>Gastos del mes</h3>
        ${exps.length ? `<div class="tablewrap"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Proveedor</th><th class="num">Monto</th></tr></thead><tbody>${exps.map(e => `<tr><td>${fmtDate(e.date)}</td><td>${esc(e.cat)}${e.note ? `<br><small>${esc(e.note)}</small>` : ''}</td><td>${esc(e.provider)}</td><td class="num">${money(e.amount)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Sin gastos registrados este mes.</p>'}
        ${ui.admin ? `<div class="actions"><button class="btn sm" data-act="exp-add">+ Registrar gasto / factura</button></div>` : ''}
      </div>`;
    const periodSel = `<label class="myunit">Mes <select data-change="period">${periodOpts(p)}</select></label>`;

    if (!ui.admin) {
      const f = famOf(ui.unit), st = unitStatus(ui.unit), myReports = S.reports.filter(r => r.unit === ui.unit).sort((a, b2) => b2.at.localeCompare(a.at));
      return head('💳 Pagos y estado de cuenta', 'Consulta tu solvencia, paga y reporta tu comprobante.', periodSel) + `
        <div class="grid g2">
          <div class="card"><h3>${esc(f.name)} · ${unitCode(f.id)} · Piso ${f.piso}</h3>
            <p>${statusBadge(st.status)} Cuota mensual: <strong>${money(FEE)}</strong></p>
            ${st.unpaid.length ? `<p>Pendiente: <strong>${st.unpaid.length}</strong> cuota(s) · Total <strong>${money(st.due)}</strong></p>` : '<p>No tienes deudas. ¡Gracias!</p>'}
            <div class="chips">${periodsAll().slice(-12).map(q => `<span class="badge ${isPaid(ui.unit, q) ? 'b-ok' : (q < cur ? 'b-bad' : 'b-warn')}">${monthLabel(q, true)} ${isPaid(ui.unit, q) ? '✓' : ''}</span>`).join('')}</div>
            <div class="actions"><button class="btn orange" data-act="pay-report">📤 Reportar mi pago</button></div>
            <h3 style="margin-top:1rem">Mis recibos</h3>
            ${periodsAll().filter(q => isPaid(ui.unit, q)).slice(-6).reverse().map(q => `<button class="btn ghost sm" data-act="receipt" data-unit="${ui.unit}" data-period="${q}">🧾 ${monthLabel(q, true)}</button>`).join(' ') || '<p class="muted">Aún no hay recibos.</p>'}
            ${myReports.length ? `<h3 style="margin-top:1rem">Pagos que reporté</h3>${myReports.slice(0, 4).map(r => `<p>${monthLabel(r.period)} · ${money(r.amount)} · Ref. ${esc(r.ref || '—')} ${badge(r.status, r.status === 'Confirmado' ? 'b-ok' : r.status === 'Rechazado' ? 'b-bad' : 'b-warn')}</p>`).join('')}` : ''}
          </div>
          <div class="card"><h3>Paga con QR</h3><div class="qrbox"><img src="${C.assets.qrPagos}" alt="QR para pagos" style="max-width:260px" onerror="this.outerHTML='<p class=muted>Sube QR para pagos.png al repositorio</p>'"></div>
            <p class="muted">Después de pagar, toca “Reportar mi pago” y adjunta la captura. El encargado confirma y se genera tu recibo.</p></div>
        </div>` + openBooks;
    }

    /* encargado */
    const rows = FAM.map(f => {
      const x = S.payments[f.id] && S.payments[f.id][p];
      const st = x ? badge('Pagado', 'b-ok') : badge(p < cur ? 'Moroso' : 'Pendiente', p < cur ? 'b-bad' : 'b-warn');
      const msg = `Hola ${f.name}, le recordamos que la cuota de condominio de ${monthLabel(p)} (${money(FEE)}) de ${C.condo.name} está pendiente. Puede pagar con el QR y reportar su comprobante. Gracias. — ${C.app.name}`;
      return `<tr><td>${unitCode(f.id)}</td><td>${esc(f.name)}<br><small>Piso ${f.piso}</small></td><td>${st}</td><td>${x ? `${fmtDate(x.date)}<br><small>${esc(x.method)} · ${esc(x.ref)}</small>` : '—'}</td>
        <td>${x ? `<button class="btn ghost sm" data-act="receipt" data-unit="${f.id}" data-period="${p}">Recibo</button> <button class="btn ghost sm" data-act="pay-void" data-unit="${f.id}" data-period="${p}">Anular</button>`
          : `<button class="btn sm" data-act="pay-register" data-unit="${f.id}" data-period="${p}">Registrar</button> <a class="btn ghost sm" target="_blank" rel="noopener" href="${waLink('', msg)}">Recordar</a>`}</td></tr>`;
    }).join('');
    const cols = periodsAll().slice(-12);
    const matrix = `<div class="tablewrap"><table class="matrix"><thead><tr><th>Vivienda</th>${cols.map(q => `<th>${monthLabel(q, true).replace(' ', '<br>')}</th>`).join('')}<th>Deuda</th></tr></thead><tbody>${FAM.map(f => { const st = unitStatus(f.id); return `<tr><td>${unitCode(f.id)} ${esc(f.name.split(' ')[0])}</td>${cols.map(q => `<td><span class="dot ${isPaid(f.id, q) ? 'ok' : (q < cur ? 'no' : 'cur')}" title="${monthLabel(q)}"></span></td>`).join('')}<td class="num">${st.due ? money(st.due) : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;
    const reps = S.reports.filter(r => r.status === 'Pendiente');
    const repHtml = reps.length ? reps.map(r => `<div class="resrow"><strong>${unitCode(r.unit)} ${esc(famOf(r.unit).name)}</strong> · ${monthLabel(r.period)} · ${money(r.amount)} · ${esc(r.method)} · Ref. ${esc(r.ref || '—')}<br><small>Enviado ${fmtDateTime(r.at)}</small>${r.photo ? `<br><img src="${r.photo}" alt="Comprobante" style="max-width:180px;border-radius:8px;margin:.3rem 0">` : ''}<div class="actions"><button class="btn green sm" data-act="rep-ok" data-id="${r.id}">Confirmar y registrar</button><button class="btn danger sm" data-act="rep-no" data-id="${r.id}">Rechazar</button></div></div>`).join('') : '<p class="muted">No hay pagos por confirmar.</p>';
    const rc = ui.recon;
    return head('💳 Pagos y cuentas', 'Control de pago de las 20 familias, recibos y transparencia.', periodSel + `<button class="btn ghost sm" data-act="csv">⬇️ Exportar CSV</button>`) + roleNote() + `
      <div class="grid g4">
        <div class="card kpi ok"><div class="n">${ms.paidN}</div><div class="l">pagaron ${monthLabel(p, true)}</div></div>
        <div class="card kpi warn"><div class="n">${FAM.length - ms.paidN}</div><div class="l">pendientes</div></div>
        <div class="card kpi"><div class="n">${money(ms.collected)}</div><div class="l">recaudado</div></div>
        <div class="card kpi ${FAM.filter(f => unitStatus(f.id).status === 'mora').length ? 'bad' : 'ok'}"><div class="n">${FAM.filter(f => unitStatus(f.id).status === 'mora').length}</div><div class="l">morosos (meses anteriores)</div></div>
      </div>
      <div class="card"><h3>Control del mes</h3><div class="tablewrap"><table><thead><tr><th>Viv.</th><th>Familia</th><th>Estado</th><th>Pago</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div></div>
      <div class="card"><h3>📤 Pagos reportados por vecinos</h3>${repHtml}</div>
      <div class="card"><h3>🤖 Conciliación asistida</h3>
        <p class="muted">Pega el texto de la notificación del banco o del mensaje del vecino. El asistente detecta referencia, monto, vivienda y método; tú confirmas.</p>
        <form data-form="recon"><label class="f"><span>Mensaje o comprobante</span><textarea name="text" placeholder="Ej.: Pago móvil recibido. Ref 483920, monto $25.00, Andrez Tapisquent Q-01">${esc(ui.reconText)}</textarea></label><button class="btn" type="submit">Analizar</button></form>
        ${rc ? `<div style="margin-top:.8rem">${rc.warn.map(w => `<div class="alert warn">${esc(w)}</div>`).join('')}${payForm(rc.pre, true)}</div>` : ''}</div>
      <div class="card"><h3>Historial de solvencia (últimos 12 meses)</h3><div class="legend"><span><i style="background:#27ae60"></i>Pagado</span><span><i style="background:#e74c3c"></i>Sin pagar</span><span><i style="background:#f1c40f"></i>Mes en curso</span></div>${matrix}</div>` + openBooks;
  }

  /* TICKETS */
  function ticketCard(t) {
    const s = slaInfo(t), f = famOf(t.unit);
    return `<div class="card ticket ${s.late ? 'late' : t.status === 'Resuelto' ? 'done' : t.status === 'En proceso' ? 'prog' : ''}">
      <header><div><strong>${esc(t.id)}</strong> · ${esc(t.cat)} ${badge('Prioridad ' + t.prio, t.prio === 'Alta' ? 'b-bad' : t.prio === 'Media' ? 'b-warn' : 'b-gray')}</div><div>${badge(t.status, t.status === 'Resuelto' ? 'b-ok' : t.status === 'En proceso' ? 'b-warn' : 'b-info')} ${badge(s.txt, s.cls)}</div></header>
      <p>${esc(t.desc)}</p>${t.photo ? `<img class="photo" src="${t.photo}" alt="Foto del reporte">` : ''}
      <small>${unitCode(t.unit)} · ${esc(f.name)} · ${fmtDateTime(t.created)}${t.assignee ? ` · Asignado a: <strong>${esc(t.assignee)}</strong>` : ''}</small>
      ${t.responses.map(r => `<div class="resp"><strong>${esc(r.by)}</strong> <small>${fmtDateTime(r.at)}</small><br>${esc(r.text)}</div>`).join('')}
      ${ui.admin && t.status !== 'Resuelto' ? `<div class="actions"><button class="btn sm" data-act="tk-manage" data-id="${t.id}">Responder / gestionar</button></div>` : ''}</div>`;
  }
  function vTickets() {
    let list = ui.admin ? S.tickets.slice() : S.tickets.filter(t => t.unit === ui.unit);
    list.sort((a, b) => b.created.localeCompare(a.created));
    const fl = ui.tkFilter;
    const shown = list.filter(t => fl === 'all' ? true : fl === 'open' ? t.status !== 'Resuelto' : fl === 'late' ? slaInfo(t).late : t.status === 'Resuelto');
    return head('🛠️ Tickets de atención', `Cada reporte recibe respuesta del encargado en máximo <strong>${C.slaHours} horas</strong>.`, `<button class="btn orange" data-act="tk-new">+ Nuevo ticket</button>`) + roleNote() + `
      <div class="chips">${[['all', 'Todos'], ['open', 'Abiertos'], ['late', `Vencidos (+${C.slaHours} h)`], ['done', 'Resueltos']].map(([k, l]) => `<button class="chip ${fl === k ? 'on' : ''}" data-act="tk-filter" data-f="${k}">${l}</button>`).join('')}</div>
      ${shown.length ? shown.map(ticketCard).join('') : '<div class="card"><p class="muted">No hay tickets en esta vista.</p></div>'}`;
  }

  /* RESERVAS */
  function vReservas() {
    const [y, m] = ui.cal.split('-').map(Number), first = new Date(y, m - 1, 1), off = (first.getDay() + 6) % 7, dim = new Date(y, m, 0).getDate();
    const cells = Math.ceil((off + dim) / 7) * 7, td = todayIso();
    let grid = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < cells; i++) {
      const dn = i - off + 1;
      if (dn < 1 || dn > dim) { grid += `<div class="day out" aria-hidden="true"></div>`; continue; }
      const ds = `${ui.cal}-${pad(dn)}`, evs = S.reservations.filter(r => r.date === ds && r.status !== 'Rechazada').sort((a, b) => a.start.localeCompare(b.start));
      const lim = isNarrow() ? 1 : 2;
      grid += `<button type="button" class="day ${ds === td ? 'today' : ''}" data-act="day" data-date="${ds}" aria-label="${fmtDate(ds)}${evs.length ? ', ' + evs.length + ' reserva(s)' : ''}"><span class="dn">${dn}</span>${evs.slice(0, lim).map(r => `<span class="ev ${r.area} ${r.status === 'Pendiente' ? 'pend' : ''}" title="${esc(r.name)} · ${esc(AREAS[r.area].name)}">${fmtTime(r.start).replace(':00', '')} ${esc(r.name.split(' ')[0])}</span>`).join('')}${evs.length > lim ? `<span class="more">+${evs.length - lim} más</span>` : ''}</button>`;
    }
    const up = upcoming();
    return head('📅 Calendario de reservas', 'Salón de fiestas, churuata y cancha. Las reservas quedan visibles para todos.', `<button class="btn orange" data-act="res-new">+ Reservar</button>`) + roleNote() + `
      <div class="card">
        <div class="cal-head"><button class="btn ghost sm" data-act="cal-prev" aria-label="Mes anterior">◀</button><h3>${monthLabel(ui.cal)}</h3><div class="actions" style="margin:0"><button class="btn ghost sm" data-act="cal-today">Hoy</button><button class="btn ghost sm" data-act="cal-next" aria-label="Mes siguiente">▶</button></div></div>
        <div class="cal">${grid}</div>
        <div class="legend"><span><i style="background:#c0392b"></i>Salón</span><span><i style="background:#8e6b1f"></i>Churuata</span><span><i style="background:#1f7a4d"></i>Cancha</span><span><i style="background:#eee;border:1px dashed #888"></i>Pendiente de confirmar</span></div>
        <div class="cta">📞 <strong>Para reservar comuníquese con nosotros: tu central de atención</strong> · <a href="${telLink(C.contacts.central)}">${fmtPhone(C.contacts.central)}</a> · <a href="${waLink(C.contacts.central, 'Hola, quiero reservar un área de ' + C.condo.name)}" target="_blank" rel="noopener">WhatsApp</a></div>
      </div>
      <div class="card"><h3>Reservas próximas</h3>${up.length ? `<ul class="clean">${up.map(r => `<li class="resrow">${resLine(r)}${r.title ? `<br><small>Evento: ${esc(r.title)}</small>` : ''}${ui.admin ? `<div class="actions">${r.status === 'Pendiente' ? `<button class="btn green sm" data-act="res-ok" data-id="${r.id}">Confirmar</button><button class="btn danger sm" data-act="res-no" data-id="${r.id}">Rechazar</button>` : ''}<button class="btn ghost sm" data-act="res-del" data-id="${r.id}">Eliminar</button></div>` : ''}</li>`).join('')}</ul>` : '<p class="muted">Sin reservas próximas.</p>'}</div>`;
  }
  function resForm(date) {
    return `<form data-form="res-new">
      <div class="row"><label class="f"><span>Área</span><select name="area" data-change="res-area">${opts(Object.entries(AREAS).map(([k, a]) => [k, `${a.icon} ${a.name}`]))}</select></label>
      <label class="f"><span>Fecha</span><input type="date" name="date" value="${date || todayIso()}" min="${todayIso()}" required></label></div>
      <div class="row"><label class="f"><span>Desde</span><input type="time" name="start" value="09:00" required></label><label class="f"><span>Hasta</span><input type="time" name="end" value="22:00" required></label></div>
      ${ui.admin ? `<label class="f"><span>Vivienda que reserva</span><select name="unit">${unitOpts(ui.unit)}</select></label>` : `<p class="muted">Reserva a nombre de <strong>${esc(famOf(ui.unit).name)}</strong> (${unitCode(ui.unit)} · Piso ${famOf(ui.unit).piso}).</p>`}
      <label class="f"><span>Motivo del evento</span><input name="title" placeholder="Ej.: Fiesta de cumpleaños" maxlength="60"></label>
      <p class="muted" id="depNote">Depósito de garantía: ${AREAS.salon.deposit ? money(AREAS.salon.deposit) : 'sin depósito'}. Horario: ${AREAS.salon.hours}.</p>
      <div class="actions"><button class="btn orange" type="submit">${ui.admin ? 'Agregar reserva' : 'Solicitar reserva'}</button></div></form>`;
  }
  function dayModal(ds) {
    const evs = S.reservations.filter(r => r.date === ds && r.status !== 'Rechazada').sort((a, b) => a.start.localeCompare(b.start));
    modal(fmtDate(ds), `${evs.length ? evs.map(r => `<div class="resrow">${resLine(r)}${r.title ? `<br><small>Evento: ${esc(r.title)}</small>` : ''}${r.deposit ? `<br><small>Depósito ${money(r.deposit)}: ${r.depositPaid ? 'recibido' : 'pendiente'}</small>` : ''}${ui.admin ? `<div class="actions">${r.status === 'Pendiente' ? `<button class="btn green sm" data-act="res-ok" data-id="${r.id}">Confirmar</button><button class="btn danger sm" data-act="res-no" data-id="${r.id}">Rechazar</button>` : ''}${r.deposit && !r.depositPaid ? `<button class="btn ghost sm" data-act="res-dep" data-id="${r.id}">Depósito recibido</button>` : ''}<button class="btn ghost sm" data-act="res-del" data-id="${r.id}">Eliminar</button></div>` : ''}</div>`).join('') : '<p class="muted">No hay reservas este día.</p>'}
      ${ds >= todayIso() ? `<h3>Reservar este día</h3>${resForm(ds)}` : '<p class="muted">Este día ya pasó.</p>'}
      <div class="cta">📞 Para reservar comuníquese con nosotros: tu central de atención · <a href="${telLink(C.contacts.central)}">${fmtPhone(C.contacts.central)}</a></div>`, true);
  }

  /* CARTELERA */
  function vCartelera() {
    return head('📌 Cartelera y normativas', 'Avisos del encargado y reglamento de convivencia.', ui.admin ? `<button class="btn orange" data-act="notice-add">+ Publicar aviso</button>` : '') + roleNote() + `
      <div class="grid g2"><div>
        <h3>Avisos</h3>${S.notices.map(n => `<div class="card"><p><strong>${esc(n.title)}</strong> ${badge(n.level, n.level === 'Importante' ? 'b-warn' : n.level === 'Urgente' ? 'b-bad' : 'b-info')}<br><small>${fmtDate(n.date)}</small></p><p>${esc(n.text)}</p>${ui.admin ? `<button class="btn ghost sm" data-act="notice-del" data-id="${n.id}">Eliminar</button>` : ''}</div>`).join('') || '<p class="muted">Sin avisos.</p>'}
      </div><div>
        <h3>Normas de convivencia</h3><div class="card">${D.rules.map(r => `<details><summary><strong>${esc(r.t)}</strong></summary><p>${esc(r.d)}</p></details><hr style="border:0;border-top:1px solid var(--line)">`).join('')}</div>
      </div></div>`;
  }

  /* VOTACIONES */
  function vVotos() {
    return head('🗳️ Votaciones y consultas', 'Decisiones del condominio sin depender del quórum presencial. Un voto por vivienda.', ui.admin ? `<button class="btn orange" data-act="poll-new">+ Nueva consulta</button>` : '') + roleNote() +
      S.polls.map(p => {
        const total = Object.keys(p.votes).length, counts = p.options.map((_, i) => Object.values(p.votes).filter(v => v === i).length), mine = p.votes[ui.unit];
        return `<div class="card"><h3>${esc(p.title)} ${badge(p.status, p.status === 'Abierta' ? 'b-ok' : 'b-gray')}</h3><p class="muted">${esc(p.desc)}</p>
          ${p.options.map((o, i) => { const pc = total ? Math.round(counts[i] / total * 100) : 0; return `<div><div class="bar"><span style="width:${pc}%"></span><em>${esc(o)} · ${counts[i]} (${pc}%)</em></div>${p.status === 'Abierta' && !ui.admin ? `<button class="btn ${mine === i ? 'green' : 'ghost'} sm" data-act="vote" data-id="${p.id}" data-opt="${i}">${mine === i ? '✓ Tu voto' : 'Votar por esta opción'}</button>` : ''}</div>`; }).join('')}
          <p class="muted">Participación: <strong>${total}/${FAM.length}</strong> viviendas (${Math.round(total / FAM.length * 100)}%).${mine != null && !ui.admin ? ' Ya votó tu vivienda.' : ''}</p>
          ${ui.admin && p.status === 'Abierta' ? `<button class="btn danger sm" data-act="poll-close" data-id="${p.id}">Cerrar consulta</button>` : ''}</div>`;
      }).join('');
  }

  /* MANTENIMIENTO */
  function vMant() {
    const items = S.maint.map(m => ({ m, s: maintState(m) })).sort((a, b) => a.s.days - b.s.days);
    return head('🔧 Bitácora de mantenimiento', 'Mantenimiento preventivo de áreas comunes con alertas automáticas.', ui.admin ? `<button class="btn orange" data-act="maint-add">+ Nueva tarea</button>` : '') + roleNote() + `
      <div class="card">${items.map(({ m, s }) => `<div class="mrow"><div><strong>${esc(m.name)}</strong><br><small>${esc(m.area)} · cada ${m.every} días · último: ${fmtDate(m.last)} · próximo: ${fmtDate(s.nextIso)}</small></div><div>${badge(s.txt, s.cls)} ${ui.admin ? `<button class="btn sm" data-act="maint-done" data-id="${m.id}">Marcar realizado</button>` : ''}</div></div>`).join('')}</div>
      <div class="card"><h3>Historial reciente</h3>${S.maintLog.length ? S.maintLog.slice(-8).reverse().map(l => `<p>${fmtDate(l.date)} · <strong>${esc(l.name)}</strong> ${l.note ? '· ' + esc(l.note) : ''}</p>`).join('') : '<p class="muted">Aún no hay registros en esta sesión.</p>'}</div>`;
  }

  /* VISITAS */
  function vVisitas() {
    const mine = (ui.admin ? S.visits : S.visits.filter(v => v.unit === ui.unit)).slice().sort((a, b) => b.date.localeCompare(a.date));
    const g = ui.gate;
    return head('🚪 Visitantes y proveedores', 'Genera un pase con código QR y envíalo a tu visita para agilizar la entrada en garita.') + roleNote() + `
      <div class="grid g2">
        <div class="card"><h3>Nuevo pase</h3><form data-form="visit-new">
          <label class="f"><span>Nombre del visitante</span><input name="visitor" required maxlength="60"></label>
          <div class="row"><label class="f"><span>Cédula o placa (opcional)</span><input name="doc" maxlength="20"></label><label class="f"><span>Tipo</span><select name="type">${opts(['Visita', 'Proveedor', 'Delivery', 'Técnico'])}</select></label></div>
          <label class="f"><span>Fecha de la visita</span><input type="date" name="date" value="${todayIso()}" min="${todayIso()}" required></label>
          ${ui.admin ? `<label class="f"><span>Vivienda</span><select name="unit">${unitOpts(ui.unit)}</select></label>` : ''}
          <button class="btn" type="submit">Generar pase QR</button></form></div>
        <div class="card"><h3>🛡️ Garita (vigilante)</h3><p class="muted">Ingresa el código del pase para validarlo. Vigilante: <a href="${telLink(C.contacts.vigilante)}">${fmtPhone(C.contacts.vigilante)}</a></p>
          <form data-form="gate"><div class="row"><input name="code" placeholder="OGU-XXXXXX" style="text-transform:uppercase" required><button class="btn green" type="submit" style="flex:0 0 auto">Validar</button></div></form>
          ${g ? `<div class="alert ${g.cls}" style="margin-top:.7rem">${g.html}</div>` : ''}</div>
      </div>
      <div class="card"><h3>${ui.admin ? 'Todos los pases' : 'Mis pases'}</h3>${mine.length ? `<div class="tablewrap"><table><thead><tr><th>Visitante</th><th>Fecha</th><th>Código</th><th>Estado</th><th></th></tr></thead><tbody>${mine.map(v => { const s = passState(v); return `<tr><td>${esc(v.visitor)}<br><small>${esc(v.type)}${v.doc ? ' · ' + esc(v.doc) : ''} · ${unitCode(v.unit)}</small></td><td>${fmtDate(v.date)}</td><td><code>${esc(v.code)}</code></td><td>${badge(s.txt, s.cls)}</td><td><button class="btn ghost sm" data-act="visit-show" data-id="${v.id}">Ver QR</button></td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">Todavía no hay pases.</p>'}</div>`;
  }
  function showPass(id) {
    const v = S.visits.find(x => x.id === id); if (!v) return;
    const text = `${C.condo.name} · Pase ${v.code} · ${v.visitor} · ${fmtDate(v.date)} · ${unitCode(v.unit)} ${famOf(v.unit).name}`;
    modal('Pase de acceso', `<div class="qrbox" id="qrbox"></div><div class="passcode">${esc(v.code)}</div><p style="text-align:center"><strong>${esc(v.visitor)}</strong><br>${fmtDate(v.date)} · ${esc(C.condo.name)}</p>
      <div class="actions" style="justify-content:center"><a class="btn green" target="_blank" rel="noopener" href="${waLink('', text + '. Muestra este código en la garita.')}">Enviar por WhatsApp</a></div>`);
    try { new QRCode($('#qrbox'), { text: `OGU|${C.condo.name}|${unitCode(v.unit)}|${v.code}|${v.date}`, width: 200, height: 200 }); } catch (e) { $('#qrbox').innerHTML = '<p class="muted">No se pudo cargar el generador de QR; usa el código.</p>'; }
  }

  /* SUGERENCIAS */
  function vSugerencias() {
    return head('💬 Buzón de sugerencias', 'Tu sugerencia llega directo al WhatsApp de la central de atención.') + `
      <div class="grid g2"><div class="card"><form data-form="suggest">
        <label class="f"><span>Tu nombre (opcional)</span><input name="name" value="${esc(famOf(ui.unit).name)}" maxlength="60"></label>
        <label class="f"><span>Tema</span><select name="cat">${opts(['Sugerencia', 'Queja', 'Felicitación', 'Seguridad', 'Áreas comunes', 'Convivencia'])}</select></label>
        <label class="f"><span>Tu mensaje</span><textarea name="msg" required maxlength="800" placeholder="Escribe aquí tu sugerencia…"></textarea></label>
        <div class="actions"><button class="btn green" type="submit">📲 Enviar por WhatsApp</button><button class="btn ghost" type="button" data-act="suggest-mail">✉️ Enviar por correo</button></div></form></div>
        <div class="card"><h3>Enviadas desde este dispositivo</h3>${S.suggestions.length ? S.suggestions.slice(-6).reverse().map(s => `<p><strong>${esc(s.cat)}</strong> · <small>${fmtDateTime(s.at)}</small><br>${esc(s.msg)}</p>`).join('') : '<p class="muted">Aún no has enviado sugerencias.</p>'}</div></div>`;
  }

  /* ASISTENTE */
  function botAnswer(q) {
    const n = norm(q), has = (...w) => w.some(x => n.includes(x));
    const st = unitStatus(ui.unit), f = famOf(ui.unit), c = C.contacts;
    if (has('cuanto debo', 'debo', 'deuda', 'saldo', 'solven', 'moros', 'cuanto pago', 'cuota')) return st.unpaid.length ? `${f.name} (${unitCode(f.id)}): tienes ${st.unpaid.length} cuota(s) pendiente(s) (${st.unpaid.map(p => monthLabel(p, true)).join(', ')}). Total: ${money(st.due)}. Paga con el QR en la sección Pagos y reporta tu comprobante.` : `${f.name}, estás solvente. ¡Gracias por mantener al día el condominio! La cuota mensual es ${money(FEE)}.`;
    if (has('cancha')) return D.schedules.cancha + ' Reserva en la sección Reservas.';
    if (has('salon')) return D.schedules.salon + ` Depósito: ${money(AREAS.salon.deposit)}.`;
    if (has('churuata')) return D.schedules.churuata + ` Depósito: ${money(AREAS.churuata.deposit)}.`;
    if (has('agua', 'cisterna', 'camion')) return D.schedules.agua;
    if (has('basura', 'aseo', 'desecho')) return D.schedules.basura;
    if (has('silencio', 'ruido', 'musica', 'volumen')) return D.schedules.silencio + ' Si hay molestias persistentes, escribe a denuncias: ' + fmtPhone(c.denuncias) + '.';
    if (has('reserv', 'fiesta', 'apartar', 'calendario')) return `Entra a Reservas, toca el día y solicita el área. El encargado confirma y queda visible en el calendario. También puedes llamar a la central: ${fmtPhone(c.central)}.`;
    if (has('ticket', 'falla', 'reporte', 'reportar', 'bombillo', 'filtra', 'dano', 'portón', 'porton')) return `Crea un ticket en la sección Tickets (puedes adjuntar una foto). El encargado responde en máximo ${C.slaHours} horas.`;
    if (has('visita', 'proveedor', 'delivery', 'invitado')) return 'En Visitas generas un pase con QR para tu invitado y se lo envías por WhatsApp. En la garita lo validan con el código.';
    if (has('pago', 'pagar', 'transfer', 'zelle', 'recibo')) return 'Paga con el QR de la sección Pagos y toca “Reportar mi pago” con tu comprobante. Al confirmarlo el encargado, tendrás tu recibo.';
    if (has('contacto', 'telefono', 'numero', 'llamar', 'vigilante', 'jardiner', 'denunc', 'central', 'correo')) return `Central: ${fmtPhone(c.central)} · Denuncias: ${fmtPhone(c.denuncias)} · Vigilante: ${fmtPhone(c.vigilante)} · Jardinero: ${fmtPhone(c.jardinero)} · Correo: ${c.email}`;
    if (has('votac', 'encuesta', 'asamblea', 'consulta')) { const o = S.polls.filter(p => p.status === 'Abierta').length; return o ? `Hay ${o} consulta(s) abierta(s) en Votaciones. Cada vivienda tiene un voto.` : 'No hay consultas abiertas ahora.'; }
    if (has('sugerenc', 'queja')) return 'Usa el Buzón de sugerencias: tu mensaje se envía al WhatsApp de la central.';
    if (has('hola', 'buenas', 'buen dia', 'buenos')) return `¡Hola! Soy el asistente de ${C.condo.name}. Pregúntame por tu saldo, horarios, reservas, tickets o contactos.`;
    return 'No estoy seguro de esa pregunta. Prueba con: “¿cuánto debo?”, “horario de la cancha”, “¿cuándo pasa el camión del agua?” o “¿cómo reservo?”. También puedes escribir a la central: ' + fmtPhone(c.central) + '.';
  }
  function vAsistente() {
    if (!ui.chat) ui.chat = [{ me: false, t: `¡Hola! Soy el asistente de ${C.condo.name}. ¿En qué te ayudo?` }];
    return head('🤖 Asistente del condominio', 'Respuestas inmediatas a las preguntas frecuentes de los vecinos.') + `
      <div class="chips">${['¿Cuánto debo?', 'Horario de la cancha', '¿Cuándo pasa el camión del agua?', '¿Cómo reservo el salón?', 'Teléfonos de contacto'].map(q => `<button class="chip" data-act="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <div class="chat" id="chat">${ui.chat.map(m => `<div class="msg ${m.me ? 'me' : 'bot'}">${esc(m.t)}</div>`).join('')}</div>
      <form class="chatform" data-form="chat"><input name="q" placeholder="Escribe tu pregunta…" autocomplete="off" required><button class="btn" type="submit" style="flex:0 0 auto">Enviar</button></form>`;
  }

  /* CONTACTOS */
  function vContactos() {
    const c = C.contacts;
    const item = (ic, t, n, msg) => `<div class="card contact"><div><strong>${ic} ${t}</strong><span class="muted">${fmtPhone(n)}</span></div><div class="actions" style="margin:0"><a class="btn sm" href="${telLink(n)}">Llamar</a><a class="btn green sm" target="_blank" rel="noopener" href="${waLink(n, msg)}">WhatsApp</a></div></div>`;
    return head('📞 Contactos y ubicación', `${esc(C.condo.name)} · ${esc(C.condo.address)}`) + `
      <div class="grid g2"><div>
        ${item('🎧', 'Central de atención', c.central, 'Hola, escribo desde ' + C.condo.name)}
        ${item('🚨', 'Línea de denuncias', c.denuncias, 'Quiero hacer una denuncia en ' + C.condo.name)}
        ${item('🛡️', 'Vigilante', c.vigilante, 'Hola vigilante de ' + C.condo.name)}
        ${item('🌿', 'Jardinero', c.jardinero, 'Hola, consulta sobre áreas verdes en ' + C.condo.name)}
        <div class="card contact"><div><strong>✉️ Correo</strong><span class="muted">${esc(c.email)}</span></div><a class="btn sm" href="mailto:${esc(c.email)}">Escribir</a></div>
      </div><div><div id="map" role="img" aria-label="Mapa de ubicación"></div><p class="muted">Ubicación referencial en el municipio Los Guayos (resaltado), estado Carabobo.</p></div></div>`;
  }
  let map = null;
  function initMap() {
    const el = $('#map'); if (!el || typeof L === 'undefined') return;
    if (map) { map.remove(); map = null; }
    const m = map = L.map(el).setView([C.condo.lat, C.condo.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
    L.marker([C.condo.lat, C.condo.lng]).addTo(m).bindPopup(`<strong>${esc(C.condo.name)}</strong><br>${esc(C.condo.address)}`).openPopup();
    const vb = L.latLngBounds([C.condo.lat - .35, C.condo.lng - .35], [C.condo.lat + .35, C.condo.lng + .35]);
    fetch(C.assets.geoADM2).then(r => r.json()).then(g => {
      if (map !== m) return;
      L.geoJSON(g, {
        filter: ft => { try { return L.geoJSON(ft).getBounds().intersects(vb); } catch (e) { return false; } },
        style: ft => norm((ft.properties || {}).shapeName).includes('guayos') ? { color: '#e36414', weight: 3, fillOpacity: .15 } : { color: '#6a8791', weight: 1, fillOpacity: 0 },
        onEachFeature: (ft, ly) => { const n = (ft.properties || {}).shapeName; if (n) ly.bindTooltip(n, { sticky: true }); }
      }).addTo(m);
    }).catch(() => { /* el mapa base funciona sin el geojson */ });
  }

  /* ---------- render principal ---------- */
  const VIEWS = { inicio: vInicio, pagos: vPagos, tickets: vTickets, reservas: vReservas, cartelera: vCartelera, votos: vVotos, mant: vMant, visitas: vVisitas, sugerencias: vSugerencias, asistente: vAsistente, contactos: vContactos };
  function render() {
    const r = route();
    $('#nav').innerHTML = SECTIONS.map(([k, l]) => `<a href="#/${k}" class="${k === r ? 'active' : ''}" ${k === r ? 'aria-current="page"' : ''}>${l}</a>`).join('');
    $('#myUnit').innerHTML = unitOpts(ui.unit);
    $('#roleBtn').textContent = ui.admin ? '🔑 Modo encargado · salir' : '👤 Soy el encargado';
    $('#app').innerHTML = VIEWS[r]();
    if (r === 'contactos') initMap();
    if (r === 'asistente') { const ch = $('#chat'); if (ch) ch.scrollTop = ch.scrollHeight; }
  }
  function boot() {
    const a = C.assets;
    $('#logoOGU').src = a.logoOGU; $('#logoConc').src = a.logoConc;
    $('#logoOGU').onerror = e => e.target.remove(); $('#logoConc').onerror = e => e.target.remove();
    $('#footCondo').textContent = `${C.app.name} · ${C.condo.name}`;
    $('#footAddr').textContent = C.condo.address;
    const ph = $('#footPhone'); ph.textContent = fmtPhone(C.contacts.central); ph.href = telLink(C.contacts.central);
    const ml = $('#footMail'); ml.textContent = C.contacts.email; ml.href = 'mailto:' + C.contacts.email;
    $('#social').innerHTML = [['facebook', a.iconFb, 'Facebook'], ['instagram', a.iconIg, 'Instagram'], ['tiktok', a.iconTt, 'TikTok'], ['whatsapp', a.iconWa, 'WhatsApp']].map(([k, src, n]) => `<a href="${C.social[k]}" target="_blank" rel="noopener" aria-label="${n}"><img src="${src}" alt="${n}" onerror="this.parentNode.textContent='${n}'"></a>`).join('');
    $('#footAdmin').innerHTML = `<button class="linkbtn" data-act="reset">Restablecer datos de demostración</button>`;
    render();
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', async e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    if (a === 'bg') { if (e.target === el) closeModal(); return; }
    if (a === 'close') return closeModal();
    if (a === 'reset') { if (confirm('¿Restablecer todos los datos de demostración? Se perderán los cambios.')) { S = seed(); persist(); ui.recon = null; ui.chat = null; render(); toast('Datos restablecidos'); } return; }
    switch (a) {
      case 'pay-register': modal('Registrar pago', payForm({ unit: el.dataset.unit, period: el.dataset.period })); break;
      case 'pay-void': if (confirm('¿Anular este pago?')) { delete S.payments[el.dataset.unit][el.dataset.period]; persist(); render(); toast('Pago anulado'); } break;
      case 'receipt': showReceipt(Number(el.dataset.unit), el.dataset.period); break;
      case 'print': window.print(); break;
      case 'pay-report': {
        const un = unitStatus(ui.unit).unpaid;
        modal('Reportar mi pago', `<form data-form="pay-report"><label class="f"><span>Mes que pagas</span><select name="period">${opts((un.length ? un : [ymOf(new Date())]).map(p => [p, monthLabel(p)]))}</select></label>
          <div class="row"><label class="f"><span>Monto (USD)</span><input name="amount" type="number" step="0.01" value="${FEE}" required></label><label class="f"><span>Método</span><select name="method">${opts(['Pago móvil', 'Transferencia', 'Zelle', 'Efectivo'])}</select></label></div>
          <label class="f"><span>Referencia</span><input name="ref" placeholder="N.º de operación"></label>
          <label class="f"><span>Captura del comprobante (opcional)</span><input type="file" name="photo" accept="image/*"></label>
          <button class="btn orange" type="submit">Enviar al encargado</button></form>`); break;
      }
      case 'rep-ok': {
        const r = S.reports.find(x => x.id === id); if (!r) break;
        if (isPaid(r.unit, r.period)) { r.status = 'Confirmado'; persist(); render(); toast('Ese mes ya estaba pagado'); break; }
        S.payments[r.unit][r.period] = { amount: r.amount, date: todayIso(), method: r.method, ref: r.ref };
        r.status = 'Confirmado'; persist(); render(); showReceipt(r.unit, r.period); break;
      }
      case 'rep-no': { const r = S.reports.find(x => x.id === id); if (r) { r.status = 'Rechazado'; persist(); render(); } break; }
      case 'exp-add': modal('Registrar gasto', `<form data-form="exp-add"><div class="row"><label class="f"><span>Fecha</span><input type="date" name="date" value="${todayIso()}" required></label><label class="f"><span>Monto (USD)</span><input type="number" name="amount" step="0.01" min="0" required></label></div>
        <label class="f"><span>Concepto</span><select name="cat">${opts(D.expenseCategories)}</select></label><label class="f"><span>Proveedor</span><input name="provider" required maxlength="60"></label><label class="f"><span>Nota (opcional)</span><input name="note" maxlength="100"></label><button class="btn" type="submit">Guardar gasto</button></form>`); break;
      case 'csv': exportCsv(); break;
      case 'tk-new': modal('Nuevo ticket de atención', `<form data-form="tk-new"><p class="muted">Respuesta del encargado en máximo ${C.slaHours} horas.</p>
          ${ui.admin ? `<label class="f"><span>Vivienda</span><select name="unit">${unitOpts(ui.unit)}</select></label>` : ''}
          <div class="row"><label class="f"><span>Categoría</span><select name="cat">${opts(D.ticketCategories)}</select></label><label class="f"><span>Prioridad</span><select name="prio">${opts(['Baja', 'Media', 'Alta'], 'Media')}</select></label></div>
          <label class="f"><span>Describe el problema</span><textarea name="desc" required maxlength="500" placeholder="Ej.: bombillo quemado frente a la quinta 12"></textarea></label>
          <label class="f"><span>Foto (opcional)</span><input type="file" name="photo" accept="image/*" capture="environment"></label>
          <button class="btn orange" type="submit">Crear ticket</button></form>`); break;
      case 'tk-filter': ui.tkFilter = el.dataset.f; render(); break;
      case 'tk-manage': {
        const t = S.tickets.find(x => x.id === id); if (!t) break;
        modal(`Gestionar ${t.id}`, `<p>${esc(t.desc)}</p><form data-form="tk-manage"><input type="hidden" name="id" value="${t.id}">
          <div class="row"><label class="f"><span>Estado</span><select name="status">${opts(['Abierto', 'En proceso', 'Resuelto'], t.status)}</select></label><label class="f"><span>Asignar a</span><select name="assignee"><option value="">— sin asignar —</option>${opts(D.assignees, t.assignee)}</select></label></div>
          <label class="f"><span>Respuesta al vecino</span><textarea name="text" placeholder="Escribe la respuesta…"></textarea></label><button class="btn" type="submit">Guardar</button></form>`); break;
      }
      case 'cal-prev': ui.cal = addMonths(ui.cal, -1); render(); break;
      case 'cal-next': ui.cal = addMonths(ui.cal, 1); render(); break;
      case 'cal-today': ui.cal = ymOf(new Date()); render(); break;
      case 'day': dayModal(el.dataset.date); break;
      case 'res-new': modal('Reservar un área', resForm(), true); break;
      case 'res-ok': { const r = S.reservations.find(x => x.id === id); if (r) { r.status = 'Reservado'; persist(); closeModal(); render(); toast('Reserva confirmada'); } break; }
      case 'res-no': { const r = S.reservations.find(x => x.id === id); if (r) { r.status = 'Rechazada'; persist(); closeModal(); render(); toast('Reserva rechazada'); } break; }
      case 'res-dep': { const r = S.reservations.find(x => x.id === id); if (r) { r.depositPaid = true; persist(); closeModal(); render(); toast('Depósito registrado'); } break; }
      case 'res-del': if (confirm('¿Eliminar esta reserva?')) { S.reservations = S.reservations.filter(x => x.id !== id); persist(); closeModal(); render(); } break;
      case 'notice-add': modal('Publicar aviso', `<form data-form="notice-add"><label class="f"><span>Título</span><input name="title" required maxlength="80"></label><label class="f"><span>Nivel</span><select name="level">${opts(['Aviso', 'Importante', 'Urgente'])}</select></label><label class="f"><span>Mensaje</span><textarea name="text" required maxlength="600"></textarea></label><button class="btn" type="submit">Publicar</button></form>`); break;
      case 'notice-del': S.notices = S.notices.filter(n => n.id !== id); persist(); render(); break;
      case 'vote': { const p = S.polls.find(x => x.id === id); if (p && p.status === 'Abierta') { p.votes[ui.unit] = Number(el.dataset.opt); persist(); render(); toast('Voto registrado'); } break; }
      case 'poll-new': modal('Nueva consulta', `<form data-form="poll-new"><label class="f"><span>Pregunta</span><input name="title" required maxlength="120"></label><label class="f"><span>Descripción</span><input name="desc" maxlength="200"></label><label class="f"><span>Opciones (una por línea, mínimo 2)</span><textarea name="options" required>Sí\nNo</textarea></label><button class="btn" type="submit">Abrir consulta</button></form>`); break;
      case 'poll-close': { const p = S.polls.find(x => x.id === id); if (p) { p.status = 'Cerrada'; persist(); render(); } break; }
      case 'maint-done': { const m = S.maint.find(x => x.id === id); if (m) { m.last = todayIso(); S.maintLog.push({ date: todayIso(), name: m.name, note: '' }); persist(); render(); toast('Mantenimiento registrado'); } break; }
      case 'maint-add': modal('Nueva tarea preventiva', `<form data-form="maint-add"><label class="f"><span>Tarea</span><input name="name" required maxlength="60"></label><label class="f"><span>Área</span><input name="area" required maxlength="60"></label><div class="row"><label class="f"><span>Cada (días)</span><input type="number" name="every" min="1" value="30" required></label><label class="f"><span>Último realizado</span><input type="date" name="last" value="${todayIso()}" required></label></div><button class="btn" type="submit">Guardar</button></form>`); break;
      case 'visit-show': showPass(id); break;
      case 'suggest-mail': { const f = $('form[data-form=suggest]').elements; const msg = f.msg.value.trim(); if (!msg) { toast('Escribe tu mensaje primero'); break; } location.href = `mailto:${C.contacts.email}?subject=${encodeURIComponent('Sugerencia - ' + C.condo.name)}&body=${encodeURIComponent(msg + '\n\n— ' + (f.name.value || 'Vecino'))}`; break; }
      case 'ask': ask(el.dataset.q); break;
      case 'toggle-role': break;
    }
  });

  function ask(q) {
    ui.chat = ui.chat || [];
    ui.chat.push({ me: true, t: q }, { me: false, t: botAnswer(q) });
    render();
  }

  document.addEventListener('change', e => {
    const k = e.target.dataset.change; if (!k) return;
    if (k === 'period') { ui.period = e.target.value; render(); }
    if (k === 'res-area') {
      const a = AREAS[e.target.value], n = $('#depNote'); if (n) n.textContent = `Depósito de garantía: ${a.deposit ? money(a.deposit) : 'sin depósito'}. Horario: ${a.hours}.`;
    }
  });
  $('#myUnit').addEventListener('change', e => { ui.unit = Number(e.target.value); localStorage.setItem('ogu.unit', ui.unit); render(); });
  $('#roleBtn').addEventListener('click', () => {
    if (ui.admin) { ui.admin = false; sessionStorage.removeItem('ogu.admin'); render(); toast('Saliste del modo encargado'); return; }
    modal('Acceso del encargado', `<form data-form="pin"><label class="f"><span>PIN del encargado</span><input type="password" name="pin" inputmode="numeric" autocomplete="off" required></label><p class="muted">Demostración: el PIN se define en data.js (adminPin). En producción usa autenticación en servidor.</p><button class="btn" type="submit">Entrar</button></form>`);
  });
  window.addEventListener('hashchange', () => { closeModal(); render(); window.scrollTo(0, 0); });

  document.addEventListener('submit', async e => {
    const form = e.target.closest('form[data-form]'); if (!form) return;
    e.preventDefault();
    const k = form.dataset.form, v = Object.fromEntries(new FormData(form).entries());
    try {
      switch (k) {
        case 'pin':
          if (v.pin === C.adminPin) { ui.admin = true; sessionStorage.setItem('ogu.admin', '1'); closeModal(); render(); toast('Modo encargado activado'); } else toast('PIN incorrecto');
          break;
        case 'pay-register': {
          const u = Number(v.unit), amt = parseFloat(v.amount);
          if (!u || !(amt > 0)) { toast('Revisa vivienda y monto'); break; }
          if (isPaid(u, v.period)) { toast(`${unitCode(u)} ya tiene pagado ${monthLabel(v.period)}`); break; }
          S.payments[u][v.period] = { amount: amt, date: v.date, method: v.method, ref: v.ref || '—' };
          persist(); ui.recon = null; ui.reconText = ''; closeModal(); render(); showReceipt(u, v.period); break;
        }
        case 'recon': {
          ui.reconText = v.text; const r = parseTransfer(v.text), warn = [];
          if (!r.unit) warn.push('No pude identificar la vivienda: selecciónala manualmente.');
          if (r.amount == null || isNaN(r.amount)) warn.push('No detecté el monto.'); else if (Math.abs(r.amount - FEE) > .009) warn.push(`El monto detectado (${r.amount}) es distinto a la cuota de ${money(FEE)}. Verifica moneda y tasa.`);
          if (!r.ref) warn.push('No detecté número de referencia.');
          if (r.ref && Object.values(S.payments).some(m => Object.values(m).some(x => x.ref === r.ref))) warn.push('⚠️ Esta referencia ya fue registrada antes (posible duplicado).');
          const un = r.unit ? unitStatus(r.unit).unpaid : [];
          ui.recon = { warn, pre: { unit: r.unit || '', amount: r.amount, ref: r.ref, method: r.method, period: un[0] || ui.period, date: todayIso() } };
          render(); break;
        }
        case 'pay-report': {
          const photo = form.elements.photo.files[0] ? await fileToImg(form.elements.photo.files[0]) : '';
          S.reports.push({ id: uid(), unit: ui.unit, period: v.period, amount: parseFloat(v.amount), method: v.method, ref: v.ref, photo, at: new Date().toISOString(), status: 'Pendiente' });
          if (persist()) { closeModal(); render(); toast('Pago reportado. El encargado lo confirmará.'); } else S.reports.pop();
          break;
        }
        case 'exp-add':
          S.expenses.push({ id: uid(), date: v.date, cat: v.cat, provider: v.provider, amount: parseFloat(v.amount), note: v.note || '' }); persist(); closeModal(); render(); toast('Gasto registrado'); break;
        case 'tk-new': {
          const unit = ui.admin && v.unit ? Number(v.unit) : ui.unit, photo = form.elements.photo.files[0] ? await fileToImg(form.elements.photo.files[0]) : '';
          const t = { id: 'OGU-' + String(S.nextTicket++).padStart(4, '0'), unit, cat: v.cat, prio: v.prio, desc: v.desc.trim(), photo, created: new Date().toISOString(), status: 'Abierto', assignee: '', responses: [], firstResponseAt: null };
          S.tickets.push(t);
          if (!persist()) { S.tickets.pop(); S.nextTicket--; break; }
          render();
          modal('Ticket creado', `<p>✅ <strong>${t.id}</strong> registrado. El encargado responderá en máximo <strong>${C.slaHours} horas</strong>.</p><p>Si es urgente, avísale directamente:</p><div class="actions"><a class="btn green" target="_blank" rel="noopener" href="${waLink(C.contacts.central, `Nuevo ticket ${t.id} (${t.cat}, prioridad ${t.prio}) de ${famOf(unit).name} ${unitCode(unit)}: ${t.desc}`)}">Avisar por WhatsApp</a><button class="btn ghost" data-act="close">Cerrar</button></div>`);
          break;
        }
        case 'tk-manage': {
          const t = S.tickets.find(x => x.id === v.id); if (!t) break;
          t.status = v.status; t.assignee = v.assignee;
          if (v.text.trim()) t.responses.push({ by: 'Encargado', text: v.text.trim(), at: new Date().toISOString() });
          if (!t.firstResponseAt && (v.text.trim() || v.status !== 'Abierto')) t.firstResponseAt = new Date().toISOString();
          if (t.status === 'Resuelto' && !t.resolvedAt) t.resolvedAt = new Date().toISOString();
          persist(); closeModal(); render(); toast('Ticket actualizado'); break;
        }
        case 'res-new': {
          const unit = ui.admin && v.unit ? Number(v.unit) : ui.unit, f = famOf(unit);
          if (v.end <= v.start) { toast('La hora final debe ser posterior a la inicial'); break; }
          if (v.date < todayIso()) { toast('La fecha ya pasó'); break; }
          const a = AREAS[v.area], r = { id: uid(), area: v.area, date: v.date, start: v.start, end: v.end, unit, name: f.name, title: (v.title || '').trim(), status: ui.admin ? 'Reservado' : 'Pendiente', deposit: a.deposit, depositPaid: false };
          const clash = S.reservations.find(x => overlap(x, r));
          if (clash) { toast(`Choque con la reserva de ${clash.name} (${fmtTime(clash.start)} – ${fmtTime(clash.end)})`); break; }
          S.reservations.push(r); persist(); closeModal(); ui.cal = v.date.slice(0, 7); render();
          toast(ui.admin ? 'Reserva agregada al calendario' : 'Solicitud enviada: queda visible como pendiente hasta que el encargado la confirme'); break;
        }
        case 'notice-add': S.notices.unshift({ id: uid(), level: v.level, title: v.title, text: v.text, date: todayIso() }); persist(); closeModal(); render(); break;
        case 'poll-new': {
          const options = v.options.split('\n').map(x => x.trim()).filter(Boolean);
          if (options.length < 2) { toast('Agrega al menos 2 opciones'); break; }
          S.polls.unshift({ id: uid(), title: v.title, desc: v.desc || '', options, votes: {}, status: 'Abierta', created: todayIso() }); persist(); closeModal(); render(); break;
        }
        case 'maint-add': S.maint.push({ id: uid(), name: v.name, area: v.area, every: Number(v.every), last: v.last }); persist(); closeModal(); render(); break;
        case 'visit-new': {
          const unit = ui.admin && v.unit ? Number(v.unit) : ui.unit;
          const code = 'OGU-' + Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
          const p = { id: uid(), code, unit, visitor: v.visitor.trim(), doc: (v.doc || '').trim(), type: v.type, date: v.date, status: 'Vigente' };
          S.visits.push(p); persist(); render(); showPass(p.id); break;
        }
        case 'gate': {
          const code = v.code.trim().toUpperCase(), p = S.visits.find(x => x.code === code);
          if (!p) ui.gate = { cls: 'bad', html: `❌ Código <strong>${esc(code)}</strong> no encontrado.` };
          else { const s = passState(p); const info = `<strong>${esc(p.visitor)}</strong> (${esc(p.type)}) → ${unitCode(p.unit)} ${esc(famOf(p.unit).name)}`;
            if (s.txt === 'Vigente hoy') { p.status = 'Ingresó'; p.enteredAt = new Date().toISOString(); persist(); ui.gate = { cls: 'ok', html: `✅ Acceso autorizado: ${info}` }; }
            else if (s.txt === 'Ingresó') ui.gate = { cls: 'warn', html: `⚠️ Este pase ya fue usado: ${info}` };
            else if (s.txt === 'Programado') ui.gate = { cls: 'warn', html: `⚠️ Pase para otra fecha (${fmtDate(p.date)}): ${info}` };
            else ui.gate = { cls: 'bad', html: `❌ Pase vencido (${fmtDate(p.date)}): ${info}` }; }
          render(); break;
        }
        case 'suggest': {
          const msg = v.msg.trim(); if (!msg) break;
          S.suggestions.push({ cat: v.cat, msg, name: v.name, at: new Date().toISOString() }); persist();
          const text = `📬 ${v.cat} · ${C.condo.name}\nDe: ${v.name || 'Vecino anónimo'}\n\n${msg}`;
          window.open(waLink(C.contacts.central, text), '_blank', 'noopener'); render(); toast('Se abrió WhatsApp con tu mensaje listo para enviar'); break;
        }
        case 'chat': { const q = v.q.trim(); if (q) ask(q); break; }
      }
    } catch (err) { console.error(err); toast('Ocurrió un error. Intenta de nuevo.'); }
  });

  /* ---------- recibo y exportación ---------- */
  function showReceipt(u, p) {
    const x = S.payments[u] && S.payments[u][p]; if (!x) return;
    const f = famOf(u), no = `REC-${p.replace('-', '')}-${pad(u)}`;
    modal('Recibo de condominio', `<div class="receipt"><div class="rh"><img src="${C.assets.logoOGU}" alt="" onerror="this.remove()"><div style="text-align:right"><strong>${esc(C.condo.name)}</strong><br><small>${esc(C.condo.address)}</small></div></div>
      <h3>Recibo N.º ${no}</h3>
      <dl><dt>Recibido de</dt><dd>${esc(f.name)}</dd><dt>Vivienda</dt><dd>${unitCode(u)} · Piso ${f.piso}</dd><dt>Concepto</dt><dd>Cuota de condominio · ${monthLabel(p)}</dd><dt>Monto</dt><dd>${money(x.amount)}</dd><dt>Método / ref.</dt><dd>${esc(x.method)} · ${esc(x.ref)}</dd><dt>Fecha de pago</dt><dd>${fmtDate(x.date)}</dd></dl>
      <div class="sign">Encargado de condominio</div><p><small>${esc(C.app.name)} · ${esc(C.app.slogan)}</small></p></div>
      <div class="actions"><button class="btn" data-act="print">🖨️ Imprimir / guardar PDF</button><a class="btn green" target="_blank" rel="noopener" href="${waLink('', `Recibo ${no}: ${f.name}, ${unitCode(u)}, cuota de ${monthLabel(p)} por ${money(x.amount)}. Pago recibido, gracias. — ${C.condo.name}`)}">Enviar por WhatsApp</a></div>`, true);
  }
  function exportCsv() {
    const cols = periodsAll();
    const lines = [['Vivienda', 'Familia', ...cols, 'Deuda USD'].join(',')];
    FAM.forEach(f => lines.push([unitCode(f.id), `"${f.name}"`, ...cols.map(q => isPaid(f.id, q) ? S.payments[f.id][q].amount : ''), unitStatus(f.id).due].join(',')));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = `pagos-${C.condo.name.replace(/\s+/g, '-').toLowerCase()}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }

  /* refresco de contadores de 24 h */
  setInterval(() => { if (!modalOpen() && ['inicio', 'tickets'].includes(route()) && !document.activeElement.closest('form')) render(); }, 60000);

  boot();
})();

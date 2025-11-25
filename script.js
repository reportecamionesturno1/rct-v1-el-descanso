/* ============================================================
   Estado principal (cargado/guardado en localStorage)
   ============================================================ */
const LS_KEY = 'rct_state_v1';

let rct = loadState() || {
  encabezado: {
    fecha: '',   // dd/mm/aaaa
    turno: '1',  // “Grupo” (1/2/3)
    dia: 'Día',  // Turno: Día/Noche
    supervisores: '',
    responsable: ''
  },
  productividad: {
    horaLlegadaBuses: []  // [{bahia,hora}]
  },
  equiposVarados: [],     // [{camion, ubicacion, razon}]
  comentarios: []         // [{ts, autor, tag, texto}]
};

function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(rct)); }
function loadState(){
  try{ return JSON.parse(localStorage.getItem(LS_KEY)); }catch(e){ return null; }
}

/* ============================================================
   Utilidades para nombres/fechas de archivo
   ============================================================ */
function formatDateForFile(d){ // dd-mm-yyyy
  const pad=n=>String(n).padStart(2,'0');
  return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`;
}

function getReportDate(){
  const v = (rct?.encabezado?.fecha || '').trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
    const [dd,mm,yyyy] = v.split('/');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }
  return new Date();
}

function buildFileName(ext){
  const d = getReportDate();
  const dateStr = formatDateForFile(d);
  const grupo  = (rct?.encabezado?.turno || '1');
  const turnoDN = (rct?.encabezado?.dia || 'Día'); // solo para visualizar si luego lo incluyes
  const pit    = (rct?.meta?.pit || 'Pit');
  const lugar  = (rct?.meta?.lugar || 'Bahia');
  return `RCT-ED-${dateStr}-${grupo}-${pit}-${lugar}.${ext}`;
}

/* ============================================================
   Render de la vista imprimible (#printArea)
   ============================================================ */
function renderPrint(){
  // Encabezado
  const headTbody = document.getElementById('printHead');
  headTbody.innerHTML = `
    <tr>
      <td class="fw-bold">Fecha</td><td>${rct.encabezado.fecha||''}</td>
      <td class="fw-bold">Grupo</td><td>${rct.encabezado.turno||''}</td>
      <td class="fw-bold">Turno</td><td>${rct.encabezado.dia||''}</td>
    </tr>
    <tr>
      <td class="fw-bold">Supervisores</td><td colspan="2">${rct.encabezado.supervisores||''}</td>
      <td class="fw-bold">Responsable</td><td colspan="2">${rct.encabezado.responsable||''}</td>
    </tr>
  `;

  // Buses
  const bdyBuses = document.getElementById('printBuses');
  bdyBuses.innerHTML = (rct.productividad.horaLlegadaBuses.length ? 
    rct.productividad.horaLlegadaBuses.map(r=>`<tr><td>${r.bahia}</td><td>${r.hora}</td></tr>`).join('') :
    `<tr><td colspan="2" class="text-center text-muted">—</td></tr>`
  );

  // Varados
  const bdyVar = document.getElementById('printVarados');
  bdyVar.innerHTML = (rct.equiposVarados.length ?
    rct.equiposVarados.map(r=>`<tr><td>${r.camion}</td><td>${r.ubicacion}</td><td>${r.razon}</td></tr>`).join('') :
    `<tr><td colspan="3" class="text-center text-muted">—</td></tr>`
  );

  // Comentarios
  const bdyCom = document.getElementById('printCom');
  bdyCom.innerHTML = (rct.comentarios.length ?
    rct.comentarios.map(c=>{
      const ts = new Date(c.ts||Date.now()).toLocaleString();
      return `<tr><td>${ts}</td><td>${c.autor||''}</td><td>${c.tag||''}</td><td>${c.texto||''}</td></tr>`;
    }).join('') :
    `<tr><td colspan="4" class="text-center text-muted">—</td></tr>`
  );
}

/* ============================================================
   Poblado de tablas en UI (no imprimible)
   ============================================================ */
function renderTables(){
  // Buses
  const t1 = document.querySelector('#tblBuses tbody');
  t1.innerHTML = rct.productividad.horaLlegadaBuses.map((r,i)=>`
    <tr>
      <td>${r.bahia}</td>
      <td>${r.hora}</td>
      <td><button class="btn btn-sm btn-outline-danger" data-del-bus="${i}">🗑</button></td>
    </tr>
  `).join('') || `<tr><td colspan="3" class="text-center text-muted">Sin registros</td></tr>`;

  // Varados
  const t2 = document.querySelector('#tblVarados tbody');
  t2.innerHTML = rct.equiposVarados.map((r,i)=>`
    <tr>
      <td>${r.camion}</td>
      <td>${r.ubicacion}</td>
      <td>${r.razon}</td>
      <td><button class="btn btn-sm btn-outline-danger" data-del-var="${i}">🗑</button></td>
    </tr>
  `).join('') || `<tr><td colspan="4" class="text-center text-muted">Sin registros</td></tr>`;

  // Comentarios
  const t3 = document.querySelector('#tblComentarios tbody');
  t3.innerHTML = rct.comentarios.map((c,i)=>{
    const ts = new Date(c.ts||Date.now()).toLocaleString();
    return `
      <tr>
        <td>${ts}</td><td>${c.autor||''}</td><td>${c.tag||''}</td><td>${c.texto||''}</td>
        <td><button class="btn btn-sm btn-outline-danger" data-del-com="${i}">🗑</button></td>
      </tr>`;
  }).join('') || `<tr><td colspan="5" class="text-center text-muted">Sin registros</td></tr>`;
}

/* ============================================================
   Navegación de pasos
   ============================================================ */
function switchStep(step){
  document.querySelectorAll('.step').forEach(s=>{
    s.classList.toggle('d-none', s.dataset.step !== step);
  });
  document.querySelectorAll('#wizardNav .nav-link').forEach(b=>{
    b.classList.toggle('active', b.dataset.step === step);
  });
  if (step === 'sum') renderPrint();
}

document.querySelectorAll('#wizardNav .nav-link').forEach(b=>{
  b.addEventListener('click', ()=> switchStep(b.dataset.step));
});

/* ============================================================
   Inicialización de entradas y valores por defecto
   ============================================================ */
function initForm(){
  // Fecha por defecto si no hay
  if (!rct.encabezado.fecha){
    const d = new Date();
    const pad=n=>String(n).padStart(2,'0');
    rct.encabezado.fecha = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  }
  // volcar a inputs
  document.getElementById('fechaInput').value = rct.encabezado.fecha;
  document.getElementById('grupoInput').value = rct.encabezado.turno;
  document.getElementById('turnoDN').value = rct.encabezado.dia;
  document.getElementById('supInput').value = rct.encabezado.supervisores;
  document.getElementById('respInput').value = rct.encabezado.responsable;

  // cambios
  document.getElementById('fechaInput').addEventListener('input', e=>{
    rct.encabezado.fecha = e.target.value; saveState(); renderPrint();
  });
  document.getElementById('grupoInput').addEventListener('change', e=>{
    rct.encabezado.turno = e.target.value; saveState(); renderPrint();
  });
  document.getElementById('turnoDN').addEventListener('change', e=>{
    rct.encabezado.dia = e.target.value; saveState(); renderPrint();
  });
  document.getElementById('supInput').addEventListener('input', e=>{
    rct.encabezado.supervisores = e.target.value; saveState(); renderPrint();
  });
  document.getElementById('respInput').addEventListener('input', e=>{
    rct.encabezado.responsable = e.target.value; saveState(); renderPrint();
  });
}

/* ============================================================
   Acciones: agregar/eliminar filas
   ============================================================ */
document.getElementById('btnAddBus').addEventListener('click', ()=>{
  const bahia = document.getElementById('inBahia').value.trim();
  const hora  = document.getElementById('inHora').value.trim();
  if (!bahia || !hora) return;
  rct.productividad.horaLlegadaBuses.push({bahia,hora});
  document.getElementById('inBahia').value = '';
  document.getElementById('inHora').value = '';
  saveState(); renderTables(); renderPrint();
});

document.getElementById('btnAddVarado').addEventListener('click', ()=>{
  const camion = document.getElementById('inCamion').value.trim();
  const ubic   = document.getElementById('inUbic').value.trim();
  const razon  = document.getElementById('inRazon').value.trim();
  if (!camion || !ubic || !razon) return;
  rct.equiposVarados.push({camion, ubicacion:ubic, razon});
  document.getElementById('inCamion').value = '';
  document.getElementById('inUbic').value   = '';
  document.getElementById('inRazon').value  = '';
  saveState(); renderTables(); renderPrint();
});

document.getElementById('btnAddCom').addEventListener('click', ()=>{
  const autor = document.getElementById('inAutor').value.trim();
  const tag   = document.getElementById('inTipo').value.trim();
  const texto = document.getElementById('inComentario').value.trim();
  if (!texto) return;
  rct.comentarios.push({ts: Date.now(), autor, tag, texto});
  document.getElementById('inAutor').value = '';
  document.getElementById('inTipo').value  = '';
  document.getElementById('inComentario').value = '';
  saveState(); renderTables(); renderPrint();
});

// delegación para borrar
document.addEventListener('click', (e)=>{
  const b1 = e.target.closest('[data-del-bus]');
  if (b1){
    const i = +b1.dataset.delBus; rct.productividad.horaLlegadaBuses.splice(i,1);
    saveState(); renderTables(); renderPrint(); return;
  }
  const b2 = e.target.closest('[data-del-var]');
  if (b2){
    const i = +b2.dataset.delVar; rct.equiposVarados.splice(i,1);
    saveState(); renderTables(); renderPrint(); return;
  }
  const b3 = e.target.closest('[data-del-com]');
  if (b3){
    const i = +b3.dataset.delCom; rct.comentarios.splice(i,1);
    saveState(); renderTables(); renderPrint(); return;
  }
});

/* ============================================================
   Exportar: imprimir / PDF (texto) / JPG / Excel / CSV / JSON
   ============================================================ */
document.querySelector('#btnPrint').addEventListener('click', () => {
  renderPrint();
  window.print();
});

document.querySelector('#btnPDF').addEventListener('click', () => {
  try{
    const asText = (v) => {
      if (v == null) return '';
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      if (v.nombre) return String(v.nombre);
      if (v.label)  return String(v.label);
      return JSON.stringify(v);
    };
    const { jsPDF } = window.jspdf || window;

    const attempts = [
      { fontSize: 10, pad: 3 },
      { fontSize: 9,  pad: 2.5 },
      { fontSize: 8,  pad: 2   },
      { fontSize: 7.5,pad: 1.6 },
      { fontSize: 7,  pad: 1.4 },
    ];

    const build = ({fontSize, pad}) => {
      const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const M = 12;
      let y = M;

      // logos
      try{
        const l1 = new Image(); l1.src = 'assets/img/logo_drummond.png';
        const l2 = new Image(); l2.src = 'assets/img/yo-estoy-con.png';
        doc.addImage(l1, 'PNG', M, y-4, 10, 10);
        doc.addImage(l2, 'PNG', pageW-M-10, y-4, 10, 10);
      }catch(_){}

      doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.text('REPORTE CAMBIO DE TURNO – MINA EL DESCANSO', M, y);
      y += 6;

      const enc = rct.encabezado || {};
      const head1 = [['Fecha','Grupo','Turno','Supervisores','Responsable']];
      const body1 = [[
        asText(enc.fecha), asText(enc.turno), asText(enc.dia),
        asText(enc.supervisores), asText(enc.responsable)
      ]];
      doc.autoTable({
        startY: y, head: head1, body: body1, theme:'grid',
        styles:{ fontSize, cellPadding: pad, valign:'middle' },
        headStyles:{ fillColor:[230,230,230] },
        margin:{ left:M, right:M }, tableWidth: pageW - M*2
      });
      y = doc.lastAutoTable.finalY + 4;

      doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.text('HORA LLEGADA BUSES A BAHÍAS', M, y-1.5);
      const buses = (rct.productividad?.horaLlegadaBuses || [])
        .map(r => [asText(r.bahia), asText(r.hora)]);
      doc.autoTable({
        startY: y, head:[['Bahía','Hora']], body: buses.length?buses:[['—','—']],
        theme:'grid', styles:{ fontSize, cellPadding: pad },
        headStyles:{ fillColor:[230,230,230] },
        margin:{ left:M, right:M }, tableWidth: pageW - M*2
      });
      y = doc.lastAutoTable.finalY + 6;

      doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.text('EQUIPOS VARADOS EN CAMPO', M, y-1.5);
      const varados = (rct.equiposVarados || [])
        .map(r => [asText(r.camion), asText(r.ubicacion), asText(r.razon)]);
      doc.autoTable({
        startY: y, head:[['Camión','Ubicación','Razón']], body: varados.length?varados:[['—','—','—']],
        theme:'grid', styles:{ fontSize, cellPadding: pad },
        headStyles:{ fillColor:[230,230,230] },
        margin:{ left:M, right:M }, tableWidth: pageW - M*2
      });
      y = doc.lastAutoTable.finalY + 6;

      doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.text('COMENTARIOS', M, y-1.5);
      const comRows = (rct.comentarios || []).map(c => [
        new Date(c.ts||Date.now()).toLocaleString(),
        asText(c.autor), asText(c.tag), asText(c.texto)
      ]);
      doc.autoTable({
        startY: y, head:[['Fecha/Hora','Autor','Tipo','Comentario']],
        body: comRows.length?comRows:[['—','—','—','—']],
        theme:'grid', styles:{ fontSize, cellPadding: pad },
        headStyles:{ fillColor:[230,230,230] },
        margin:{ left:M, right:M }, tableWidth: pageW - M*2
      });

      const fits = (doc.lastAutoTable.finalY + M) <= pageH;
      return { doc, fits };
    };

    let out = null;
    for (const a of attempts) { out = build(a); if (out.fits) break; }
    out.doc.save( buildFileName('pdf') );
  }catch(e){
    console.error(e);
    alert('No se pudo generar el PDF.');
  }
});

document.querySelector('#btnJPG').addEventListener('click', async ()=>{
  renderPrint();
  const area = document.getElementById('printArea');
  const canvas = await html2canvas(area, { scale:2, useCORS:true, background:'#fff' });
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/jpeg', 0.92);
  a.download = buildFileName('jpg');
  a.click();
});

document.querySelector('#btnXLSX').addEventListener('click', ()=>{
  const wb  = XLSX.utils.book_new();
  const enc = rct.encabezado || {};
  const aoa = [
    ['REPORTE CAMBIO DE TURNO – MINA EL DESCANSO'],
    ['Fecha', enc.fecha||'', 'Grupo', enc.turno||'', 'Turno', enc.dia||''],
    ['Supervisores', enc.supervisores||'', 'Responsable', enc.responsable||'', '', ''],
    [''],
    ['HORA LLEGADA BUSES A BAHÍAS'],
    ['Bahía','Hora'],
    ...(rct.productividad?.horaLlegadaBuses||[]).map(r=>[r.bahia||'', r.hora||'']),
    [''],
    ['EQUIPOS VARADOS EN CAMPO'],
    ['Camión','Ubicación','Razón'],
    ...(rct.equiposVarados||[]).map(r=>[r.camion||'', r.ubicacion||'', r.razon||'']),
    [''],
    ['COMENTARIOS'],
    ['Fecha/Hora','Autor','Tipo','Comentario'],
    ...(rct.comentarios||[]).map(c=>[
      new Date(c.ts||Date.now()).toLocaleString(),
      (c.autor && (c.autor.nombre||c.autor.label||c.autor)) || '',
      (c.tag && (c.tag.nombre||c.tag.label||c.tag)) || '',
      c.texto||''
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{wch:18},{wch:28},{wch:18},{wch:36},{wch:14},{wch:14}];
  XLSX.utils.book_append_sheet(wb, ws, 'RCT');
  XLSX.writeFile(wb, buildFileName('xlsx'));
});

document.querySelector('#btnCSV').addEventListener('click', ()=>{
  const rows = (rct.productividad?.horaLlegadaBuses||[]).map(r=>({bahia:r.bahia||'', hora:r.hora||''}));
  const csv  = Papa.unparse(rows);
  const a    = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = buildFileName('csv');
  a.click();
});

document.querySelector('#btnJSON').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(rct,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = buildFileName('json');
  a.click();
});

/* ============================================================
   Tema e idioma (ligero)
   ============================================================ */
document.getElementById('btnTheme').addEventListener('click', ()=>{
  document.body.classList.toggle('dark');
});

document.getElementById('btnLang').addEventListener('click', async ()=>{
  // ejemplo ligero: alterna ES/EN y busca assets/lang/*.json
  const cur = document.getElementById('btnLang').textContent.trim().toLowerCase();
  const next = (cur === 'es') ? 'EN' : 'ES';
  document.getElementById('btnLang').textContent = next;

  try{
    const res = await fetch(`assets/lang/${next.toLowerCase()}.json`);
    const dict = await res.json();
    applyDict(dict);
  }catch(_){
    // si no existe el archivo, simplemente no cambia textos
  }
});

function applyDict(dict){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const txt = key.split('.').reduce((o,k)=>o && o[k], dict);
    if (txt) el.textContent = txt;
  });
}

/* ============================================================
   Boot
   ============================================================ */
function init(){
  initForm();
  renderTables();
  renderPrint();
  switchStep('enc');
}
init();

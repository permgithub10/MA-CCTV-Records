// ==========================================================================
// script.js — ตรรกะฟอร์ม MA CCTV Records
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- 0. Helpers ----------
  function fillSelect(selectEl, items, placeholder){
    selectEl.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = placeholder;
    ph.disabled = true;
    ph.selected = true;
    selectEl.appendChild(ph);
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      selectEl.appendChild(opt);
    });
  }

  // ---------- 1. อาคาร -> หน่วยงาน (cascading) ----------
  const buildingSelect = document.getElementById('building');
  const departmentSelect = document.getElementById('department');

  function resetDepartmentPlaceholder(){
    departmentSelect.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '-- เลือกอาคารก่อน --';
    ph.disabled = true;
    ph.selected = true;
    departmentSelect.appendChild(ph);
    departmentSelect.disabled = true;
  }

  fillSelect(buildingSelect, Object.keys(CONFIG.BUILDING_DEPARTMENTS), '-- เลือกอาคาร --');
  resetDepartmentPlaceholder();

  buildingSelect.addEventListener('change', () => {
    const depts = CONFIG.BUILDING_DEPARTMENTS[buildingSelect.value] || [];
    departmentSelect.disabled = false;
    fillSelect(departmentSelect, depts, '-- เลือกหน่วยงาน --');
  });

  fillSelect(document.getElementById('bitrateControl'), CONFIG.BITRATE_CONTROL, '-- เลือก --');
  fillSelect(document.getElementById('videoEncoding'), CONFIG.VIDEO_ENCODING, '-- เลือก --');

  // ---------- 2. Date picker (dd-mm-yyyy, plain text, own calendar) ----------
  const dateInput = document.getElementById('surveyDate');
  let calEl = null;
  let calDate = new Date();

  function pad(n){ return String(n).padStart(2,'0'); }
  function formatDate(d){ return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`; }

  function closeCalendar(){
    if(calEl){ calEl.remove(); calEl = null; }
    document.removeEventListener('click', outsideClickHandler, true);
  }
  function outsideClickHandler(e){
    if(calEl && !calEl.contains(e.target) && e.target !== dateInput){ closeCalendar(); }
  }

  function renderCalendar(){
    if(calEl){ calEl.remove(); }
    calEl = document.createElement('div');
    calEl.style.position = 'absolute';
    calEl.style.background = '#fff';
    calEl.style.border = '1px solid #d8e1e5';
    calEl.style.borderRadius = '10px';
    calEl.style.boxShadow = '0 8px 24px rgba(16,32,43,0.12)';
    calEl.style.padding = '12px';
    calEl.style.zIndex = 999;
    calEl.style.width = '250px';
    calEl.style.fontFamily = "'Noto Sans Thai', sans-serif";

    const y = calDate.getFullYear();
    const m = calDate.getMonth();
    const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '8px';
    header.style.fontSize = '13px';
    header.style.fontWeight = '600';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = '‹';
    prevBtn.style.cssText = 'border:none;background:none;font-size:16px;cursor:pointer;padding:2px 8px;';
    prevBtn.onclick = (e) => { e.stopPropagation(); calDate = new Date(y, m-1, 1); renderCalendar(); };

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = '›';
    nextBtn.style.cssText = 'border:none;background:none;font-size:16px;cursor:pointer;padding:2px 8px;';
    nextBtn.onclick = (e) => { e.stopPropagation(); calDate = new Date(y, m+1, 1); renderCalendar(); };

    const label = document.createElement('span');
    label.textContent = `${monthNames[m]} ${y + 543}`;

    header.appendChild(prevBtn);
    header.appendChild(label);
    header.appendChild(nextBtn);
    calEl.appendChild(header);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    grid.style.gap = '3px';
    grid.style.fontSize = '12px';

    ['อา','จ','อ','พ','พฤ','ศ','ส'].forEach(d => {
      const el = document.createElement('div');
      el.textContent = d;
      el.style.textAlign = 'center';
      el.style.color = '#4c6270';
      el.style.padding = '4px 0';
      grid.appendChild(el);
    });

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    for(let i=0;i<firstDay;i++){ grid.appendChild(document.createElement('div')); }
    for(let d=1; d<=daysInMonth; d++){
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.textContent = d;
      cell.style.cssText = 'border:none;background:#f6f8f9;border-radius:6px;padding:6px 0;cursor:pointer;font-size:12px;';
      cell.onmouseenter = () => cell.style.background = '#e4f2f1';
      cell.onmouseleave = () => cell.style.background = '#f6f8f9';
      cell.onclick = (e) => {
        e.stopPropagation();
        const picked = new Date(y, m, d);
        dateInput.value = formatDate(picked);
        closeCalendar();
      };
      grid.appendChild(cell);
    }
    calEl.appendChild(grid);

    const rect = dateInput.getBoundingClientRect();
    calEl.style.top = (window.scrollY + rect.bottom + 4) + 'px';
    calEl.style.left = (window.scrollX + rect.left) + 'px';
    document.body.appendChild(calEl);
    setTimeout(() => document.addEventListener('click', outsideClickHandler, true), 0);
  }

  dateInput.addEventListener('click', () => {
    calDate = new Date();
    renderCalendar();
  });

  // ค่าเริ่มต้น = วันปัจจุบัน
  dateInput.value = formatDate(new Date());

  // ---------- 3. Camera model rows (col F,G — repeatable, join ด้วย \n) ----------
  const cameraList = document.getElementById('cameraList');
  function addCameraRow(brand='', model=''){
    const row = document.createElement('div');
    row.className = 'repeat-row';
    row.innerHTML = `
      <input type="text" class="cam-brand" placeholder="Brand Camera" value="${brand}">
      <input type="text" class="cam-model" placeholder="Model Camera" value="${model}">
      <button type="button" class="btn-remove">ลบ</button>
    `;
    row.querySelector('.btn-remove').onclick = () => {
      if(cameraList.children.length > 1) row.remove();
    };
    cameraList.appendChild(row);
  }
  document.getElementById('addCamera').onclick = () => addCameraRow();
  addCameraRow(); // start with one row

  // ---------- 4. HDD rows (col P–W — repeatable group, join ด้วย \n) ----------
  const hddList = document.getElementById('hddList');
  let hddCounter = 0;
  function addHddRow(){
    hddCounter++;
    const card = document.createElement('div');
    card.className = 'hdd-card';
    card.innerHTML = `
      <div class="hdd-card-head">
        <span>HDD #${hddCounter}</span>
        <button type="button" class="btn-remove">ลบ</button>
      </div>
      <div class="grid-3">
        <div class="field"><label>SATA No.</label><input type="text" class="hdd-sata" placeholder="เช่น SATA1"></div>
        <div class="field"><label>Model</label><input type="text" class="hdd-model" placeholder="รุ่น HDD"></div>
        <div class="field"><label>Serial Number</label><input type="text" class="hdd-serial"></div>
        <div class="field"><label>Health Status</label><input type="text" class="hdd-health" placeholder="เช่น Good"></div>
        <div class="field"><label>Power-On Hours</label><input type="text" class="hdd-hours"></div>
        <div class="field"><label>Temp (°C)</label><input type="text" class="hdd-temp"></div>
        <div class="field"><label>Reallocated Sectors</label><input type="text" class="hdd-realloc"></div>
        <div class="field"><label>Pending Sectors</label><input type="text" class="hdd-pending"></div>
      </div>
    `;
    card.querySelector('.btn-remove').onclick = () => {
      if(hddList.children.length > 1) card.remove();
    };
    hddList.appendChild(card);
  }
  document.getElementById('addHdd').onclick = addHddRow;
  addHddRow(); // start with one HDD

  // ---------- 5. Pattern Lock (3x3, ตำแหน่งตัวเลขอ้างอิงตาม numpad) ----------
  // เลย์เอาต์ตาม numpad จริง: แถวบน 7-8-9, แถวกลาง 4-5-6, แถวล่าง 1-2-3
  const svg = document.getElementById('patternSvg');
  const patternValueEl = document.getElementById('patternValue');
  const NS = 'http://www.w3.org/2000/svg';
  const NUMPAD_GRID = [[7,8,9],[4,5,6],[1,2,3]];
  const nodes = []; // {x,y,index}
  const spacing = 80, offset = 40;
  for(let r=0; r<3; r++){
    for(let c=0; c<3; c++){
      nodes.push({ index: NUMPAD_GRID[r][c], x: offset + c*spacing, y: offset + r*spacing });
    }
  }

  let selected = [];
  let dragging = false;
  let lineGroup, dotGroup;

  function drawBase(){
    svg.innerHTML = '';
    lineGroup = document.createElementNS(NS, 'g');
    dotGroup = document.createElementNS(NS, 'g');
    svg.appendChild(lineGroup);
    svg.appendChild(dotGroup);
    nodes.forEach(n => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', n.x);
      c.setAttribute('cy', n.y);
      c.setAttribute('r', 14);
      c.setAttribute('fill', '#fff');
      c.setAttribute('stroke', '#0e6e6e');
      c.setAttribute('stroke-width', 2);
      c.dataset.index = n.index;
      dotGroup.appendChild(c);

      const label = document.createElementNS(NS, 'text');
      label.setAttribute('x', n.x);
      label.setAttribute('y', n.y);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('font-size', '13');
      label.setAttribute('font-family', "'IBM Plex Mono', monospace");
      label.setAttribute('font-weight', '600');
      label.setAttribute('fill', '#0e6e6e');
      label.setAttribute('pointer-events', 'none');
      label.dataset.index = n.index;
      label.textContent = n.index;
      dotGroup.appendChild(label);
    });
  }

  function redraw(){
    lineGroup.innerHTML = '';
    dotGroup.querySelectorAll('circle').forEach(c => {
      const idx = parseInt(c.dataset.index);
      c.setAttribute('fill', selected.includes(idx) ? '#0e6e6e' : '#fff');
    });
    dotGroup.querySelectorAll('text').forEach(t => {
      const idx = parseInt(t.dataset.index);
      t.setAttribute('fill', selected.includes(idx) ? '#ffffff' : '#0e6e6e');
    });
    for(let i=0; i<selected.length-1; i++){
      const a = nodes.find(n => n.index === selected[i]);
      const b = nodes.find(n => n.index === selected[i+1]);
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('stroke', '#0e6e6e');
      line.setAttribute('stroke-width', 3);
      line.setAttribute('stroke-linecap', 'round');
      lineGroup.appendChild(line);
    }
    patternValueEl.textContent = selected.length ? selected.join('-') : 'ยังไม่ได้วาด';
  }

  function nodeAtPoint(clientX, clientY){
    const rect = svg.getBoundingClientRect();
    const scaleX = 240 / rect.width, scaleY = 240 / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return nodes.find(n => Math.hypot(n.x - x, n.y - y) < 18);
  }

  function startDrag(clientX, clientY){
    selected = [];
    dragging = true;
    const n = nodeAtPoint(clientX, clientY);
    if(n) selected.push(n.index);
    redraw();
  }
  function moveDrag(clientX, clientY){
    if(!dragging) return;
    const n = nodeAtPoint(clientX, clientY);
    if(n && !selected.includes(n.index)){
      selected.push(n.index);
      redraw();
    }
  }
  function endDrag(){ dragging = false; }

  drawBase();
  svg.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
  window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);
  svg.addEventListener('touchstart', e => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); e.preventDefault(); }, {passive:false});
  svg.addEventListener('touchmove', e => { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); e.preventDefault(); }, {passive:false});
  svg.addEventListener('touchend', endDrag);

  document.getElementById('clearPattern').onclick = () => {
    selected = [];
    redraw();
  };

  // ---------- 6. Submit ----------
  const form = document.getElementById('surveyForm');
  const statusMsg = document.getElementById('statusMsg');
  const submitBtn = document.getElementById('submitBtn');

  function resetForm(){
    form.reset();
    dateInput.value = formatDate(new Date());
    resetDepartmentPlaceholder();
    cameraList.innerHTML = ''; addCameraRow();
    hddList.innerHTML = ''; hddCounter = 0; addHddRow();
    selected = []; redraw();
    fillSelect(buildingSelect, Object.keys(CONFIG.BUILDING_DEPARTMENTS), '-- เลือกอาคาร --');
    fillSelect(document.getElementById('bitrateControl'), CONFIG.BITRATE_CONTROL, '-- เลือก --');
    fillSelect(document.getElementById('videoEncoding'), CONFIG.VIDEO_ENCODING, '-- เลือก --');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const building = buildingSelect.value;
    const department = departmentSelect.value;
    const surveyDate = dateInput.value;

    if(!building || !department || !surveyDate){
      statusMsg.textContent = 'กรุณากรอก อาคาร / หน่วยงาน / วันที่สำรวจ ให้ครบ';
      statusMsg.className = 'status-msg err';
      return;
    }

    // กล้องหลายรุ่น / HDD หลายลูก -> ต่อกันด้วยการขึ้นบรรทัดใหม่ (\n) ในเซลล์เดียวกัน
    // เรียงลำดับตรงกันทุกคอลัมน์ (แถวที่ 1 ของทุกคอลัมน์ = ชุดเดียวกัน)
    const camBrands = [...cameraList.querySelectorAll('.cam-brand')].map(i => i.value.trim());
    const camModels = [...cameraList.querySelectorAll('.cam-model')].map(i => i.value.trim());

    const hddCards = [...hddList.querySelectorAll('.hdd-card')];
    const collect = (cls) => hddCards.map(card => card.querySelector('.' + cls).value.trim()).join('\n');

    const payload = {
      building,
      department,
      surveyDate,
      nvrBrand: document.getElementById('nvrBrand').value.trim(),
      nvrModel: document.getElementById('nvrModel').value.trim(),
      cameraBrand: camBrands.join('\n'),
      cameraModel: camModels.join('\n'),
      cameraCount: document.getElementById('cameraCount').value.trim(),
      resolution: document.getElementById('resolution').value.trim(),
      frameRate: document.getElementById('frameRate').value.trim(),
      bitrateControl: document.getElementById('bitrateControl').value,
      bitrate: document.getElementById('bitrate').value.trim(),
      videoEncoding: document.getElementById('videoEncoding').value,
      hddTotal: document.getElementById('hddTotal').value.trim(),
      playback: document.getElementById('playback').value.trim(),
      hddSata: collect('hdd-sata'),
      hddModel: collect('hdd-model'),
      hddSerial: collect('hdd-serial'),
      hddHealth: collect('hdd-health'),
      hddHours: collect('hdd-hours'),
      hddTemp: collect('hdd-temp'),
      hddRealloc: collect('hdd-realloc'),
      hddPending: collect('hdd-pending'),
      upsBrand: document.getElementById('upsBrand').value.trim(),
      upsModel: document.getElementById('upsModel').value.trim(),
      idAdmin: document.getElementById('idAdmin').value.trim(),
      pwAdmin: document.getElementById('pwAdmin').value.trim(),
      idUser: document.getElementById('idUser').value.trim(),
      pwUser: document.getElementById('pwUser').value.trim(),
      patternLock: selected.join('-'), // ลำดับตัวเลขอ้างอิงตาม numpad เช่น "7-4-1-2-3"
    };

    submitBtn.disabled = true;
    statusMsg.textContent = 'กำลังบันทึก...';
    statusMsg.className = 'status-msg';

    // Fire-and-forget POST (no-cors) — matches established Apps Script pattern
    fetch(CONFIG.SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    }).then(() => {
      statusMsg.textContent = 'บันทึกข้อมูลเรียบร้อยแล้ว';
      statusMsg.className = 'status-msg ok';
      submitBtn.disabled = false;
      resetForm();
    }).catch(() => {
      statusMsg.textContent = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      statusMsg.className = 'status-msg err';
      submitBtn.disabled = false;
    });
  });

});

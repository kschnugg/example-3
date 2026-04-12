/* ═══════════════════════════════════════════════════
   BOARDFLOW — Team Member View
   Reads and writes the same localStorage keys as the
   main dashboard (index.html / app.js), keeping all
   task data in one central shared store.
════════════════════════════════════════════════════ */

// ─── SHARED STORAGE KEYS (must match app.js) ──────
const STORAGE_KEY      = 'boardflow_tasks';
const STORAGE_TEAM_KEY = 'boardflow_team';
const STORAGE_SYNC_KEY = 'boardflow_sync';
const STORAGE_MEMBER   = 'boardflow_current_member';

// ─── FALLBACK TEAM (used when localStorage is empty) ──
const DEFAULT_TEAM = [
  { id: 'AL', name: 'Alex Laurent',  role: 'Team Leader',          initials: 'AL' },
  { id: 'SM', name: 'Sara Mitchell', role: 'Senior PCB Designer',  initials: 'SM' },
  { id: 'JD', name: 'James Dupont',  role: 'Schematic Engineer',   initials: 'JD' },
  { id: 'MP', name: 'Mia Park',      role: 'Signal Integrity Eng', initials: 'MP' },
  { id: 'RK', name: 'Ryan Kim',      role: 'BOM & Procurement',    initials: 'RK' },
  { id: 'TW', name: 'Tara Wilson',   role: 'Layout Engineer',      initials: 'TW' },
];

const COLORS = {
  AL: '#6366f1', SM: '#22c55e', JD: '#f97316',
  MP: '#ec4899', RK: '#0ea5e9', TW: '#a855f7',
};

const PRIORITY = {
  critical: { label: 'Critical', color: '#ef4444', icon: '▲▲' },
  high:     { label: 'High',     color: '#f97316', icon: '▲'  },
  medium:   { label: 'Medium',   color: '#eab308', icon: '●'  },
  low:      { label: 'Low',      color: '#94a3b8', icon: '▼'  },
};

const STATUS_CYCLE = ['todo', 'in-progress', 'review', 'done'];
const STATUS_LABEL = {
  'todo': 'To Do', 'in-progress': 'In Progress',
  'review': 'In Review', 'done': 'Done',
};

// ─── STATE ────────────────────────────────────────
let tasks         = [];
let team          = [...DEFAULT_TEAM];
let currentMember = null;
let statusFilter  = 'all';

// ─── DATE HELPERS ─────────────────────────────────
const today    = new Date();
const fmt      = d => d.toISOString().slice(0, 10);
const todayStr = fmt(today);

function isOverdue(d) { return d && new Date(d) < today && fmt(new Date(d)) !== todayStr; }
function isToday(d)   { return d && fmt(new Date(d)) === todayStr; }
function relDate(d) {
  if (!d) return '';
  const diff = Math.round((new Date(d) - today) / 86400000);
  if (diff < -1) return `${Math.abs(diff)}d overdue`;
  if (diff === -1) return 'Yesterday';
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff < 7)   return `In ${diff}d`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── SHARED STORAGE ───────────────────────────────
// Desktop (Electron): reads/writes %APPDATA%/BoardFlow/tasks.json
// Browser:            reads/writes localStorage
function loadFromStorage() {
  try {
    if (window.electronAPI) {
      const data = window.electronAPI.loadData();
      if (data) {
        if (data.tasks) tasks = data.tasks;
        if (data.team)  team  = data.team;
        return !!data.tasks;
      }
      return false;
    }
    const t = localStorage.getItem(STORAGE_KEY);
    const m = localStorage.getItem(STORAGE_TEAM_KEY);
    if (t) tasks = JSON.parse(t);
    if (m) team  = JSON.parse(m);
    return !!t;
  } catch(e) { return false; }
}

function saveToStorage() {
  try {
    if (window.electronAPI) {
      window.electronAPI.saveData({ tasks, team, sync: new Date().toISOString() });
    } else {
      localStorage.setItem(STORAGE_KEY,      JSON.stringify(tasks));
      localStorage.setItem(STORAGE_SYNC_KEY, new Date().toISOString());
    }
  } catch(e) {}
  updateSyncBar();
}

function updateSyncBar() {
  const dot = document.getElementById('msyncDot');
  const msg = document.getElementById('msyncStatus');
  if (!dot || !msg) return;
  if (window.electronAPI) {
    dot.className = 'msync-dot ok';
    msg.textContent = `Data file: ${window.electronAPI.getDataPath()}`;
    return;
  }
  const t = localStorage.getItem(STORAGE_SYNC_KEY);
  if (!t) {
    dot.className = 'msync-dot err';
    msg.textContent = 'Not synced — no shared data found';
    return;
  }
  const diff = Math.round((Date.now() - new Date(t)) / 60000);
  dot.className = 'msync-dot ok';
  msg.textContent = diff < 1
    ? 'Synced just now'
    : diff < 60 ? `Synced ${diff}m ago`
    : `Synced at ${new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// ─── TOAST ────────────────────────────────────────
let _toastTimer;
function showToast(msg, type = 'success') {
  const el   = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  document.getElementById('toastMsg').textContent = msg;
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.className = `toast ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

// ─── RFC-4180 CSV PARSER ──────────────────────────
function parseCSV(text) {
  const rows = [];
  const src  = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let pos = 0;
  while (pos < src.length) {
    const row = [];
    while (pos < src.length && src[pos] !== '\n') {
      let field = '';
      if (src[pos] === '"') {
        pos++;
        while (pos < src.length) {
          if (src[pos] === '"') {
            if (src[pos + 1] === '"') { field += '"'; pos += 2; }
            else                      { pos++; break; }
          } else { field += src[pos++]; }
        }
      } else {
        while (pos < src.length && src[pos] !== ',' && src[pos] !== '\n') {
          field += src[pos++];
        }
      }
      row.push(field);
      if (pos < src.length && src[pos] === ',') pos++;
    }
    if (pos < src.length && src[pos] === '\n') pos++;
    if (!(row.length === 1 && row[0] === '')) rows.push(row);
  }
  return rows;
}

// ─── CSV COLUMN MAPPING ───────────────────────────
const HEADER_MAP = {
  'title':'title','task':'title','task title':'title','name':'title',
  'assignee':'assignee','assigned to':'assignee','owner':'assignee',
  'member':'assignee','assignee id':'assignee',
  'priority':'priority',
  'status':'status',
  'project':'project',
  'due':'due','due date':'due','deadline':'due','date':'due',
  'description':'desc','desc':'desc','details':'desc','notes':'desc',
  'tags':'tags','labels':'tags','tag':'tags',
};

function normHeader(h) { return HEADER_MAP[(h||'').toString().trim().toLowerCase()] || null; }

function normPriority(v) {
  const s = (v||'').toString().trim().toLowerCase();
  if (s.includes('critical')||s==='p0') return 'critical';
  if (s.includes('high')||s==='p1')     return 'high';
  if (s.includes('medium')||s==='p2'||s==='med') return 'medium';
  if (s.includes('low')||s==='p3')      return 'low';
  return 'medium';
}

function normStatus(v) {
  const s = (v||'').toString().trim().toLowerCase().replace(/\s+/g,'-');
  if (['todo','to-do','not-started','open'].includes(s)) return 'todo';
  if (['in-progress','in-work','wip','active'].includes(s)) return 'in-progress';
  if (['review','in-review','pending-review'].includes(s)) return 'review';
  if (['done','complete','completed','closed'].includes(s)) return 'done';
  return 'todo';
}

function normAssignee(v) {
  const s = (v||'').toString().trim();
  const byId   = team.find(m => m.id.toLowerCase() === s.toLowerCase());
  if (byId) return byId.id;
  const byName = team.find(m =>
    m.name.toLowerCase().includes(s.toLowerCase()) ||
    s.toLowerCase().includes(m.name.split(' ')[0].toLowerCase())
  );
  return byName ? byName.id : (team[0]?.id || 'AL');
}

function normDate(v) {
  if (!v) return '';
  const s = v.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [a, b, y] = s.split('/');
    return `${y}-${a.padStart(2,'0')}-${b.padStart(2,'0')}`;
  }
  const p = new Date(s);
  return isNaN(p) ? '' : fmt(p);
}

function csvRowsToTasks(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map(normHeader);
  const result  = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const raw = {};
    headers.forEach((f, idx) => { if (f) raw[f] = row[idx]; });
    if (!raw.title) continue;
    result.push({
      id:       Date.now() + i,
      title:    raw.title.toString().trim(),
      assignee: normAssignee(raw.assignee),
      priority: normPriority(raw.priority),
      status:   normStatus(raw.status),
      project:  (raw.project || 'General').toString().trim(),
      due:      normDate(raw.due),
      desc:     (raw.desc || '').toString().trim(),
      tags:     raw.tags ? raw.tags.toString().split(',').map(t=>t.trim()).filter(Boolean) : [],
    });
  }
  return result;
}

// ─── CSV IMPORT HANDLER (shared between login + dashboard) ────────────
function handleCsvFile(file, onDone) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const imported = csvRowsToTasks(parseCSV(ev.target.result));
      if (!imported.length) { showToast('No valid tasks found in file', 'error'); return; }
      tasks = imported;
      saveToStorage();
      showToast(`Loaded ${imported.length} tasks from "${file.name}"`);
      if (onDone) onDone();
    } catch(e) { showToast('Could not read the CSV file', 'error'); }
  };
  reader.readAsText(file);
}

// ─── LOGIN SCREEN ─────────────────────────────────
function renderLoginScreen() {
  const hasData = loadFromStorage();
  document.getElementById('noDataBanner').style.display = hasData ? 'none' : 'block';

  const search = (document.getElementById('memberSearch')?.value || '').toLowerCase();
  const picker = document.getElementById('memberPicker');

  picker.innerHTML = team.map(m => `
    <div class="member-pick-card" data-id="${m.id}" style="${
      search && !m.name.toLowerCase().includes(search) ? 'display:none' : ''
    }">
      <div class="avatar xlg" style="background:${COLORS[m.id] || '#6366f1'}">${m.initials}</div>
      <div class="pick-name">${m.name}</div>
      <div class="pick-role">${m.role}</div>
    </div>
  `).join('');

  picker.querySelectorAll('.member-pick-card').forEach(card => {
    card.addEventListener('click', () => selectMember(card.dataset.id));
  });
}

// ─── MEMBER SELECTION ─────────────────────────────
function selectMember(id) {
  currentMember = team.find(m => m.id === id);
  if (!currentMember) return;
  localStorage.setItem(STORAGE_MEMBER, id);
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('memberDashboard').classList.remove('hidden');
  renderDashboard();
}

// ─── DASHBOARD RENDER ─────────────────────────────
function renderDashboard() {
  // Header
  document.getElementById('headerAvatar').innerHTML =
    `<div class="avatar" style="background:${COLORS[currentMember.id]}">${currentMember.initials}</div>`;
  document.getElementById('headerName').textContent = currentMember.name;
  document.getElementById('headerRole').textContent = currentMember.role;
  document.getElementById('memberDateText').textContent = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  updateSyncBar();
  renderStats();
  renderTodaySection();
  renderAllTasks();
}

function myTasks() {
  return tasks.filter(t => t.assignee === currentMember.id);
}

// ─── STATS ────────────────────────────────────────
function renderStats() {
  const mt = myTasks();
  const overdue = mt.filter(t => isOverdue(t.due) && t.status !== 'done').length;
  const stats = [
    { label: 'Total Tasks',  value: mt.length, color: '#6366f1' },
    { label: 'Due Today',    value: mt.filter(t => isToday(t.due) && t.status !== 'done').length, color: '#f97316' },
    { label: 'In Progress',  value: mt.filter(t => t.status === 'in-progress').length, color: '#0ea5e9' },
    { label: 'Completed',    value: mt.filter(t => t.status === 'done').length, color: '#22c55e' },
    { label: 'Overdue',      value: overdue,  color: overdue ? '#ef4444' : '#5a5f72' },
  ];
  document.getElementById('memberStatsRow').innerHTML = stats.map(s => `
    <div class="mstat-card">
      <div class="mstat-val" style="color:${s.color}">${s.value}</div>
      <div class="mstat-lbl">${s.label}</div>
    </div>`).join('');
}

// ─── TODAY SECTION ────────────────────────────────
function renderTodaySection() {
  const due = myTasks()
    .filter(t => (isToday(t.due) || isOverdue(t.due)) && t.status !== 'done')
    .sort(byPriority);
  document.getElementById('todayCountBadge').textContent = due.length;
  document.getElementById('todayList').innerHTML =
    due.map(renderTaskRow).join('') ||
    '<div class="empty-state">No tasks due today — great work!</div>';
}

// ─── ALL TASKS SECTION ────────────────────────────
function renderAllTasks() {
  let mt = myTasks();
  if (statusFilter !== 'all') mt = mt.filter(t => t.status === statusFilter);
  mt.sort(byPriority);
  document.getElementById('allCountBadge').textContent = mt.length;
  document.getElementById('allTasksList').innerHTML =
    mt.map(renderTaskRow).join('') ||
    '<div class="empty-state">No tasks found for this filter.</div>';
}

function byPriority(a, b) {
  return ['critical','high','medium','low'].indexOf(a.priority) -
         ['critical','high','medium','low'].indexOf(b.priority);
}

// ─── TASK ROW ─────────────────────────────────────
function renderTaskRow(task) {
  const done     = task.status === 'done';
  const overdue  = isOverdue(task.due) && !done;
  const todayDue = isToday(task.due) && !done;
  const dueLabel = relDate(task.due);
  const priColor = PRIORITY[task.priority]?.color || '#94a3b8';
  const nextStatus = STATUS_LABEL[STATUS_CYCLE[(STATUS_CYCLE.indexOf(task.status) + 1) % STATUS_CYCLE.length]];

  return `
  <div class="mtask-row ${done ? 'done' : ''} ${overdue ? 'overdue' : ''}" data-id="${task.id}">
    <button class="mtask-status-btn status-${task.status}"
            onclick="cycleStatus(${task.id})"
            title="Click to advance status → ${nextStatus}">
      ${statusIcon(task.status)}
    </button>
    <span class="priority-dot-sm" style="background:${priColor}"></span>
    <div class="mtask-body">
      <div class="mtask-title">${task.title}</div>
      ${task.desc ? `<div class="mtask-desc">${task.desc}</div>` : ''}
    </div>
    <div class="mtask-meta">
      <span class="task-project-tag">${task.project}</span>
      ${dueLabel ? `<span class="task-due ${overdue ? 'overdue' : todayDue ? 'today' : ''}">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>${dueLabel}</span>` : ''}
      <span class="priority-badge ${task.priority}">
        ${PRIORITY[task.priority]?.icon} ${PRIORITY[task.priority]?.label}
      </span>
      <span class="status-badge ${task.status}">${STATUS_LABEL[task.status]}</span>
    </div>
  </div>`;
}

function statusIcon(s) {
  const w = 'width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"';
  if (s === 'done')        return `<svg ${w}><polyline points="20 6 9 17 4 12"/></svg>`;
  if (s === 'in-progress') return `<svg ${w}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  if (s === 'review')      return `<svg ${w}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  return `<svg ${w}><circle cx="12" cy="12" r="10"/></svg>`;
}

// ─── CYCLE TASK STATUS ────────────────────────────
function cycleStatus(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const prev = task.status;
  task.status = STATUS_CYCLE[(STATUS_CYCLE.indexOf(task.status) + 1) % STATUS_CYCLE.length];
  saveToStorage();
  renderDashboard();
  const title = task.title.length > 35 ? task.title.slice(0, 35) + '…' : task.title;
  showToast(`"${title}" → ${STATUS_LABEL[task.status]}`);
}

// ─── STATUS TABS ──────────────────────────────────
document.getElementById('statusTabs').addEventListener('click', e => {
  const btn = e.target.closest('.stab');
  if (!btn) return;
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  statusFilter = btn.dataset.s;
  renderAllTasks();
});

// ─── SEARCH (login screen) ────────────────────────
document.getElementById('memberSearch').addEventListener('input', () => {
  renderLoginScreen();
});

// ─── LOGOUT ───────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', () => {
  currentMember = null;
  statusFilter  = 'all';
  localStorage.removeItem(STORAGE_MEMBER);
  document.getElementById('memberDashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  renderLoginScreen();
});

// ─── REFRESH ──────────────────────────────────────
document.getElementById('refreshBtn').addEventListener('click', () => {
  loadFromStorage();
  renderDashboard();
  showToast('Tasks refreshed from shared storage');
});

// ─── CSV IMPORT (dashboard bar) ───────────────────
document.getElementById('memberCsvInput').addEventListener('change', e => {
  handleCsvFile(e.target.files[0], () => renderDashboard());
  e.target.value = '';
});

// ─── CSV IMPORT (login screen) ────────────────────
document.getElementById('loginCsvInput').addEventListener('change', e => {
  handleCsvFile(e.target.files[0], () => renderLoginScreen());
  e.target.value = '';
});

// ─── SYNC CHIP REFRESH (every minute) ─────────────
setInterval(updateSyncBar, 60000);

// ─── INIT ─────────────────────────────────────────
// Auto-login if a member was previously selected
(function init() {
  loadFromStorage();
  const lastId = localStorage.getItem(STORAGE_MEMBER);
  if (lastId) {
    const found = team.find(m => m.id === lastId);
    if (found) { selectMember(lastId); return; }
  }
  renderLoginScreen();
})();

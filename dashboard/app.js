/* ═══════════════════════════════════════════════════
   BOARDFLOW — App Logic & Data
════════════════════════════════════════════════════ */

// ─── DATE HELPERS ─────────────────────────────────
const today = new Date();
const fmt = (d) => d.toISOString().slice(0, 10);
const todayStr = fmt(today);

function relDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Math.round((d - today) / 86400000);
  if (diff < -1) return `${Math.abs(diff)}d overdue`;
  if (diff === -1) return 'Yesterday';
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff < 7)   return `In ${diff}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateStr) {
  return dateStr && new Date(dateStr) < today && fmt(new Date(dateStr)) !== todayStr;
}
function isToday(dateStr) {
  return dateStr && fmt(new Date(dateStr)) === todayStr;
}
function offsetDay(n) {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return fmt(d);
}

// ─── AVATAR COLORS ────────────────────────────────
const COLORS = {
  AL: '#6366f1', SM: '#22c55e', JD: '#f97316',
  MP: '#ec4899', RK: '#0ea5e9', TW: '#a855f7'
};

// ─── TEAM DATA ─────────────────────────────────────
const TEAM = [
  { id: 'AL', name: 'Alex Laurent',  role: 'Team Leader',          initials: 'AL' },
  { id: 'SM', name: 'Sara Mitchell', role: 'Senior PCB Designer',  initials: 'SM' },
  { id: 'JD', name: 'James Dupont',  role: 'Schematic Engineer',   initials: 'JD' },
  { id: 'MP', name: 'Mia Park',      role: 'Signal Integrity Eng', initials: 'MP' },
  { id: 'RK', name: 'Ryan Kim',      role: 'BOM & Procurement',    initials: 'RK' },
  { id: 'TW', name: 'Tara Wilson',   role: 'Layout Engineer',      initials: 'TW' },
];

// ─── TASKS DATA ────────────────────────────────────
let tasks = [
  // ── ALEX (Leader) ──────────────────────────────
  {
    id: 1, assignee: 'AL', title: 'Review PCB Layout v4 final submission',
    status: 'in-progress', priority: 'critical',
    project: 'PCB Layout v4', due: offsetDay(0),
    desc: 'Final sign-off review before handoff to manufacturing.',
    tags: ['review', 'sign-off'],
  },
  {
    id: 2, assignee: 'AL', title: 'Approve BOM for new supplier quotes',
    status: 'todo', priority: 'critical',
    project: 'BOM Validation', due: offsetDay(0),
    desc: 'Compare new supplier quotes and approve updated BOM.',
    tags: ['approval', 'procurement'],
  },
  {
    id: 3, assignee: 'AL', title: 'Sprint planning meeting — Q2 board projects',
    status: 'done', priority: 'high',
    project: 'PCB Layout v4', due: offsetDay(-1),
    desc: 'Quarterly sprint planning for all active board design projects.',
    tags: ['meeting', 'planning'],
  },
  {
    id: 4, assignee: 'AL', title: 'Resolve EMI issue flagged by Mia on power plane',
    status: 'in-progress', priority: 'high',
    project: 'Signal Integrity', due: offsetDay(1),
    desc: 'Coordinate with Mia to address EMI findings on the power plane layer.',
    tags: ['EMI', 'signal-integrity'],
  },
  {
    id: 5, assignee: 'AL', title: 'Update design guidelines document v3',
    status: 'todo', priority: 'medium',
    project: 'Schematic Review', due: offsetDay(3),
    desc: 'Incorporate feedback from last retrospective into team design guidelines.',
    tags: ['docs'],
  },
  {
    id: 6, assignee: 'AL', title: 'Kickoff call with new contractor',
    status: 'todo', priority: 'medium',
    project: 'PCB Layout v4', due: offsetDay(2),
    desc: 'Onboarding call for new layout contractor joining the project.',
    tags: ['meeting'],
  },
  {
    id: 7, assignee: 'AL', title: 'Review signal integrity report from Mia',
    status: 'review', priority: 'high',
    project: 'Signal Integrity', due: offsetDay(0),
    desc: 'Full SI simulation report review before client presentation.',
    tags: ['review'],
  },
  {
    id: 8, assignee: 'AL', title: 'Archive old component libraries',
    status: 'todo', priority: 'low',
    project: 'Schematic Review', due: offsetDay(7),
    desc: 'Remove deprecated component libraries from shared drives.',
    tags: ['maintenance'],
  },

  // ── SARA ───────────────────────────────────────
  {
    id: 9, assignee: 'SM', title: 'Finalize copper pour on power layers 3 & 4',
    status: 'in-progress', priority: 'critical',
    project: 'PCB Layout v4', due: offsetDay(0),
    desc: 'Complete copper pour optimization on layers 3 and 4.',
    tags: ['layout', 'power'],
  },
  {
    id: 10, assignee: 'SM', title: 'DRC clean-up — 47 remaining errors',
    status: 'in-progress', priority: 'high',
    project: 'PCB Layout v4', due: offsetDay(1),
    desc: 'Address all DRC violations before submission.',
    tags: ['DRC', 'clean-up'],
  },
  {
    id: 11, assignee: 'SM', title: 'Place decoupling capacitors near ICs',
    status: 'done', priority: 'high',
    project: 'PCB Layout v4', due: offsetDay(-1),
    desc: 'Place all decoupling caps per schematic netlist.',
    tags: ['placement'],
  },
  {
    id: 12, assignee: 'SM', title: 'Export Gerber files for fab review',
    status: 'todo', priority: 'medium',
    project: 'PCB Layout v4', due: offsetDay(2),
    desc: 'Generate and verify Gerber output files for fabrication.',
    tags: ['export', 'gerber'],
  },
  {
    id: 13, assignee: 'SM', title: 'Update board outline per mechanical drawing',
    status: 'todo', priority: 'medium',
    project: 'PCB Layout v4', due: offsetDay(3),
    desc: 'Adjust PCB outline to match latest mechanical CAD file.',
    tags: ['mechanical'],
  },

  // ── JAMES ──────────────────────────────────────
  {
    id: 14, assignee: 'JD', title: 'Schematic annotation & cross-reference update',
    status: 'in-progress', priority: 'high',
    project: 'Schematic Review', due: offsetDay(0),
    desc: 'Re-annotate all schematics and update cross-references.',
    tags: ['schematic', 'annotation'],
  },
  {
    id: 15, assignee: 'JD', title: 'Add missing power symbols on sheet 7',
    status: 'todo', priority: 'critical',
    project: 'Schematic Review', due: offsetDay(0),
    desc: 'Sheet 7 is missing VCC and GND symbols flagged in last review.',
    tags: ['schematic', 'error'],
  },
  {
    id: 16, assignee: 'JD', title: 'Review connector pinout for USB-C block',
    status: 'review', priority: 'high',
    project: 'Schematic Review', due: offsetDay(1),
    desc: 'Verify USB-C connector pinout against datasheet.',
    tags: ['connector', 'USB-C'],
  },
  {
    id: 17, assignee: 'JD', title: 'ERC report — resolve 12 warnings',
    status: 'todo', priority: 'medium',
    project: 'Schematic Review', due: offsetDay(2),
    desc: 'Address ERC warnings from last tool run.',
    tags: ['ERC'],
  },
  {
    id: 18, assignee: 'JD', title: 'Document power sequencing requirements',
    status: 'done', priority: 'medium',
    project: 'Schematic Review', due: offsetDay(-2),
    desc: 'Write power sequencing document for hardware team.',
    tags: ['docs'],
  },

  // ── MIA ────────────────────────────────────────
  {
    id: 19, assignee: 'MP', title: 'Run IBIS simulation on DDR5 data bus',
    status: 'in-progress', priority: 'critical',
    project: 'Signal Integrity', due: offsetDay(0),
    desc: 'Full IBIS simulation for DDR5 channel compliance.',
    tags: ['simulation', 'DDR5'],
  },
  {
    id: 20, assignee: 'MP', title: 'Eye diagram analysis — high-speed pairs',
    status: 'todo', priority: 'high',
    project: 'Signal Integrity', due: offsetDay(1),
    desc: 'Analyze eye diagrams for all differential pairs > 1 Gbps.',
    tags: ['eye-diagram', 'SI'],
  },
  {
    id: 21, assignee: 'MP', title: 'EMI pre-compliance check on power plane',
    status: 'review', priority: 'critical',
    project: 'Signal Integrity', due: offsetDay(0),
    desc: 'Flag potential EMI issues for team leader review.',
    tags: ['EMI', 'compliance'],
  },
  {
    id: 22, assignee: 'MP', title: 'Prepare SI summary report for client',
    status: 'todo', priority: 'medium',
    project: 'Signal Integrity', due: offsetDay(3),
    desc: 'Compile simulation results into client-facing report.',
    tags: ['report'],
  },

  // ── RYAN ───────────────────────────────────────
  {
    id: 23, assignee: 'RK', title: 'Validate BOM against approved vendor list',
    status: 'in-progress', priority: 'high',
    project: 'BOM Validation', due: offsetDay(0),
    desc: 'Check all components against AVL and flag non-compliant parts.',
    tags: ['BOM', 'AVL'],
  },
  {
    id: 24, assignee: 'RK', title: 'Source alternative for EOL capacitor C47',
    status: 'todo', priority: 'critical',
    project: 'BOM Validation', due: offsetDay(0),
    desc: 'C47 is end-of-life; find approved alternative ASAP.',
    tags: ['EOL', 'BOM'],
  },
  {
    id: 25, assignee: 'RK', title: 'Update component prices in cost tracker',
    status: 'done', priority: 'medium',
    project: 'BOM Validation', due: offsetDay(-1),
    desc: 'Update Q2 component pricing from distributor portal.',
    tags: ['cost', 'BOM'],
  },
  {
    id: 26, assignee: 'RK', title: 'Request lead time quotes from 3 suppliers',
    status: 'todo', priority: 'high',
    project: 'BOM Validation', due: offsetDay(2),
    desc: 'Get lead time estimates for long-lead items.',
    tags: ['procurement'],
  },
  {
    id: 27, assignee: 'RK', title: 'Reconcile BOM rev B vs rev C changes',
    status: 'todo', priority: 'medium',
    project: 'BOM Validation', due: offsetDay(4),
    desc: 'Diff the two BOM revisions and document changes.',
    tags: ['BOM'],
  },

  // ── TARA ───────────────────────────────────────
  {
    id: 28, assignee: 'TW', title: 'Trace routing — high-speed clock nets',
    status: 'in-progress', priority: 'critical',
    project: 'PCB Layout v4', due: offsetDay(0),
    desc: 'Route all clock differential pairs with proper length matching.',
    tags: ['routing', 'clocks'],
  },
  {
    id: 29, assignee: 'TW', title: 'Implement length matching on DDR5 byte lanes',
    status: 'todo', priority: 'high',
    project: 'PCB Layout v4', due: offsetDay(1),
    desc: 'Match trace lengths on all DDR5 byte lanes per spec.',
    tags: ['length-matching', 'DDR5'],
  },
  {
    id: 30, assignee: 'TW', title: 'Fix via stitching around RF area',
    status: 'review', priority: 'high',
    project: 'PCB Layout v4', due: offsetDay(0),
    desc: 'Add sufficient ground via stitching around RF antenna area.',
    tags: ['via', 'RF'],
  },
  {
    id: 31, assignee: 'TW', title: 'Board outline layer 3D export for enclosure check',
    status: 'todo', priority: 'medium',
    project: 'PCB Layout v4', due: offsetDay(3),
    desc: 'Export 3D model for mechanical team enclosure validation.',
    tags: ['3D', 'export'],
  },
  {
    id: 32, assignee: 'TW', title: 'Update layer stackup documentation',
    status: 'done', priority: 'medium',
    project: 'PCB Layout v4', due: offsetDay(-2),
    desc: 'Update stackup doc with final impedance target values.',
    tags: ['docs', 'stackup'],
  },
];

// ─── SHARED STORAGE  (central data store shared with member.html) ────
const STORAGE_KEY      = 'boardflow_tasks';
const STORAGE_TEAM_KEY = 'boardflow_team';
const STORAGE_SYNC_KEY = 'boardflow_sync';

function saveToShared() {
  try {
    if (window.electronAPI) {
      // Desktop: write to %APPDATA%/BoardFlow/tasks.json (fire-and-forget)
      window.electronAPI.saveData({ tasks, team: TEAM, sync: new Date().toISOString() });
    } else {
      // Browser: use localStorage
      localStorage.setItem(STORAGE_KEY,      JSON.stringify(tasks));
      localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(TEAM));
      localStorage.setItem(STORAGE_SYNC_KEY, new Date().toISOString());
    }
  } catch(e) { /* storage unavailable */ }
  updateSyncChip();
}

function loadFromShared() {
  try {
    if (window.electronAPI) {
      const data = window.electronAPI.loadData();
      if (data?.tasks) { tasks = data.tasks; return true; }
      return false;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { tasks = JSON.parse(stored); return true; }
  } catch(e) {}
  return false;
}

function updateSyncChip() {
  const el = document.getElementById('syncChip');
  if (!el) return;
  if (window.electronAPI) {
    const p = window.electronAPI.getDataPath();
    el.textContent = p;
    el.title = p;
    return;
  }
  const t = localStorage.getItem(STORAGE_SYNC_KEY);
  if (!t) { el.textContent = 'not synced'; return; }
  const diff = Math.round((Date.now() - new Date(t)) / 60000);
  el.textContent = diff < 1 ? 'synced just now' : `synced ${diff}m ago`;
}

// ─── STATE ────────────────────────────────────────
let currentView = 'overview';
let kanbanFilter = 'all';
let searchQuery = '';
let statusFilter = 'all';
let priorityFilter = 'all';

// ─── PRIORITY CONFIG ──────────────────────────────
const PRIORITY = {
  critical: { label: 'Critical', color: '#ef4444', icon: '▲▲' },
  high:     { label: 'High',     color: '#f97316', icon: '▲'  },
  medium:   { label: 'Medium',   color: '#eab308', icon: '●'  },
  low:      { label: 'Low',      color: '#94a3b8', icon: '▼'  },
};
const STATUS_LABEL = {
  'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'In Review', 'done': 'Done',
};

// ─── HELPERS ─────────────────────────────────────
function memberById(id) { return TEAM.find(m => m.id === id); }

function avatar(id, size = '') {
  const m = memberById(id);
  return `<div class="avatar${size ? ' ' + size : ''}" style="background:${COLORS[id]}">${m?.initials || id}</div>`;
}

function priorityBadge(p) {
  return `<span class="priority-badge ${p}">${PRIORITY[p]?.icon || ''} ${PRIORITY[p]?.label || p}</span>`;
}

function statusBadge(s) {
  return `<span class="status-badge ${s}">${STATUS_LABEL[s] || s}</span>`;
}

function dueBadge(due) {
  if (!due) return '';
  const cls = isOverdue(due) ? 'overdue' : isToday(due) ? 'today' : '';
  const label = relDate(due);
  return `<span class="task-due ${cls}">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>${label}</span>`;
}

function priorityDot(p) {
  return `<span class="priority-dot" style="background:${PRIORITY[p]?.color}"></span>`;
}

function filteredTasks() {
  return tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.project.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

// ─── RENDER: TASK ROW (compact) ───────────────────
function renderTaskRow(task) {
  const done = task.status === 'done';
  return `
  <div class="task-row ${done ? 'done' : ''}" data-id="${task.id}">
    <div class="task-check ${done ? 'checked' : ''}" onclick="toggleDone(event,${task.id})"></div>
    <span class="task-title-text">${task.title}</span>
    <div class="task-meta">
      <span class="task-project-tag">${task.project}</span>
      ${dueBadge(task.due)}
      ${priorityBadge(task.priority)}
      ${statusBadge(task.status)}
      ${avatar(task.assignee)}
    </div>
  </div>`;
}

// ─── RENDER: TASK CARD (full) ─────────────────────
function renderTaskCard(task) {
  const done = task.status === 'done';
  const tagsHtml = task.tags.map(t => `<span class="tag">${t}</span>`).join('');
  return `
  <div class="task-card ${done ? 'done' : ''}" data-id="${task.id}">
    <div class="task-card-top">
      <span class="task-card-title">${task.title}</span>
      <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
        ${priorityBadge(task.priority)}
        ${statusBadge(task.status)}
      </div>
    </div>
    ${task.desc ? `<p class="task-card-desc">${task.desc}</p>` : ''}
    <div class="task-card-bottom">
      ${avatar(task.assignee)}
      <span style="font-size:12px;color:var(--text-2);flex:1">${memberById(task.assignee)?.name || task.assignee}</span>
      <span class="task-project-tag">${task.project}</span>
      ${dueBadge(task.due)}
    </div>
    ${tagsHtml ? `<div style="display:flex;gap:5px;flex-wrap:wrap">${tagsHtml}</div>` : ''}
  </div>`;
}

// ─── RENDER: TODAY TASK ROW ───────────────────────
function renderTodayCard(task) {
  const done = task.status === 'done';
  return `
  <div class="task-row ${done ? 'done' : ''}" data-id="${task.id}">
    <div class="task-check ${done ? 'checked' : ''}" onclick="toggleDone(event,${task.id})"></div>
    <div style="flex:1">
      <div class="task-title-text">${task.title}</div>
      <div style="font-size:11px;color:var(--text-3);margin-top:2px">${task.project} • ${memberById(task.assignee)?.name}</div>
    </div>
    <div class="task-meta">
      ${statusBadge(task.status)}
      ${avatar(task.assignee)}
    </div>
  </div>`;
}

// ─── TOGGLE DONE ──────────────────────────────────
function toggleDone(e, id) {
  e.stopPropagation();
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.status = task.status === 'done' ? 'todo' : 'done';
  renderAll();
}

// ─── VIEW: OVERVIEW ───────────────────────────────
function renderOverview() {
  const ft = filteredTasks();

  // Today's tasks (strip — max 5)
  const todayTs = ft.filter(t => isToday(t.due) || (isOverdue(t.due) && t.status !== 'done'));
  const todayHtml = todayTs.slice(0, 5).map(renderTaskRow).join('') ||
    '<div class="empty-state">No tasks due today.</div>';
  document.getElementById('todayTasksOverview').innerHTML = todayHtml;

  // Team workload
  renderTeamWorkload('teamWorkloadGrid', ft, 3);

  // Leader tasks
  const leaderTs = ft.filter(t => t.assignee === 'AL').slice(0, 5);
  document.getElementById('leaderTasksOverview').innerHTML =
    leaderTs.map(renderTaskRow).join('') || '<div class="empty-state">No tasks found.</div>';
}

// ─── VIEW: TODAY ─────────────────────────────────
function renderToday() {
  const ft = filteredTasks();
  const due = ft.filter(t => isToday(t.due) || isOverdue(t.due));
  const critical = due.filter(t => t.priority === 'critical');
  const high     = due.filter(t => t.priority === 'high');
  const medium   = due.filter(t => t.priority === 'medium' || t.priority === 'low');

  document.getElementById('criticalCount').textContent = critical.length;
  document.getElementById('highCount').textContent     = high.length;
  document.getElementById('mediumCount').textContent   = medium.length;

  document.getElementById('criticalTasks').innerHTML =
    critical.map(renderTodayCard).join('') || '<div class="empty-state">None</div>';
  document.getElementById('highTasks').innerHTML =
    high.map(renderTodayCard).join('') || '<div class="empty-state">None</div>';
  document.getElementById('mediumTasks').innerHTML =
    medium.map(renderTodayCard).join('') || '<div class="empty-state">None</div>';

  // Progress ring
  const total = due.length || 1;
  const done  = due.filter(t => t.status === 'done').length;
  const pct   = Math.round((done / total) * 100);
  const circ  = 2 * Math.PI * 32;
  document.getElementById('ringFill').style.strokeDasharray  = circ;
  document.getElementById('ringFill').style.strokeDashoffset = circ - (circ * pct / 100);
  document.getElementById('ringPct').textContent = pct + '%';

  // Greeting
  const h = today.getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('todayGreeting').textContent = `${greeting}, Alex`;
}

// ─── VIEW: KANBAN ─────────────────────────────────
function renderKanban() {
  const COLUMNS = [
    { key: 'todo',        label: 'To Do',       dotColor: '#5a5f72' },
    { key: 'in-progress', label: 'In Progress',  dotColor: '#6366f1' },
    { key: 'review',      label: 'In Review',    dotColor: '#a855f7' },
    { key: 'done',        label: 'Done',         dotColor: '#22c55e' },
  ];

  let ft = filteredTasks();
  if (kanbanFilter !== 'all') ft = ft.filter(t => t.assignee === kanbanFilter);

  const board = document.getElementById('kanbanBoard');
  board.innerHTML = COLUMNS.map(col => {
    const colTasks = ft.filter(t => t.status === col.key);
    const cards = colTasks.map(t => {
      const overdueClass = isOverdue(t.due) ? 'overdue' : isToday(t.due) ? 'today-due' : '';
      const dueLabel = t.due ? relDate(t.due) : '';
      return `
      <div class="kb-card" data-id="${t.id}" onclick="">
        <div class="kb-card-top">
          <span class="kb-card-title">${t.title}</span>
          ${priorityDot(t.priority)}
        </div>
        <div class="kb-card-meta">
          <span class="kb-card-project">${t.project}</span>
          ${priorityBadge(t.priority)}
        </div>
        <div class="kb-card-footer">
          ${avatar(t.assignee)}
          <span style="font-size:11px;color:var(--text-2);flex:1;margin-left:6px">${memberById(t.assignee)?.name}</span>
          ${t.due ? `<span class="kb-card-due ${overdueClass}">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>${dueLabel}</span>` : ''}
        </div>
      </div>`;
    }).join('') || '<div class="empty-state" style="font-size:12px;padding:20px">No tasks</div>';

    return `
    <div class="kb-col">
      <div class="kb-col-header">
        <span class="kb-col-title">
          <span class="kb-col-dot" style="background:${col.dotColor}"></span>
          ${col.label}
        </span>
        <span class="kb-col-count">${colTasks.length}</span>
      </div>
      ${cards}
    </div>`;
  }).join('');
}

// ─── VIEW: TEAM WORKLOAD ──────────────────────────
function renderTeamWorkload(containerId, ft, maxTasks = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = TEAM.filter(m => m.id !== 'AL').map(member => {
    const memberTasks = ft.filter(t => t.assignee === member.id);
    const inProg = memberTasks.filter(t => t.status === 'in-progress' || t.status === 'review').length;
    const total  = memberTasks.length;
    const pct    = total === 0 ? 0 : Math.round((inProg / total) * 100);
    const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : '#6366f1';

    const topTasks = memberTasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        const po = ['critical','high','medium','low'];
        return po.indexOf(a.priority) - po.indexOf(b.priority);
      })
      .slice(0, maxTasks);

    const miniTasks = topTasks.map(t => {
      const c = PRIORITY[t.priority]?.color || '#94a3b8';
      return `<div class="mini-task">
        <span class="mini-task-dot" style="background:${c}"></span>
        <span style="flex:1">${t.title}</span>
        ${statusBadge(t.status)}
      </div>`;
    }).join('') || '<div style="font-size:11px;color:var(--text-3);padding:4px 0">No active tasks</div>';

    return `
    <div class="team-card" onclick="switchView('team')">
      <div class="team-card-header">
        ${avatar(member.id)}
        <div class="team-info">
          <div class="team-name">${member.name}</div>
          <div class="team-role">${member.role}</div>
        </div>
        <span class="team-task-count">${total} tasks</span>
      </div>
      <div class="workload-bar-wrap">
        <div class="workload-bar-label">
          <span>Workload</span><span>${inProg}/${total} active</span>
        </div>
        <div class="workload-bar">
          <div class="workload-bar-fill" style="width:${pct}%;background:${barColor}"></div>
        </div>
      </div>
      <div class="mini-tasks">${miniTasks}</div>
    </div>`;
  }).join('');
}

// ─── VIEW: TEAM MEMBERS ───────────────────────────
function renderTeamView() {
  const ft = filteredTasks();
  const grid = document.getElementById('teamMembersGrid');

  grid.innerHTML = TEAM.map(member => {
    const memberTasks = ft.filter(t => t.assignee === member.id);
    const active   = memberTasks.filter(t => t.status !== 'done');
    const done     = memberTasks.filter(t => t.status === 'done');
    const overdue  = memberTasks.filter(t => isOverdue(t.due) && t.status !== 'done');
    const today_t  = memberTasks.filter(t => isToday(t.due) && t.status !== 'done');
    const isLeader = member.id === 'AL';

    const taskItems = active
      .sort((a, b) => ['critical','high','medium','low'].indexOf(a.priority) - ['critical','high','medium','low'].indexOf(b.priority))
      .map(t => {
        const overCls = isOverdue(t.due) ? 'overdue' : '';
        const dueStr  = t.due ? relDate(t.due) : '';
        return `
        <div class="member-task-item">
          ${priorityDot(t.priority)}
          <span class="member-task-title">${t.title}</span>
          ${statusBadge(t.status)}
          ${dueStr ? `<span class="member-task-due ${overCls}">${dueStr}</span>` : ''}
        </div>`;
      }).join('') || '<div class="empty-state" style="font-size:12px;padding:12px">All tasks complete!</div>';

    return `
    <div class="member-card">
      <div class="member-card-header">
        ${avatar(member.id, 'lg')}
        <div class="member-header-info">
          <div class="member-name">${member.name} ${isLeader ? '<span class="priority-badge medium" style="font-size:10px;padding:1px 6px">Leader</span>' : ''}</div>
          <div class="member-role">${member.role}</div>
        </div>
      </div>
      <div class="member-card-stats">
        <span class="mstat"><strong>${active.length}</strong> active</span>
        <span class="mstat"><strong>${done.length}</strong> done</span>
        <span class="mstat"><strong>${today_t.length}</strong> due today</span>
        ${overdue.length ? `<span class="mstat danger"><strong>${overdue.length}</strong> overdue</span>` : ''}
      </div>
      <div class="member-tasks">${taskItems}</div>
    </div>`;
  }).join('');
}

// ─── VIEW: MY TASKS (LEADER) ─────────────────────
function renderMyTasks() {
  const ft = filteredTasks().filter(t => t.assignee === 'AL');
  document.getElementById('leaderTasksFull').innerHTML =
    ft.map(renderTaskCard).join('') || '<div class="empty-state">No tasks found.</div>';
}

// ─── RENDER ALL ───────────────────────────────────
function renderAll() {
  renderOverview();
  renderToday();
  renderKanban();
  renderTeamView();
  renderMyTasks();
  saveToShared();   // keep central store in sync after every change
}

// ─── SWITCH VIEW ──────────────────────────────────
function switchView(name) {
  currentView = name;
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById(`view-${name}`);
  if (el) el.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`.nav-item[data-view="${name}"]`);
  if (nav) nav.classList.add('active');

  const titles = {
    overview: 'Overview', today: "Today's Tasks", kanban: 'Board',
    team: 'Team', 'my-tasks': 'My Tasks',
  };
  document.getElementById('pageTitle').textContent = titles[name] || 'Dashboard';
}

// ─── DATE DISPLAY ─────────────────────────────────
document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

// ─── SIDEBAR TOGGLE ────────────────────────────────
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.body.classList.toggle('sidebar-collapsed');
});

// ─── NAV LINKS ─────────────────────────────────────
document.querySelectorAll('.nav-item[data-view]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchView(link.dataset.view);
  });
});

// ─── KANBAN FILTERS ────────────────────────────────
document.querySelectorAll('.kb-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.kb-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    kanbanFilter = btn.dataset.filter;
    renderKanban();
  });
});

// ─── SEARCH & FILTERS ─────────────────────────────
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = e.target.value.trim();
    renderAll();
  }, 200);
});
document.getElementById('filterStatus').addEventListener('change', (e) => {
  statusFilter = e.target.value;
  renderAll();
});
document.getElementById('filterPriority').addEventListener('change', (e) => {
  priorityFilter = e.target.value;
  renderAll();
});

// ─── ADD TASK MODAL ────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');
const taskForm     = document.getElementById('taskForm');

document.getElementById('addTaskBtn').addEventListener('click', () => {
  document.getElementById('taskDue').value = todayStr;
  modalOverlay.classList.remove('hidden');
});
document.getElementById('modalClose').addEventListener('click', () => modalOverlay.classList.add('hidden'));
document.getElementById('cancelBtn').addEventListener('click', () => modalOverlay.classList.add('hidden'));
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newTask = {
    id:       Date.now(),
    title:    document.getElementById('taskTitle').value.trim(),
    assignee: document.getElementById('taskAssignee').value,
    priority: document.getElementById('taskPriority').value,
    status:   document.getElementById('taskStatus').value,
    due:      document.getElementById('taskDue').value,
    project:  document.getElementById('taskProject').value,
    desc:     document.getElementById('taskDesc').value.trim(),
    tags:     [],
  };
  tasks.unshift(newTask);
  modalOverlay.classList.add('hidden');
  taskForm.reset();
  renderAll();
});

// ═══════════════════════════════════════════════════
// CSV IMPORT  +  SPREADSHEETML EXPORT  (no dependencies)
// ═══════════════════════════════════════════════════

// ─── TOAST HELPER ─────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toastIcon');
  document.getElementById('toastMsg').textContent = msg;
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ─── COLUMN NAME NORMALISATION ─────────────────────
// Maps flexible Excel headers → our internal field names
const HEADER_MAP = {
  'title': 'title', 'task': 'title', 'task title': 'title', 'name': 'title',
  'assignee': 'assignee', 'assigned to': 'assignee', 'assignee id': 'assignee',
  'member': 'assignee', 'owner': 'assignee',
  'priority': 'priority',
  'status': 'status',
  'project': 'project',
  'due': 'due', 'due date': 'due', 'deadline': 'due', 'date': 'due',
  'description': 'desc', 'desc': 'desc', 'details': 'desc', 'notes': 'desc',
  'tags': 'tags', 'labels': 'tags', 'tag': 'tags',
};

function normaliseHeader(h) {
  return HEADER_MAP[(h || '').toString().trim().toLowerCase()] || null;
}

// ─── VALUE NORMALISATION ──────────────────────────
function normalisePriority(v) {
  const s = (v || '').toString().trim().toLowerCase();
  if (s.includes('critical') || s === 'p0') return 'critical';
  if (s.includes('high')     || s === 'p1') return 'high';
  if (s.includes('medium')   || s === 'p2' || s === 'med') return 'medium';
  if (s.includes('low')      || s === 'p3') return 'low';
  return 'medium'; // default
}

function normaliseStatus(v) {
  const s = (v || '').toString().trim().toLowerCase().replace(/\s+/g, '-');
  if (s === 'todo' || s === 'to-do' || s === 'not-started' || s === 'open') return 'todo';
  if (s === 'in-progress' || s === 'in-work' || s === 'wip' || s === 'active') return 'in-progress';
  if (s === 'review' || s === 'in-review' || s === 'pending-review') return 'review';
  if (s === 'done' || s === 'complete' || s === 'completed' || s === 'closed') return 'done';
  return 'todo'; // default
}

function normaliseAssignee(v) {
  const s = (v || '').toString().trim();
  // First try exact ID match (AL, SM, JD, …)
  const byId = TEAM.find(m => m.id.toLowerCase() === s.toLowerCase());
  if (byId) return byId.id;
  // Then try name match (partial, case-insensitive)
  const byName = TEAM.find(m => m.name.toLowerCase().includes(s.toLowerCase()) ||
                                 s.toLowerCase().includes(m.name.split(' ')[0].toLowerCase()));
  if (byName) return byName.id;
  return 'AL'; // default to leader
}

function normaliseDate(v) {
  if (!v) return '';
  const s = v.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;           // Already ISO
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {             // MM/DD/YYYY or D/M/YYYY
    const [a, b, y] = s.split('/');
    return `${y}-${a.padStart(2,'0')}-${b.padStart(2,'0')}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed)) return fmt(parsed);
  return '';
}

// ─── PARSE ROWS → TASKS ───────────────────────────
function rowsToTasks(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map(h => normaliseHeader(h));
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const raw = {};
    headers.forEach((field, idx) => {
      if (field) raw[field] = row[idx];
    });
    if (!raw.title) continue; // skip rows with no title
    result.push({
      id:       Date.now() + i,
      title:    raw.title.toString().trim(),
      assignee: normaliseAssignee(raw.assignee),
      priority: normalisePriority(raw.priority),
      status:   normaliseStatus(raw.status),
      project:  (raw.project || 'PCB Layout v4').toString().trim(),
      due:      normaliseDate(raw.due),
      desc:     (raw.desc || '').toString().trim(),
      tags:     raw.tags
                  ? raw.tags.toString().split(',').map(t => t.trim()).filter(Boolean)
                  : [],
    });
  }
  return result;
}

// ─── IMPORT STATE ─────────────────────────────────
let pendingImportRows = null;
let pendingFileName   = '';

// ─── RFC-4180 CSV PARSER ──────────────────────────
// Returns an array of rows; each row is an array of string values.
function parseCSV(text) {
  const rows = [];
  const src  = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let pos = 0;

  while (pos < src.length) {
    const row = [];
    // Parse fields until end-of-line or end-of-input
    while (pos < src.length && src[pos] !== '\n') {
      let field = '';
      if (src[pos] === '"') {
        pos++; // skip opening quote
        while (pos < src.length) {
          if (src[pos] === '"') {
            if (src[pos + 1] === '"') { field += '"'; pos += 2; } // escaped quote
            else                      { pos++; break; }           // closing quote
          } else {
            field += src[pos++];
          }
        }
      } else {
        while (pos < src.length && src[pos] !== ',' && src[pos] !== '\n') {
          field += src[pos++];
        }
      }
      row.push(field);
      if (pos < src.length && src[pos] === ',') pos++; // skip comma
    }
    if (pos < src.length && src[pos] === '\n') pos++; // skip newline
    // Skip completely empty rows
    if (!(row.length === 1 && row[0] === '')) rows.push(row);
  }
  return rows;
}

// ─── IMPORT: FILE SELECTED ────────────────────────
document.getElementById('xlsxInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = ''; // reset so same file can be re-selected

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const rows   = parseCSV(ev.target.result);
      const parsed = rowsToTasks(rows);

      if (parsed.length === 0) {
        showToast('No valid tasks found — check column headers.', 'error');
        return;
      }

      pendingImportRows = parsed;
      pendingFileName   = file.name;

      document.getElementById('importFileInfo').innerHTML = `
        <svg class="file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <div>
          <div class="import-file-name">${file.name}</div>
          <div class="import-file-meta">${parsed.length} task${parsed.length !== 1 ? 's' : ''} found across ${rows.length - 1} data row${rows.length - 1 !== 1 ? 's' : ''}</div>
        </div>`;

      document.getElementById('importOverlay').classList.remove('hidden');
    } catch (err) {
      showToast('Could not read the file. Make sure it is a valid .csv.', 'error');
      console.error(err);
    }
  };
  reader.readAsText(file); // plain text — no ArrayBuffer needed
});

// ─── IMPORT: CONFIRM ──────────────────────────────
document.getElementById('importConfirmBtn').addEventListener('click', () => {
  if (!pendingImportRows) return;
  const mode = document.querySelector('input[name="importMode"]:checked').value;

  if (mode === 'replace') {
    tasks = pendingImportRows;
  } else {
    // Append — avoid duplicate IDs
    const existing = new Set(tasks.map(t => t.title.toLowerCase()));
    const newOnes  = pendingImportRows.filter(t => !existing.has(t.title.toLowerCase()));
    tasks = [...tasks, ...newOnes];
    if (newOnes.length < pendingImportRows.length) {
      const skipped = pendingImportRows.length - newOnes.length;
      showToast(`Imported ${newOnes.length} tasks (${skipped} duplicate title${skipped !== 1 ? 's' : ''} skipped).`, 'success');
      document.getElementById('importOverlay').classList.add('hidden');
      pendingImportRows = null;
      renderAll();
      return;
    }
  }

  document.getElementById('importOverlay').classList.add('hidden');
  pendingImportRows = null;
  renderAll();

  const count = mode === 'replace' ? tasks.length : pendingImportRows?.length ?? 0;
  showToast(`${mode === 'replace' ? 'Replaced all tasks with' : 'Imported'} ${tasks.length} task${tasks.length !== 1 ? 's' : ''} from "${pendingFileName}".`);
});

// ─── IMPORT: CANCEL / CLOSE ───────────────────────
function closeImportModal() {
  document.getElementById('importOverlay').classList.add('hidden');
  pendingImportRows = null;
}
document.getElementById('importModalClose').addEventListener('click', closeImportModal);
document.getElementById('importCancelBtn').addEventListener('click', closeImportModal);
document.getElementById('importOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('importOverlay')) closeImportModal();
});

// ─── IMPORT BUTTON ────────────────────────────────
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('xlsxInput').click();
});

// ─── EXPORT (SpreadsheetML + CSV — no dependencies) ─
document.getElementById('exportBtn').addEventListener('click', exportToSpreadsheet);

// Build an XML-escaped string safe for SpreadsheetML cell content
function xmlEsc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Convert a 2-D array to a SpreadsheetML <Worksheet> string
function sheetToXML(name, rows) {
  const rowsXml = rows.map(row => {
    const cells = row.map(val => {
      const isNum = typeof val === 'number';
      return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${xmlEsc(val)}</Data></Cell>`;
    }).join('');
    return `<Row>${cells}</Row>`;
  }).join('');
  return `<Worksheet ss:Name="${xmlEsc(name)}"><Table>${rowsXml}</Table></Worksheet>`;
}

// Build a multi-sheet SpreadsheetML workbook and trigger download as .xls
// (SpreadsheetML is XML-based; Excel/LibreOffice open it natively — no ZIP needed)
function exportToSpreadsheet() {
  const dateStamp = todayStr.replace(/-/g, '');

  // ── Sheet 1: All Tasks ──────────────────────────
  const allHeaders = ['ID','Title','Assignee ID','Assignee Name','Priority','Status',
                      'Project','Due Date','Description','Tags'];
  const allRows = tasks.map(t => [
    t.id,
    t.title,
    t.assignee,
    memberById(t.assignee)?.name || t.assignee,
    PRIORITY[t.priority]?.label || t.priority,
    STATUS_LABEL[t.status]      || t.status,
    t.project,
    t.due  || '',
    t.desc || '',
    (t.tags || []).join(', '),
  ]);

  // ── Sheet 2: Today's Tasks ──────────────────────
  const todayTasks = tasks.filter(t => isToday(t.due) || (isOverdue(t.due) && t.status !== 'done'));
  const todayRows  = todayTasks.map(t => [
    t.title,
    memberById(t.assignee)?.name || t.assignee,
    PRIORITY[t.priority]?.label || t.priority,
    STATUS_LABEL[t.status]      || t.status,
    t.project,
    t.due  || '',
    t.desc || '',
  ]);

  // ── Sheet 3: Team Summary ───────────────────────
  const summaryRows = TEAM.map(m => {
    const mt = tasks.filter(t => t.assignee === m.id);
    return [
      m.name, m.role, mt.length,
      mt.filter(t => t.status !== 'done').length,
      mt.filter(t => t.status === 'done').length,
      mt.filter(t => isOverdue(t.due) && t.status !== 'done').length,
    ];
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    sheetToXML('All Tasks',     [allHeaders, ...allRows]),
    sheetToXML("Today's Tasks", [['Title','Assignee','Priority','Status','Project','Due Date','Description'], ...todayRows]),
    sheetToXML('Team Summary',  [['Member','Role','Total Tasks','Active','Done','Overdue'], ...summaryRows]),
    '</Workbook>',
  ].join('\n');

  triggerDownload(xml, `board-tasks-${dateStamp}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  showToast(`Exported ${tasks.length} tasks to board-tasks-${dateStamp}.xls`);
}

// ─── DOWNLOAD HELPER ──────────────────────────────
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── INIT ──────────────────────────────────────────
// Load from shared storage if available; otherwise seed it with defaults
loadFromShared();
renderAll();
switchView('overview');
// Refresh sync chip every minute
setInterval(updateSyncChip, 60000);

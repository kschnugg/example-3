/**
 * main-member.js — Electron main process for BoardFlow Member View
 * Opens dashboard/member.html in a native window.
 *
 * Reads and writes the SAME data file as main-dashboard.js so both
 * executables share one central task store.
 *
 * Data file: %APPDATA%\BoardFlow\tasks.json  (Windows)
 *            ~/Library/Application Support/BoardFlow/tasks.json  (macOS)
 *            ~/.config/BoardFlow/tasks.json  (Linux)
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');

// ─── DATA FILE (identical path to main-dashboard.js) ─
const dataDir  = path.join(app.getPath('userData'), 'BoardFlow');
const dataFile = path.join(dataDir, 'tasks.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

// ─── IPC: LOAD ────────────────────────────────────
ipcMain.on('load-data', event => {
  try {
    ensureDataDir();
    event.returnValue = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile, 'utf8'))
      : null;
  } catch(e) {
    console.error('[load-data]', e.message);
    event.returnValue = null;
  }
});

// ─── IPC: SAVE ────────────────────────────────────
ipcMain.on('save-data', (event, data) => {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  } catch(e) {
    console.error('[save-data]', e.message);
  }
});

// ─── IPC: DATA FILE PATH ──────────────────────────
ipcMain.on('get-data-path', event => {
  event.returnValue = dataFile;
});

// ─── WINDOW ───────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width:   960,
    height:  780,
    minWidth:  700,
    minHeight: 560,
    title:   'BoardFlow — My Tasks',
    backgroundColor: '#0d0f14',
    show: false,
    webPreferences: {
      preload:           path.join(__dirname, 'preload.js'),
      contextIsolation:  true,
      nodeIntegration:   false,
    },
  });

  const htmlFile = app.isPackaged
    ? path.join(__dirname, 'dashboard', 'member.html')
    : path.join(__dirname, '..', 'dashboard', 'member.html');

  win.loadFile(htmlFile);
  win.once('ready-to-show', () => win.show());
  win.removeMenu();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/**
 * main-dashboard.js — Electron main process for BoardFlow Dashboard
 * Opens dashboard/index.html in a native window.
 *
 * Data file: %APPDATA%\BoardFlow\tasks.json  (Windows)
 *            ~/Library/Application Support/BoardFlow/tasks.json  (macOS)
 *            ~/.config/BoardFlow/tasks.json  (Linux)
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');

// ─── DATA FILE ────────────────────────────────────
// app.getPath('userData') resolves to the OS-appropriate AppData folder
const dataDir  = path.join(app.getPath('userData'), 'BoardFlow');
const dataFile = path.join(dataDir, 'tasks.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

// ─── IPC: LOAD (synchronous) ──────────────────────
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

// ─── IPC: SAVE (async, fire-and-forget) ───────────
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
    width:   1300,
    height:  840,
    minWidth:  960,
    minHeight: 640,
    title:   'BoardFlow — Dashboard',
    backgroundColor: '#0d0f14',
    show: false,   // show only after content loads (avoids white flash)
    webPreferences: {
      preload:           path.join(__dirname, 'preload.js'),
      contextIsolation:  true,   // required for contextBridge
      nodeIntegration:   false,  // keep renderer sandboxed
    },
  });

  // Dev: load from source tree; packaged: load from bundled resources
  const htmlFile = app.isPackaged
    ? path.join(__dirname, 'dashboard', 'index.html')
    : path.join(__dirname, '..', 'dashboard', 'index.html');

  win.loadFile(htmlFile);
  win.once('ready-to-show', () => win.show());

  // Remove the default menu bar (File / Edit / View…)
  win.removeMenu();
}

app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// macOS: re-open window when clicking dock icon
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

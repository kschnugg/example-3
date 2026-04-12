/**
 * preload.js — Electron context bridge
 *
 * Exposes a safe, minimal API to the renderer (dashboard/app.js and
 * dashboard/member.js) so they can read/write the shared tasks.json file
 * without exposing the full Node.js API.
 *
 * contextIsolation is ON (nodeIntegration is OFF), so this is the only
 * channel between the renderer and the main process.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Load all data from tasks.json.
   * Returns { tasks, team, sync } or null if file doesn't exist yet.
   * Called synchronously — app waits for data before first render.
   */
  loadData: () => ipcRenderer.sendSync('load-data'),

  /**
   * Persist data to tasks.json.
   * Fire-and-forget — renderer does not wait for the write to complete.
   * @param {{ tasks: Array, team: Array, sync: string }} data
   */
  saveData: (data) => ipcRenderer.send('save-data', data),

  /**
   * Returns the absolute path to tasks.json (shown in the sync bar).
   */
  getDataPath: () => ipcRenderer.sendSync('get-data-path'),
});

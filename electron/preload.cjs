// Bridge between the calculator page and the real desktop window.
// Only the small set of calls below is exposed to the page.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dockalcDesktop', {
    platform: process.platform,
    setAlwaysOnTop: (on) => ipcRenderer.send('window:set-always-on-top', Boolean(on)),
    setOpacity: (value) => ipcRenderer.send('window:set-opacity', Number(value)),
    setCompact: (on) => ipcRenderer.send('window:set-compact', Boolean(on)),
    setMinSize: (w, h) => ipcRenderer.send('window:set-min-size', Number(w), Number(h)),
    readBackup: () => ipcRenderer.invoke('backup:read'),
    writeBackup: (json) => ipcRenderer.send('backup:write', String(json)),
});

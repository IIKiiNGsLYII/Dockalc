const { app, BrowserWindow, shell, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Only one copy of Dockalc may run. A second launch (taskbar, Start menu,
// keyboard calculator key) just brings the open window to the front.
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    let mainWindow = null;
    let boundsBeforeCompact = null;

    const NORMAL_MIN = { width: 360, height: 500 };
    const COMPACT_MIN = { width: 340, height: 480 };
    const COMPACT_SIZE = { width: 400, height: 640 };

    const backupPath = () => path.join(app.getPath('userData'), 'dockalc-backup.json');

    function showMainWindow() {
        if (!mainWindow) return;
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }

    function createWindow() {
        mainWindow = new BrowserWindow({
            width: 1000,
            height: 700,
            minWidth: NORMAL_MIN.width,
            minHeight: NORMAL_MIN.height,
            backgroundColor: '#18181b',
            autoHideMenuBar: true,
            icon: path.join(__dirname, '../dist/Dockalc_Icon.png'),
            webPreferences: {
                preload: path.join(__dirname, 'preload.cjs'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
            },
        });

        // Dev mode: load the Vite server. Otherwise load the built files.
        const devUrl = process.env.VITE_DEV_SERVER_URL;
        if (devUrl) {
            mainWindow.loadURL(devUrl);
        } else {
            mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
        }

        // Open external links (e.g. the donate link) in the user's browser
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            if (url.startsWith('https://') || url.startsWith('http://')) {
                shell.openExternal(url);
            }
            return { action: 'deny' };
        });

        // Never let the window navigate away from the calculator (e.g. a dropped link).
        mainWindow.webContents.on('will-navigate', (event, url) => {
            if (url !== mainWindow.webContents.getURL()) event.preventDefault();
        });

        mainWindow.on('closed', () => {
            mainWindow = null;
            boundsBeforeCompact = null;
        });
    }

    // ---- Window controls requested by the page --------------------------

    ipcMain.on('window:set-always-on-top', (event, on) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return;
        // 'floating' keeps it above normal app windows on macOS; Windows ignores the level.
        win.setAlwaysOnTop(Boolean(on), 'floating');
        if (process.platform === 'darwin') {
            win.setVisibleOnAllWorkspaces(Boolean(on), { visibleOnFullScreen: true });
        }
    });

    ipcMain.on('window:set-opacity', (event, value) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return;
        const n = Number(value);
        win.setOpacity(Number.isFinite(n) ? Math.min(Math.max(n, 0.3), 1) : 1);
    });

    ipcMain.on('window:set-compact', (event, on) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return;
        if (on) {
            if (boundsBeforeCompact) return; // already compact
            if (win.isMaximized()) win.unmaximize();
            if (win.isFullScreen()) win.setFullScreen(false);
            boundsBeforeCompact = win.getBounds();
            win.setMinimumSize(COMPACT_MIN.width, COMPACT_MIN.height);
            win.setSize(COMPACT_SIZE.width, COMPACT_SIZE.height, true);
        } else {
            win.setMinimumSize(NORMAL_MIN.width, NORMAL_MIN.height);
            if (boundsBeforeCompact) {
                win.setBounds(boundsBeforeCompact, true);
                boundsBeforeCompact = null;
            }
        }
    });

    // ---- Backup of settings, stats and achievements ---------------------
    // Saved in the app's data folder, which installers and updates leave alone.

    ipcMain.handle('backup:read', async () => {
        try {
            return await fs.promises.readFile(backupPath(), 'utf8');
        } catch {
            return null;
        }
    });

    ipcMain.on('backup:write', async (_event, json) => {
        if (typeof json !== 'string' || json.length > 20 * 1024 * 1024) return;
        try {
            JSON.parse(json);
            const target = backupPath();
            const tmp = `${target}.tmp`;
            await fs.promises.writeFile(tmp, json, 'utf8');
            await fs.promises.rename(tmp, target);
        } catch (err) {
            console.warn('Dockalc backup failed:', err);
        }
    });

    // ---- App lifecycle --------------------------------------------------

    app.on('second-instance', () => {
        if (mainWindow) showMainWindow();
        else if (app.isReady()) createWindow();
    });

    app.whenReady().then(() => {
        createWindow();
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
            else showMainWindow();
        });
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}

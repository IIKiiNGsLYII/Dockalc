const { app, BrowserWindow, shell, ipcMain, screen } = require('electron');
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

    // ---- Remember window size and position between launches -------------
    // { normal: bounds, compact: bounds | null, maximized: bool }
    const statePath = () => path.join(app.getPath('userData'), 'window-state.json');
    let windowState = { normal: null, compact: null, maximized: false };
    let saveTimer = null;

    function isValidBounds(b) {
        if (!b || ![b.x, b.y, b.width, b.height].every(Number.isFinite)) return false;
        // Must overlap a connected screen, so a window from an unplugged monitor isn't lost off-screen.
        return screen.getAllDisplays().some(({ workArea: a }) =>
            b.x + 80 <= a.x + a.width && b.x + b.width - 80 >= a.x && b.y >= a.y - 20 && b.y + 40 <= a.y + a.height
        );
    }

    function loadWindowState() {
        try {
            const parsed = JSON.parse(fs.readFileSync(statePath(), 'utf8'));
            windowState = {
                normal: isValidBounds(parsed.normal) ? parsed.normal : null,
                compact: isValidBounds(parsed.compact) ? parsed.compact : null,
                maximized: parsed.maximized === true,
            };
        } catch {
            // first launch or unreadable file: use defaults
        }
    }

    function captureWindowState() {
        if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMinimized()) return;
        if (boundsBeforeCompact) {
            if (!mainWindow.isMaximized()) windowState.compact = mainWindow.getBounds();
            windowState.normal = boundsBeforeCompact;
        } else {
            windowState.normal = mainWindow.getNormalBounds();
            windowState.maximized = mainWindow.isMaximized();
        }
    }

    function saveWindowStateNow() {
        captureWindowState();
        try {
            fs.writeFileSync(statePath(), JSON.stringify(windowState));
        } catch (err) {
            console.warn('Dockalc window state not saved:', err);
        }
    }

    function scheduleWindowStateSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveTimer = null;
            saveWindowStateNow();
        }, 500);
    }

    function showMainWindow() {
        if (!mainWindow) return;
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }

    function createWindow() {
        loadWindowState();
        const startBounds = windowState.normal || { width: 1000, height: 700 };
        mainWindow = new BrowserWindow({
            ...startBounds,
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

        if (windowState.maximized) mainWindow.maximize();
        for (const evt of ['resize', 'move', 'maximize', 'unmaximize']) {
            mainWindow.on(evt, scheduleWindowStateSave);
        }
        mainWindow.on('close', () => {
            if (saveTimer) clearTimeout(saveTimer);
            saveWindowStateNow();
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

    // The page reports the smallest size its layout fits in; grow the window if it's smaller.
    ipcMain.on('window:set-min-size', (event, w, h) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win || !Number.isFinite(w) || !Number.isFinite(h)) return;
        const minW = Math.min(Math.max(Math.round(w), 300), 2000);
        const minH = Math.min(Math.max(Math.round(h), 400), 1600);
        win.setMinimumSize(minW, minH);
        if (win.isMaximized() || win.isFullScreen()) return;
        const b = win.getBounds();
        if (b.width < minW || b.height < minH) {
            win.setSize(Math.max(b.width, minW), Math.max(b.height, minH), true);
        }
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
            // Reopen compact mode where you last left it, or at the default size.
            if (windowState.compact) win.setBounds(windowState.compact, true);
            else win.setSize(COMPACT_SIZE.width, COMPACT_SIZE.height, true);
        } else {
            win.setMinimumSize(NORMAL_MIN.width, NORMAL_MIN.height);
            if (boundsBeforeCompact) {
                if (!win.isMaximized()) windowState.compact = win.getBounds();
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

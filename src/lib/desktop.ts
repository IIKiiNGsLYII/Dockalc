// Desktop (Electron) bridge plus backup/restore of everything Dockalc saves.
// In a plain browser the bridge is absent and every desktop call is a no-op.

export interface DockalcDesktopBridge {
  platform: string;
  setAlwaysOnTop: (on: boolean) => void;
  setOpacity: (value: number) => void;
  setCompact: (on: boolean) => void;
  readBackup: () => Promise<string | null>;
  writeBackup: (json: string) => void;
}

declare global {
  interface Window {
    dockalcDesktop?: DockalcDesktopBridge;
  }
}

export function getDesktop(): DockalcDesktopBridge | null {
  return typeof window !== 'undefined' && window.dockalcDesktop ? window.dockalcDesktop : null;
}

export const isDesktopApp = (): boolean => getDesktop() !== null;

// ---------------------------------------------------------------------------
// Backup format
// ---------------------------------------------------------------------------

interface DockalcBackup {
  app: 'Dockalc';
  format: 1;
  savedAt: string;
  data: Record<string, string>;
}

// Every key Dockalc writes starts with one of these (both spellings are in use).
const KEY_PREFIXES = ['dockalc', 'dockcalc'];

const isAppKey = (key: string) => KEY_PREFIXES.some((p) => key.startsWith(p));

function collectAppData(): Record<string, string> {
  const data: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !isAppKey(key)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
  } catch {
    // storage unavailable
  }
  return data;
}

function buildBackup(): DockalcBackup {
  return { app: 'Dockalc', format: 1, savedAt: new Date().toISOString(), data: collectAppData() };
}

function parseBackup(json: string): DockalcBackup | null {
  try {
    const parsed = JSON.parse(json) as Partial<DockalcBackup>;
    if (parsed?.app !== 'Dockalc' || !parsed.data || typeof parsed.data !== 'object') return null;
    const data: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (isAppKey(k) && typeof v === 'string') data[k] = v;
    }
    return { app: 'Dockalc', format: 1, savedAt: String(parsed.savedAt ?? ''), data };
  } catch {
    return null;
  }
}

function applyBackup(backup: DockalcBackup, replace: boolean): number {
  if (replace) {
    for (const key of Object.keys(collectAppData())) localStorage.removeItem(key);
  }
  let count = 0;
  for (const [k, v] of Object.entries(backup.data)) {
    localStorage.setItem(k, v);
    count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Automatic desktop backup (survives reinstalls and updates)
// ---------------------------------------------------------------------------

/**
 * Call once before the app renders. If this install has no saved data but the
 * desktop backup file does, the backup is restored so nothing is lost.
 */
export async function restoreDesktopBackupIfEmpty(): Promise<void> {
  const desktop = getDesktop();
  if (!desktop) return;
  try {
    if (Object.keys(collectAppData()).length > 0) return;
    const json = await desktop.readBackup();
    if (!json) return;
    const backup = parseBackup(json);
    if (backup && Object.keys(backup.data).length > 0) applyBackup(backup, false);
  } catch {
    // never block startup on a bad backup
  }
}

let lastWritten = '';

function writeDesktopBackupNow(): void {
  const desktop = getDesktop();
  if (!desktop) return;
  const data = collectAppData();
  if (Object.keys(data).length === 0) return;
  const fingerprint = JSON.stringify(data);
  if (fingerprint === lastWritten) return;
  lastWritten = fingerprint;
  desktop.writeBackup(JSON.stringify(buildBackup()));
}

/** Keeps the desktop backup file in step with local storage. */
export function startDesktopAutoBackup(): void {
  if (!getDesktop()) return;
  writeDesktopBackupNow();
  window.setInterval(writeDesktopBackupNow, 15000);
  window.addEventListener('beforeunload', writeDesktopBackupNow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') writeDesktopBackupNow();
  });
}

// ---------------------------------------------------------------------------
// Manual export / import (Settings)
// ---------------------------------------------------------------------------

export function exportAppData(): void {
  const json = JSON.stringify(buildBackup(), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dockalc-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Replaces all Dockalc data with the file's contents. Returns the number of items restored, or null if the file isn't a Dockalc backup. */
export async function importAppData(file: File): Promise<number | null> {
  const backup = parseBackup(await file.text());
  if (!backup) return null;
  const count = applyBackup(backup, true);
  lastWritten = '';
  writeDesktopBackupNow();
  return count;
}

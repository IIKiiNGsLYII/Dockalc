import React, { useState, useRef, useEffect } from 'react';
import {
  History as HistoryIcon,
  Cog,
  ChevronDown,
  Pin,
  RotateCcw,
  Sliders,
  Smartphone,
  Tablet,
  Monitor,
  ChevronUp,
  Maximize2,
  Minimize2,
  FileText,
  Rows,
  Dices,
  Trophy,
  Sparkles,
  BookOpen,
  Keyboard,
} from 'lucide-react';
import { useCalculator } from '@/hooks/useCalculator';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Display } from '@/components/calculator/Display';
import { Keypad } from '@/components/calculator/Keypad';
import { HistoryTape } from '@/components/calculator/HistoryTape';
import { AccountantPaperTape } from '@/components/calculator/AccountantPaperTape';
import { ShortcutsModal } from '@/components/calculator/ShortcutsModal';
import { SettingsModal } from '@/components/calculator/SettingsModal';
import dockalcLogo from '@/assets/Dockalc_Icon.png';
import { CustomButtonModal } from '@/components/calculator/CustomButtonModal';
import { ConvertView } from '@/components/calculator/ConvertView';
import { FinanceView } from '@/components/calculator/FinanceView';
import { ModeDropdown } from '@/components/calculator/ModeDropdown';
import { GadgetsDialog } from '@/components/calculator/GadgetsDialog';
import { MilestoneCelebrationModal } from '@/components/calculator/MilestoneCelebrationModal';
import { VisualFormulaCheatSheetDialog } from '@/components/calculator/VisualFormulaCheatSheetDialog';
import { ACHIEVEMENTS_LIST } from '@/lib/numberMagic';
import type { CalcMode, ProgrammableKeyId } from '@/types/calculator';
import { getCornerRadiusClasses } from '@/lib/cornerRadius';
import { toast } from 'sonner';

export const CalculatorPage: React.FC = () => {
  const calc = useCalculator();

  // Panels & Modals State
  const [historyOpen, setHistoryOpen] = useState(true);
  const [desktopRightTab, setDesktopRightTab] = useState<'history' | 'tape'>('history');
  const [phoneHistoryOpen, setPhoneHistoryOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [gadgetsModalOpen, setGadgetsModalOpen] = useState(false);
  const [gadgetsInitialTab, setGadgetsInitialTab] = useState<'dice' | 'target24' | 'sprint' | 'badges'>('dice');

  const handleOpenMilestones = () => {
    setSettingsModalOpen(false);
    setGadgetsInitialTab('badges');
    setGadgetsModalOpen(true);
  };
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [activeProgrammableKey, setActiveProgrammableKey] = useState<ProgrammableKeyId>('custom');

  // Viewport & Orientation Detection
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isLandscape = viewport.width > viewport.height;
  const devicePref = calc.settings.deviceLayout || 'auto';

  // Responsive device categorization:
  // Mobile devices (<768px) cannot be windowed — windowed mode is restricted exclusively to desktop.
  const isMobileViewport = viewport.width < 768;
  const isWindowed = devicePref === 'desktop' && !isMobileViewport;
  const isPhone = isMobileViewport || devicePref === 'phone';
  // Tablet & Landscape Side-by-Side: All other cases (e.g. tablets >=768px, phones in landscape, or full-screen desktop)
  const isTabletOrLandscape = !isPhone && !isWindowed;

  // Scalable & Resizable Window State (For Desktop Windowed Mode)
  const [windowSize, setWindowSize] = useState<{ width: number; height: number } | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef<{ clientX: number; clientY: number; width: number; height: number }>({
    clientX: 0,
    clientY: 0,
    width: 0,
    height: 0,
  });

  // Tablet Split Ratio & Divider Dragging
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingDividerRef = useRef(false);

  const tabletRatio = calc.settings.tabletRatio || 65; // percentage for calculator (45 to 80)

  const handleDividerDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingDividerRef.current = true;
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const containerW = splitContainerRef.current?.offsetWidth || window.innerWidth;
    const initialRatio = calc.settings.tabletRatio || 65;

    const handleMove = (moveEvt: MouseEvent | TouchEvent) => {
      if (!isDraggingDividerRef.current) return;
      const curX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const deltaX = curX - startX;
      const deltaRatio = (deltaX / containerW) * 100;
      const newRatio = Math.min(Math.max(Math.round(initialRatio + deltaRatio), 45), 80);
      calc.updateSettings({ tabletRatio: newRatio });
    };

    const handleEnd = () => {
      isDraggingDividerRef.current = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  const toggleAlwaysOnTop = () => {
    const nextVal = !calc.settings.alwaysOnTop;
    calc.updateSettings({ alwaysOnTop: nextVal });
    if (nextVal) {
      toast.success('Always on Top Active', {
        description: 'Window stays elevated above other windows.',
      });
    } else {
      toast.info('Always on Top Disabled', {
        description: 'Returned to standard window layering.',
      });
    }
  };

  const isPinned = calc.settings.alwaysOnTop === true;
  const isCompact = calc.settings.compactOverlay === true;
  const isExpandedWithHistory = historyOpen && !isCompact;

  // Collision-free minimum scale boundaries per mode and history state
  const minWidth = isCompact
    ? 330
    : isExpandedWithHistory
    ? calc.mode === 'programmer'
      ? 780
      : calc.mode === 'scientific'
      ? 760
      : calc.mode === 'finance'
      ? 780
      : 740
    : calc.mode === 'programmer'
    ? 410
    : calc.mode === 'scientific'
    ? 390
    : calc.mode === 'finance'
    ? 430
    : 360;

  const minHeight = isCompact
    ? 525
    : isExpandedWithHistory
    ? calc.mode === 'programmer'
      ? 720
      : calc.mode === 'scientific'
      ? 700
      : calc.mode === 'convert' || calc.mode === 'finance'
      ? 680
      : 635
    : calc.mode === 'programmer'
    ? 700
    : calc.mode === 'scientific'
    ? 680
    : calc.mode === 'convert' || calc.mode === 'finance'
    ? 660
    : 615;

  // Custom or mode-specific default dimensions
  const customW = calc.settings.defaultWindowWidth;
  const customH = calc.settings.defaultWindowHeight;

  const resolvedDefaultWidth = customW
    ? Math.max(customW, minWidth)
    : isExpandedWithHistory
    ? calc.mode === 'programmer'
      ? 820
      : calc.mode === 'scientific'
      ? 790
      : calc.mode === 'finance'
      ? 820
      : 760
    : isCompact
    ? 330
    : calc.mode === 'programmer'
    ? 420
    : calc.mode === 'scientific'
    ? 400
    : calc.mode === 'finance'
    ? 440
    : 375;

  const resolvedDefaultHeight = customH
    ? Math.max(customH, minHeight)
    : isExpandedWithHistory
    ? calc.mode === 'programmer'
      ? 730
      : calc.mode === 'scientific'
      ? 710
      : 635
    : isCompact
    ? 520
    : calc.mode === 'programmer'
    ? 710
    : calc.mode === 'scientific'
    ? 690
    : 620;

  // Dynamic Corner Radius Classes
  const cornerClasses = getCornerRadiusClasses(calc.settings.cornerRadius || 'extra');

  // Synchronize CSS custom properties for continuous corner radius and number font weight
  useEffect(() => {
    const px = calc.settings.cornerRadiusPx ?? (
      calc.settings.cornerRadius === 'sharp' ? 0 :
      calc.settings.cornerRadius === 'subtle' ? 8 :
      calc.settings.cornerRadius === 'standard' ? 16 :
      calc.settings.cornerRadius === 'extra' ? 20 : 32
    );
    document.documentElement.style.setProperty('--app-corner-btn', `${px}px`);
    document.documentElement.style.setProperty('--app-corner-card', `${Math.min(32, Math.round(px * 1.25))}px`);
    document.documentElement.style.setProperty('--app-corner-window', `${Math.min(40, Math.round(px * 1.5))}px`);
  }, [calc.settings.cornerRadius, calc.settings.cornerRadiusPx]);

  useEffect(() => {
    const weight = calc.settings.numberFontWeight || calc.settings.keypadFontWeight || 'medium';
    const numericWeight = weight === 'regular' ? '400' : weight === 'bold' ? '700' : '500';
    document.documentElement.style.setProperty('--app-number-font-weight', numericWeight);
  }, [calc.settings.numberFontWeight, calc.settings.keypadFontWeight]);

  const resetWindowSize = () => {
    setWindowSize(null);
    toast.info('Window size reset to custom or balanced scale');
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentW = windowRef.current?.offsetWidth || resolvedDefaultWidth;
    const currentH = windowRef.current?.offsetHeight || resolvedDefaultHeight;

    resizeStartRef.current = { clientX, clientY, width: currentW, height: currentH };
    isResizingRef.current = true;

    const handleMove = (moveEvt: MouseEvent | TouchEvent) => {
      if (!isResizingRef.current) return;
      const curX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const curY = 'touches' in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY;

      const deltaX = curX - resizeStartRef.current.clientX;
      const deltaY = curY - resizeStartRef.current.clientY;

      const maxWidth = Math.max(window.innerWidth - 24, minWidth);
      const maxHeight = Math.max(window.innerHeight - 24, minHeight);

      const targetW = Math.min(Math.max(resizeStartRef.current.width + deltaX, minWidth), maxWidth);
      const targetH = Math.min(Math.max(resizeStartRef.current.height + deltaY, minHeight), maxHeight);

      setWindowSize({ width: Math.round(targetW), height: Math.round(targetH) });
    };

    const handleEnd = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    mode: calc.mode,
    base: calc.base,
    onDigit: calc.inputDigit,
    onDecimal: calc.inputDecimal,
    onOperator: calc.setOperator,
    onEquals: calc.calculateEquals,
    onClear: calc.clear,
    onBackspace: calc.deleteChar,
    onUnary: calc.applyUnaryFunction,
    onConstant: calc.insertConstant,
    onParenthesis: calc.handleParenthesis,
    onSetMode: calc.setMode,
    onToggleHistory: () => {
      if (isPhone) {
        setPhoneHistoryOpen((v) => !v);
      } else {
        setHistoryOpen((v) => !v);
      }
    },
    onToggleMemory: () => calc.updateSettings({ showMemoryBar: !calc.settings.showMemoryBar }),
    onOpenShortcutsModal: () => setShortcutsModalOpen(true),
    onOpenFormulaModal: () => setFormulaModalOpen(true),
    onMemoryStore: () => calc.memoryStore(),
    onMemoryRecall: () => calc.memoryRecall(),
    onMemoryClear: () => calc.memoryClear(),
    onMemoryAdd: () => calc.memoryAdd(),
    onMemorySubtract: () => calc.memorySubtract(),
    onCustomButton: calc.executeCustomButton,
    programmableKeys: calc.settings.programmableKeys,
    onExecuteProgrammableKey: calc.executeProgrammableKey,
    onTogglePin: toggleAlwaysOnTop,
    disabled: shortcutsModalOpen || settingsModalOpen || customModalOpen || gadgetsModalOpen || formulaModalOpen || Boolean(calc.newlyUnlockedMilestone),  });

  const { activeTheme, customThemeStyle } = calc;

  const fontClass =
    calc.settings.fontStyle === 'mono'
      ? 'font-tech-mono'
      : calc.settings.fontStyle === 'sans'
      ? 'font-clean-sans'
      : calc.settings.fontStyle === 'digital'
      ? 'font-digital'
      : 'font-montserrat';

  const weightClass =
    calc.settings.keypadFontWeight === 'regular'
      ? 'keypad-weight-regular'
      : calc.settings.keypadFontWeight === 'bold'
      ? 'keypad-weight-bold'
      : 'keypad-weight-medium';

  // =========================================================================
  // 1. PHONE PORTRAIT FULL-SCREEN LAYOUT WITH BOTTOM HISTORY BUTTON & DRAWER
  // =========================================================================
  if (isPhone) {
    return (
      <div
        data-theme={activeTheme.id}
        style={customThemeStyle}
        className={`fixed inset-0 h-[100dvh] w-full max-w-full overflow-hidden flex flex-col transition-all duration-300 theme-${activeTheme.id} ${
          activeTheme.id === 'custom' ? 'bg-[var(--theme-bg)]' : activeTheme.classes.bg
        } text-foreground select-none ${fontClass} ${weightClass} ${
          calc.settings.upsideDownMode ? 'rotate-180' : ''
        }`}
      >
        {/* PHONE FULL-SCREEN HEADER */}
        <header className="flex items-center justify-between px-3 py-1.5 w-full shrink-0 border-b border-border/40 bg-card/75 backdrop-blur-md z-10 max-w-md mx-auto">
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            {/* Subtle background container for logo in light/dark mode */}
            <div className="flex items-center gap-1.5 px-2.5 h-9 sm:h-10 rounded-xl bg-slate-100/90 dark:bg-muted/50 border border-slate-200/80 dark:border-border/50 shrink-0 shadow-2xs">
              <img
                src={dockalcLogo}
                alt="Dockalc Logo"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg object-contain shadow-xs shrink-0"
              />
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-foreground tracking-tight shrink-0 font-mono">
                Dockalc
              </h1>
            </div>
            <span className="text-muted-foreground/30 font-light text-sm shrink-0">|</span>

            {/* Mode Switcher Custom Dropdown */}
            <ModeDropdown
              mode={calc.mode}
              onSetMode={calc.setMode}
              theme={activeTheme}
              playClick={calc.playClick}
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {/* Fun Gadgets & Milestones Button */}
            <button
              type="button"
              onClick={() => setGadgetsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Fun Gadgets & Milestones (Dice, Coin, Target 24, Milestones)"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Visual Formula Cheat Sheet */}
            <button
              type="button"
              onClick={() => setFormulaModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Visual Formula Cheat Sheet (Alt+F)"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Keyboard Shortcuts Overlay */}
            <button
              type="button"
              onClick={() => setShortcutsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Keyboard Shortcuts & Programmable Hotkeys (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Single Settings Button */}
            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Preferences & Themes"
            >
              <Cog className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* PHONE MAIN BODY: DISPLAY & KEYPAD */}
        <main className="flex-1 min-h-0 flex flex-col p-2 sm:p-2.5 pb-1 gap-1 overflow-hidden max-w-md mx-auto w-full justify-between">
          {calc.mode === 'finance' ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto w-full">
              <FinanceView
                theme={activeTheme}
                settings={calc.settings}
                onLogHistory={(expr, res, note) => calc.recordHistory(expr, res, 'finance', undefined, note)}
                playClick={calc.playClick}
              />
            </div>
          ) : calc.mode === 'convert' ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto w-full">
              <ConvertView
                theme={activeTheme}
                settings={calc.settings}
                onLogHistory={(expr, res) => calc.recordHistory(expr, res, 'convert', undefined, expr)}
                playClick={calc.playClick}
                onUnlockMilestone={calc.unlockAchievement}
              />
            </div>
          ) : (
            <>
              <div className="shrink-0 w-full">
                <Display
                  display={calc.display}
                  expression={calc.expression}
                  runningEquation={calc.runningEquation}
                  mode={calc.mode}
                  angleUnit={calc.angleUnit}
                  onToggleAngleUnit={() => {
                    const units = ['DEG', 'RAD', 'GRAD'] as const;
                    const nextIdx = (units.indexOf(calc.angleUnit) + 1) % units.length;
                    calc.setAngleUnit(units[nextIdx]);
                  }}
                  base={calc.base}
                  onSetBase={calc.setBase}
                  bitWidth={calc.bitWidth}
                  onSetBitWidth={calc.setBitWidth}
                  programmerBigInt={calc.programmerBigInt}
                  onToggleBit={calc.toggleBitAt}
                  hasMemoryValue={calc.hasMemoryValue}
                  onToggleMemory={() => calc.updateSettings({ showMemoryBar: !calc.settings.showMemoryBar })}
                  theme={activeTheme}
                  settings={calc.settings}
                  parenthesisDepth={calc.parenthesisDepth}
                  onBackspace={calc.deleteChar}
                  onClear={calc.clear}
                  rpnStack={calc.rpnStack}
                  onInsertExact={(val) => calc.setDisplay(val)}
                />
              </div>

              <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden max-w-md mx-auto w-full p-1 sm:p-2 md:p-3">
                <Keypad
                  mode={calc.mode}
                  base={calc.base}
                  onDigit={calc.inputDigit}
                  onDecimal={calc.inputDecimal}
                  onOperator={calc.setOperator}
                  onEquals={calc.calculateEquals}
                  onClear={calc.clear}
                  onBackspace={calc.deleteChar}
                  onUnary={calc.applyUnaryFunction}
                  onConstant={calc.insertConstant}
                  onParenthesis={calc.handleParenthesis}
                  is2nd={calc.is2nd}
                  onToggle2nd={calc.toggle2nd}
                  onBitShift={calc.applyBitShift}
                  onMemoryClear={() => calc.memoryClear()}
                  onMemoryRecall={() => calc.memoryRecall()}
                  onMemoryStore={() => calc.memoryStore()}
                  onMemoryAdd={() => calc.memoryAdd()}
                  onMemorySubtract={() => calc.memorySubtract()}
                  onToggleMemory={() => calc.updateSettings({ showMemoryBar: !calc.settings.showMemoryBar })}
                  activeMemorySlot={calc.activeMemorySlot}
                  hasMemoryValue={calc.hasMemoryValue}
                  theme={activeTheme}
                  settings={calc.settings}
                  onCustomButton={calc.executeCustomButton}
                  onOpenCustomModal={() => {
                    setActiveProgrammableKey('custom');
                    setCustomModalOpen(true);
                  }}
                  onProgrammableKey={(keyId) => {
                    calc.executeProgrammableKey(keyId);
                  }}
                  onOpenProgrammableModal={(keyId) => {
                    setActiveProgrammableKey(keyId);
                    setCustomModalOpen(true);
                  }}
                  onRpnEnter={calc.rpnPush}
                  onRpnSwap={calc.rpnSwap}
                  onRpnDrop={calc.rpnDrop}
                  onRpnRoll={calc.rpnRoll}
                  rpnStack={calc.rpnStack}
                />
              </div>
            </>
          )}
        </main>

        {/* PHONES GET HISTORY ON THE BOTTOM WITH A DEDICATED BUTTON */}
        <div className="shrink-0 p-1.5 sm:p-2 pb-2 border-t border-border/40 bg-card/80 backdrop-blur-md z-10">
          <button
            type="button"
            onClick={() => setPhoneHistoryOpen((v) => !v)}
            className={`w-full min-h-[48px] py-3 px-3.5 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-between border transition-all cursor-pointer shadow-sm ${
              phoneHistoryOpen
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/80 hover:bg-muted text-foreground border-border/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-current" />
              <span className="font-bold">Calculation History</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-background/50 border border-current/20">
                {calc.history.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              {calc.history.length > 0 && !phoneHistoryOpen && (
                <span className="truncate max-w-[130px] font-mono opacity-80">
                  {calc.history[0].expression} = {calc.history[0].result}
                </span>
              )}
              <span className="font-semibold">{phoneHistoryOpen ? 'Hide History ▲' : 'Open History ▼'}</span>
            </div>
          </button>
        </div>

        {/* BOTTOM HISTORY DRAWER (SLIDE-UP SHEET FOR PHONE) */}
        {phoneHistoryOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[2px] transition-opacity"
              onClick={() => setPhoneHistoryOpen(false)}
            />
            <div
              className={`fixed inset-x-0 bottom-0 z-50 h-[68dvh] max-h-[85dvh] flex flex-col border-t border-border/60 ${cornerClasses.card} rounded-b-none ${
                activeTheme.id === 'nordic-light'
                  ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1]'
                  : activeTheme.id === 'dockalc-dark'
                  ? 'bg-[#222226] text-[#F4F4F5] border-[#333338]'
                  : activeTheme.id === 'custom'
                  ? 'bg-[var(--theme-card)] text-foreground border-[var(--theme-border)]'
                  : 'bg-[#181A20] text-foreground border-white/10'
              } shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250`}
            >
              {/* Drawer Top Grab Handle */}
              <div
                className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-pointer select-none shrink-0"
                onClick={() => setPhoneHistoryOpen(false)}
              >
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
              </div>

              {/* Phone Drawer Switcher if Paper Tape enabled */}
              {calc.settings.showPaperTape !== false && (
                <div className="px-3 pb-1.5 shrink-0">
                  <div
                    className={`flex items-center gap-1 p-0.5 rounded-lg border select-none ${
                      activeTheme.id === 'nordic-light'
                        ? 'bg-[#F1F5F9] border-[#CBD5E1]'
                        : 'bg-muted/60 border-border/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setDesktopRightTab('history')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        desktopRightTab === 'history'
                          ? activeTheme.id === 'nordic-light'
                            ? 'bg-[#FFFFFF] text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                            : 'bg-card text-foreground shadow-xs font-bold border border-border/60'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <HistoryIcon className="w-3.5 h-3.5" />
                      <span>History ({calc.history.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesktopRightTab('tape')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        desktopRightTab === 'tape'
                          ? activeTheme.id === 'nordic-light'
                            ? 'bg-[#FFFFFF] text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                            : 'bg-card text-foreground shadow-xs font-bold border border-border/60'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>Paper Tape</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Panel Content (History / Paper Tape) with internal scroll */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {desktopRightTab === 'tape' && calc.settings.showPaperTape !== false ? (
                  <AccountantPaperTape
                    history={calc.history}
                    onRecall={(item, useResultOnly) => {
                      calc.recallHistoryItem(item, useResultOnly);
                      setPhoneHistoryOpen(false);
                      toast.success('Recalled from tape', { description: item.result });
                    }}
                    onDelete={calc.deleteHistoryItem}
                    onClear={calc.clearHistory}
                    onUpdateNote={calc.updateHistoryItemNote}
                    onExport={calc.exportHistory}
                    theme={activeTheme}
                    settings={calc.settings}
                    onClose={() => setPhoneHistoryOpen(false)}
                  />
                ) : (
                  <HistoryTape
                    history={calc.history}
                    onRecall={(item, useResultOnly) => {
                      calc.recallHistoryItem(item, useResultOnly);
                      setPhoneHistoryOpen(false);
                      toast.success('Recalled from history', { description: item.result });
                    }}
                    onDelete={calc.deleteHistoryItem}
                    onClear={calc.clearHistory}
                    onUpdateNote={calc.updateHistoryItemNote}
                    onExport={calc.exportHistory}
                    theme={activeTheme}
                    settings={calc.settings}
                    onClose={() => setPhoneHistoryOpen(false)}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* MODALS */}
        <ShortcutsModal
          open={shortcutsModalOpen}
          onOpenChange={setShortcutsModalOpen}
          programmableKeys={calc.settings.programmableKeys}
          onUpdateProgrammableKeys={(keys) => calc.updateSettings({ programmableKeys: keys })}
          theme={activeTheme}
          customThemeStyle={customThemeStyle}
        />
        <VisualFormulaCheatSheetDialog
          open={formulaModalOpen}
          onOpenChange={setFormulaModalOpen}
          onInsertExpression={(expr) => calc.setDisplay(expr)}
          onInsertResult={(res) => calc.setDisplay(res)}
          theme={activeTheme}
          customThemeStyle={customThemeStyle}
        />
        <SettingsModal
          open={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
          mode={calc.mode}
          onSetMode={calc.setMode}
          settings={calc.settings}
          onUpdateSettings={calc.updateSettings}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
          onOpenGadgets={() => {
            setGadgetsInitialTab('dice');
            setGadgetsModalOpen(true);
          }}
          onOpenMilestones={handleOpenMilestones}
          isPhone={true}
          theme={activeTheme}
          customThemeStyle={customThemeStyle}
          onOpenCustomModal={() => {
            setActiveProgrammableKey('custom');
            setCustomModalOpen(true);
          }}
          onOpenProgrammableModal={(keyId) => {
            setActiveProgrammableKey(keyId);
            setCustomModalOpen(true);
          }}
        />
        <GadgetsDialog
          open={gadgetsModalOpen}
          onOpenChange={setGadgetsModalOpen}
          settings={calc.settings}
          onUpdateSettings={calc.updateSettings}
          onUnlockAchievement={calc.unlockAchievement}
          initialTab={gadgetsInitialTab}
          theme={activeTheme}
          customThemeStyle={customThemeStyle}
        />
        <CustomButtonModal
          open={customModalOpen}
          onOpenChange={setCustomModalOpen}
          keyId={activeProgrammableKey}
          config={calc.settings.programmableKeys?.[activeProgrammableKey] || calc.settings.customButton}
          onSave={(newCfg) => calc.updateProgrammableKey(activeProgrammableKey, newCfg)}
        />
        <MilestoneCelebrationModal
          achievement={calc.newlyUnlockedMilestone}
          open={Boolean(calc.newlyUnlockedMilestone)}
          onClose={calc.clearCelebratedMilestone}
          onOpenAllBadges={() => setGadgetsModalOpen(true)}
          totalUnlocked={calc.settings.unlockedAchievements?.length || 0}
          totalAvailable={ACHIEVEMENTS_LIST.length}
          remainingInQueue={calc.remainingInMilestoneQueue}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. TABLETS & LANDSCAPE FULL-SCREEN: SIDE-BY-SIDE WITH SCREEN RATIO CONTROL
  // =========================================================================
  if (isTabletOrLandscape) {
    return (
      <div
        data-theme={activeTheme.id}
        style={customThemeStyle}
        className={`fixed inset-0 h-[100dvh] w-full max-w-full overflow-hidden flex flex-col transition-all duration-300 theme-${activeTheme.id} ${
          activeTheme.id === 'custom' ? 'bg-[var(--theme-bg)]' : activeTheme.classes.bg
        } text-foreground select-none ${fontClass} ${weightClass} ${
          calc.settings.upsideDownMode ? 'rotate-180' : ''
        }`}
      >
        {/* TABLET / LANDSCAPE FULL-SCREEN HEADER */}
        <header className="flex items-center justify-between px-3 sm:px-4 py-1.5 w-full shrink-0 border-b border-border/40 bg-card/75 backdrop-blur-md z-10">
          {/* Left: App Logo, Title, Mode Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
            {/* Subtle background container for logo in light/dark mode */}
            <div className="flex items-center gap-1.5 px-2.5 h-9 sm:h-10 rounded-xl bg-slate-100/90 dark:bg-muted/50 border border-slate-200/80 dark:border-border/50 shrink-0 shadow-2xs">
              <img
                src={dockalcLogo}
                alt="Dockalc Logo"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg object-contain shadow-xs shrink-0"
              />
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-foreground tracking-tight shrink-0 font-mono">
                Dockalc
              </h1>
            </div>
            <span className="text-muted-foreground/30 font-light text-sm shrink-0">|</span>

            {/* Mode Switcher Custom Dropdown */}
            <ModeDropdown
              mode={calc.mode}
              onSetMode={calc.setMode}
              theme={activeTheme}
              playClick={calc.playClick}
            />
          </div>

          {/* Right: History Toggle, Layout Mode, Settings */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {/* History Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (!historyOpen) {
                  setHistoryOpen(true);
                  setDesktopRightTab('history');
                } else if (desktopRightTab === 'history') {
                  setHistoryOpen(false);
                } else {
                  setDesktopRightTab('history');
                }
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                historyOpen && desktopRightTab === 'history'
                  ? 'bg-primary/20 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={historyOpen && desktopRightTab === 'history' ? 'Hide History Panel' : 'Show History Panel (Ctrl+H)'}
            >
              <HistoryIcon className="w-4 h-4" />
            </button>

            {/* Desktop Paper Tape Button (Visible in Full Screen Desktop Mode when enabled) */}
            {viewport.width >= 1024 && calc.settings.showPaperTape !== false && (
              <button
                type="button"
                onClick={() => {
                  if (!historyOpen) {
                    setHistoryOpen(true);
                    setDesktopRightTab('tape');
                  } else if (desktopRightTab === 'tape') {
                    setHistoryOpen(false);
                  } else {
                    setDesktopRightTab('tape');
                  }
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  historyOpen && desktopRightTab === 'tape'
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                title={historyOpen && desktopRightTab === 'tape' ? 'Hide Paper Tape' : 'Accountant Paper Tape with Annotations & Export'}
              >
                <FileText className="w-4 h-4 stroke-[1.75]" />
              </button>
            )}

            {/* Desktop Windowed Toggle (For Desktop screens) */}
            {viewport.width >= 1024 && (
              <button
                type="button"
                onClick={() => calc.updateSettings({ deviceLayout: 'desktop' })}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                title="Switch to Windowed Desktop Mode"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}

            {/* Fun Gadgets & Milestones Button */}
            <button
              type="button"
              onClick={() => setGadgetsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Fun Gadgets & Milestones (Dice, Coin, Target 24, Milestones)"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Visual Formula Cheat Sheet */}
            <button
              type="button"
              onClick={() => setFormulaModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Visual Formula Cheat Sheet (Alt+F)"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Keyboard Shortcuts Overlay */}
            <button
              type="button"
              onClick={() => setShortcutsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Keyboard Shortcuts & Programmable Hotkeys (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Preferences & Themes"
            >
              <Cog className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* TABLET / LANDSCAPE MAIN BODY: SIDE-BY-SIDE SPLIT WITH RATIO SIZING */}
        <div
          ref={splitContainerRef}
          className="flex-1 min-h-0 flex flex-row overflow-hidden relative select-text justify-center"
        >
          {/* LEFT COLUMN: CALCULATOR */}
          <div
            style={{ width: historyOpen ? `${tabletRatio}%` : '100%' }}
            className="h-full flex flex-col p-2 sm:p-3 gap-1.5 sm:gap-2 overflow-hidden transition-[width] duration-75"
          >
            {calc.mode === 'finance' ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-y-auto max-w-xl mx-auto w-full p-1 sm:p-2">
                <FinanceView
                  theme={activeTheme}
                  settings={calc.settings}
                  onLogHistory={(expr, res, note) => calc.recordHistory(expr, res, 'finance', undefined, note)}
                  playClick={calc.playClick}
                />
              </div>
            ) : calc.mode === 'convert' ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-y-auto max-w-md mx-auto w-full p-2">
                <ConvertView
                  theme={activeTheme}
                  settings={calc.settings}
                  onLogHistory={(expr, res) => calc.recordHistory(expr, res, 'convert', undefined, expr)}
                  playClick={calc.playClick}
                  onUnlockMilestone={calc.unlockAchievement}
                />
              </div>
            ) : (
              <>
                {/* Display */}
                <div className="shrink-0 max-w-md mx-auto w-full">
                  <Display
                    display={calc.display}
                    expression={calc.expression}
                    runningEquation={calc.runningEquation}
                    mode={calc.mode}
                    angleUnit={calc.angleUnit}
                    onToggleAngleUnit={() => {
                      const units = ['DEG', 'RAD', 'GRAD'] as const;
                      const nextIdx = (units.indexOf(calc.angleUnit) + 1) % units.length;
                      calc.setAngleUnit(units[nextIdx]);
                    }}
                    base={calc.base}
                    onSetBase={calc.setBase}
                    bitWidth={calc.bitWidth}
                    onSetBitWidth={calc.setBitWidth}
                    programmerBigInt={calc.programmerBigInt}
                    onToggleBit={calc.toggleBitAt}
                    hasMemoryValue={calc.hasMemoryValue}
                    onToggleMemory={() => calc.updateSettings({ showMemoryBar: !calc.settings.showMemoryBar })}
                    theme={activeTheme}
                    settings={calc.settings}
                    parenthesisDepth={calc.parenthesisDepth}
                    onBackspace={calc.deleteChar}
                    onClear={calc.clear}
                    rpnStack={calc.rpnStack}
                    onInsertExact={(val) => calc.setDisplay(val)}
                  />
                </div>

                {/* Keypad */}
                <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden max-w-md mx-auto w-full p-1 sm:p-2 md:p-3">
                  <Keypad
                    mode={calc.mode}
                    base={calc.base}
                    onDigit={calc.inputDigit}
                    onDecimal={calc.inputDecimal}
                    onOperator={calc.setOperator}
                    onEquals={calc.calculateEquals}
                    onClear={calc.clear}
                    onBackspace={calc.deleteChar}
                    onUnary={calc.applyUnaryFunction}
                    onConstant={calc.insertConstant}
                    onParenthesis={calc.handleParenthesis}
                    is2nd={calc.is2nd}
                    onToggle2nd={calc.toggle2nd}
                    onBitShift={calc.applyBitShift}
                    onMemoryClear={() => calc.memoryClear()}
                    onMemoryRecall={() => calc.memoryRecall()}
                    onMemoryStore={() => calc.memoryStore()}
                    onMemoryAdd={() => calc.memoryAdd()}
                    onMemorySubtract={() => calc.memorySubtract()}
                    onToggleMemory={() => calc.updateSettings({ showMemoryBar: !calc.settings.showMemoryBar })}
                    activeMemorySlot={calc.activeMemorySlot}
                    hasMemoryValue={calc.hasMemoryValue}
                    theme={activeTheme}
                    settings={calc.settings}
                    onCustomButton={calc.executeCustomButton}
                    onOpenCustomModal={() => {
                      setActiveProgrammableKey('custom');
                      setCustomModalOpen(true);
                    }}
                    onProgrammableKey={(keyId) => {
                      calc.executeProgrammableKey(keyId);
                    }}
                    onOpenProgrammableModal={(keyId) => {
                      setActiveProgrammableKey(keyId);
                      setCustomModalOpen(true);
                    }}
                    onRpnEnter={calc.rpnPush}
                    onRpnSwap={calc.rpnSwap}
                    onRpnDrop={calc.rpnDrop}
                    onRpnRoll={calc.rpnRoll}
                    rpnStack={calc.rpnStack}
                  />
                </div>
              </>
            )}
          </div>

          {/* INTERACTIVE DRAGGABLE DIVIDER (RESIZES RATIO ON TABLETS / LANDSCAPE) */}
          {historyOpen && (
            <div
              onMouseDown={handleDividerDragStart}
              onTouchStart={handleDividerDragStart}
              className="w-2.5 sm:w-3 h-full cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors flex items-center justify-center shrink-0 z-20 group touch-none"
              title="Drag to adjust Calculator vs History screen ratio"
            >
              <div className="w-1 h-12 rounded-full bg-border group-hover:bg-primary transition-colors" />
            </div>
          )}

          {/* RIGHT COLUMN: TABLET SIDE HISTORY TAPE OR ACCOUNTANT PAPER TAPE */}
          {historyOpen && (
            <div
              style={{ width: `${100 - tabletRatio}%` }}
              className="h-full flex flex-col p-2.5 sm:p-3 pl-0 overflow-hidden border-l border-border/40"
            >
              {/* If on desktop screen (>=1024px) and Paper Tape is enabled, show switcher tab */}
              {viewport.width >= 1024 && calc.settings.showPaperTape !== false ? (
                <>
                  <div
                    className={`flex items-center gap-1 mb-2 p-0.5 rounded-lg border shrink-0 select-none ${
                      activeTheme.id === 'nordic-light'
                        ? 'bg-[#F1F5F9] border-[#CBD5E1]'
                        : activeTheme.id === 'warm-terracotta'
                        ? 'bg-[#1A1412] border-[#453631]'
                        : activeTheme.id === 'solar-amber'
                        ? 'bg-[#16120C] border-[#423321]'
                        : activeTheme.id === 'cyber-emerald'
                        ? 'bg-[#040804] border-[#16381C]'
                        : activeTheme.id === 'custom'
                        ? 'bg-[var(--theme-display-bg,#19191C)] border-[var(--theme-border,#333338)]'
                        : 'bg-muted/60 border-border/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setDesktopRightTab('history')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        desktopRightTab === 'history'
                          ? activeTheme.id === 'nordic-light'
                            ? 'bg-[#FFFFFF] text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                            : activeTheme.id === 'warm-terracotta'
                            ? 'bg-[#251D1A] text-[#FED7AA] border border-[#453631] shadow-xs font-bold'
                            : activeTheme.id === 'solar-amber'
                            ? 'bg-[#241C12] text-[#FEF3C7] border border-[#423321] shadow-xs font-bold'
                            : activeTheme.id === 'cyber-emerald'
                            ? 'bg-[#0A140B] text-[#86EFAC] border border-[#16381C] shadow-xs font-bold'
                            : 'bg-card text-foreground shadow-xs font-bold border border-border/60'
                          : activeTheme.id === 'nordic-light'
                          ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                          : activeTheme.id === 'warm-terracotta'
                          ? 'text-[#A88277] hover:text-[#FED7AA] hover:bg-[#251D1A]/60'
                          : activeTheme.id === 'solar-amber'
                          ? 'text-[#925C13] hover:text-[#FEF3C7] hover:bg-[#241C12]/60'
                          : activeTheme.id === 'cyber-emerald'
                          ? 'text-[#15803D] hover:text-[#86EFAC] hover:bg-[#0A140B]/60'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <HistoryIcon className="w-3.5 h-3.5" />
                      <span>History ({calc.history.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesktopRightTab('tape')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        desktopRightTab === 'tape'
                          ? activeTheme.id === 'nordic-light'
                            ? 'bg-[#FFFFFF] text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                            : activeTheme.id === 'warm-terracotta'
                            ? 'bg-[#251D1A] text-[#FED7AA] border border-[#453631] shadow-xs font-bold'
                            : activeTheme.id === 'solar-amber'
                            ? 'bg-[#241C12] text-[#FEF3C7] border border-[#423321] shadow-xs font-bold'
                            : activeTheme.id === 'cyber-emerald'
                            ? 'bg-[#0A140B] text-[#86EFAC] border border-[#16381C] shadow-xs font-bold'
                            : 'bg-card text-foreground shadow-xs font-bold border border-border/60'
                          : activeTheme.id === 'nordic-light'
                          ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                          : activeTheme.id === 'warm-terracotta'
                          ? 'text-[#A88277] hover:text-[#FED7AA] hover:bg-[#251D1A]/60'
                          : activeTheme.id === 'solar-amber'
                          ? 'text-[#925C13] hover:text-[#FEF3C7] hover:bg-[#241C12]/60'
                          : activeTheme.id === 'cyber-emerald'
                          ? 'text-[#15803D] hover:text-[#86EFAC] hover:bg-[#0A140B]/60'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <FileText className={`w-3.5 h-3.5 ${activeTheme.id === 'warm-terracotta' ? 'text-[#EA580C]' : 'text-primary'}`} />
                      <span>Paper Tape</span>
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {desktopRightTab === 'tape' ? (
                      <AccountantPaperTape
                        history={calc.history}
                        onRecall={(item, useResultOnly) => {
                          calc.recallHistoryItem(item, useResultOnly);
                          toast.success('Recalled from tape', { description: item.result });
                        }}
                        onDelete={calc.deleteHistoryItem}
                        onClear={calc.clearHistory}
                        onUpdateNote={calc.updateHistoryItemNote}
                        onExport={calc.exportHistory}
                        theme={activeTheme}
                        settings={calc.settings}
                        onClose={() => setHistoryOpen(false)}
                      />
                    ) : (
                      <HistoryTape
                        history={calc.history}
                        onRecall={(item, useResultOnly) => {
                          calc.recallHistoryItem(item, useResultOnly);
                          toast.success('Recalled from history', { description: item.result });
                        }}
                        onDelete={calc.deleteHistoryItem}
                        onClear={calc.clearHistory}
                        onUpdateNote={calc.updateHistoryItemNote}
                        onExport={calc.exportHistory}
                        theme={activeTheme}
                        settings={calc.settings}
                        onClose={() => setHistoryOpen(false)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <HistoryTape
                    history={calc.history}
                    onRecall={(item, useResultOnly) => {
                      calc.recallHistoryItem(item, useResultOnly);
                      toast.success('Recalled from history', { description: item.result });
                    }}
                    onDelete={calc.deleteHistoryItem}
                    onClear={calc.clearHistory}
                    onUpdateNote={calc.updateHistoryItemNote}
                    onExport={calc.exportHistory}
                    theme={activeTheme}
                    settings={calc.settings}
                    onClose={() => setHistoryOpen(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODALS */}
        <ShortcutsModal
          open={shortcutsModalOpen}
          onOpenChange={setShortcutsModalOpen}
          programmableKeys={calc.settings.programmableKeys}
          onUpdateProgrammableKeys={(keys) => calc.updateSettings({ programmableKeys: keys })}
          theme={activeTheme}
          customThemeStyle={customThemeStyle}
        />
        <VisualFormulaCheatSheetDialog
          open={formulaModalOpen}
          onOpenChange={setFormulaModalOpen}
          onInsertExpression={(expr) => calc.setDisplay(expr)}
          onInsertResult={(res) => calc.setDisplay(res)}
          theme={activeTheme}
          customThemeStyle={customThemeStyle}
        />
        <SettingsModal
          open={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
          mode={calc.mode}
          onSetMode={calc.setMode}
          settings={calc.settings}
          onUpdateSettings={calc.updateSettings}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
          onOpenGadgets={() => {
            setGadgetsInitialTab('dice');
            setGadgetsModalOpen(true);
          }}
          onOpenMilestones={handleOpenMilestones}
          isPhone={false}
          theme={activeTheme}
          customThemeStyle={customThemeStyle}
          onOpenCustomModal={() => {
            setActiveProgrammableKey('custom');
            setCustomModalOpen(true);
          }}
          onOpenProgrammableModal={(keyId) => {
            setActiveProgrammableKey(keyId);
            setCustomModalOpen(true);
          }}
        />
        <GadgetsDialog
          open={gadgetsModalOpen}
          onOpenChange={setGadgetsModalOpen}
          settings={calc.settings}
          onUpdateSettings={calc.updateSettings}
          onUnlockAchievement={calc.unlockAchievement}
          initialTab={gadgetsInitialTab}
          theme={activeTheme}
          customThemeStyle={customThemeStyle}
        />
        <CustomButtonModal
          open={customModalOpen}
          onOpenChange={setCustomModalOpen}
          keyId={activeProgrammableKey}
          config={calc.settings.programmableKeys?.[activeProgrammableKey] || calc.settings.customButton}
          onSave={(newCfg) => calc.updateProgrammableKey(activeProgrammableKey, newCfg)}
        />
        <MilestoneCelebrationModal
          achievement={calc.newlyUnlockedMilestone}
          open={Boolean(calc.newlyUnlockedMilestone)}
          onClose={calc.clearCelebratedMilestone}
          onOpenAllBadges={() => setGadgetsModalOpen(true)}
          totalUnlocked={calc.settings.unlockedAchievements?.length || 0}
          totalAvailable={ACHIEVEMENTS_LIST.length}
          remainingInQueue={calc.remainingInMilestoneQueue}
        />
      </div>
    );
  }

  // =========================================================================
  // 3. DESKTOP WINDOWED MODE (OPTIONAL RESIZABLE WINDOW WITH STRICT BOUNDS)
  // =========================================================================
  return (
    <div
      style={customThemeStyle}
      className={`min-h-screen w-full transition-colors ${
        activeTheme.id === 'custom' ? 'bg-[var(--theme-bg)]' : activeTheme.classes.bg
      } text-foreground relative flex flex-col justify-center items-center p-2 sm:p-4 md:p-6`}
    >
      {/* SCALABLE RESIZABLE WINDOW CONTAINER */}
      <div
        ref={windowRef}
        data-theme={activeTheme.id}
        style={{
          opacity: calc.settings.windowOpacity ?? 1,
          zoom: calc.settings.fontScale && calc.settings.fontScale !== 1 ? calc.settings.fontScale : undefined,
          width: `${windowSize ? Math.max(windowSize.width, minWidth) : resolvedDefaultWidth}px`,
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`,
          height: `${windowSize ? Math.max(windowSize.height, minHeight) : resolvedDefaultHeight}px`,
          maxHeight: 'calc(100vh - 24px)',
          ...customThemeStyle,
        }}
        className={`select-none ${fontClass} ${weightClass} theme-${activeTheme.id} ${
          isExpandedWithHistory
            ? 'p-3.5 sm:p-4 flex flex-col gap-3 max-w-[98vw] max-h-[96vh]'
            : isCompact
            ? 'p-2.5 flex flex-col gap-2 max-w-[98vw] max-h-[96vh]'
            : 'p-3.5 flex flex-col gap-2.5 max-w-[98vw] max-h-[96vh]'
        } ${cornerClasses.window} border relative transition-[opacity,box-shadow,transform] duration-300 overflow-hidden ${
          calc.settings.upsideDownMode ? 'rotate-180' : ''
        } ${
          isPinned
            ? 'border-primary/50 shadow-2xl z-50 ring-2 ring-primary/20'
            : 'border-border/40 shadow-xl z-30'
        } ${
          activeTheme.id === 'nordic-light'
            ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1]'
            : activeTheme.id === 'dockalc-dark'
            ? 'bg-[#222226] text-[#F4F4F5] border-[#333338]'
            : activeTheme.id === 'custom'
            ? 'bg-[var(--theme-card)] text-foreground border-[var(--theme-border)]'
            : 'bg-[#181A20] text-foreground border-white/10'
        }`}
      >
        {/* WINDOW HEADER */}
        <header className="flex items-center justify-between pb-0.5 rounded-xl p-0.5 w-full min-w-0 gap-2 cursor-default select-none shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
            {/* Subtle background container for logo in light/dark mode */}
            <div className="flex items-center gap-1.5 px-2.5 h-9 sm:h-10 rounded-xl bg-slate-100/90 dark:bg-muted/50 border border-slate-200/80 dark:border-border/50 shrink-0 shadow-2xs">
              <img
                src={dockalcLogo}
                alt="Dockalc Logo"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-contain shadow-xs shrink-0"
              />
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-foreground tracking-tight shrink-0 font-mono">
                Dockalc
              </h1>
            </div>
            <span className="text-muted-foreground/30 font-light text-sm shrink-0">|</span>

            {/* Mode Switcher Custom Dropdown */}
            <ModeDropdown
              mode={calc.mode}
              onSetMode={calc.setMode}
              theme={activeTheme}
              playClick={calc.playClick}
            />

            {isPinned && isExpandedWithHistory && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider shrink-0">
                Pinned
              </span>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-0.5 shrink-0 ml-auto">
            {/* Switch to Full Screen Mode */}
            <button
              type="button"
              onClick={() => calc.updateSettings({ deviceLayout: 'auto' })}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Switch to Full Screen Layout"
            >
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
            </button>

            {/* Always on Top */}
            <button
              type="button"
              onClick={toggleAlwaysOnTop}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isPinned
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={isPinned ? 'Unpin window (Alt+P)' : 'Pin window Always-on-Top (Alt+P)'}
            >
              <Pin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isPinned ? 'rotate-45' : ''}`} />
            </button>

            {/* History Toggle */}
            <button
              type="button"
              onClick={() => {
                if (!historyOpen) {
                  setHistoryOpen(true);
                  setDesktopRightTab('history');
                } else if (desktopRightTab === 'history') {
                  setHistoryOpen(false);
                } else {
                  setDesktopRightTab('history');
                }
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                historyOpen && desktopRightTab === 'history'
                  ? 'bg-primary/20 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={historyOpen && desktopRightTab === 'history' ? 'Hide History' : 'View History Log (Ctrl+H)'}
            >
              <HistoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
            </button>

            {/* Desktop-Only Accountant Paper Tape Button (conditional on settings) */}
            {calc.settings.showPaperTape !== false && (
              <button
                type="button"
                onClick={() => {
                  if (!historyOpen) {
                    setHistoryOpen(true);
                    setDesktopRightTab('tape');
                  } else if (desktopRightTab === 'tape') {
                    setHistoryOpen(false);
                  } else {
                    setDesktopRightTab('tape');
                  }
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  historyOpen && desktopRightTab === 'tape'
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                title={historyOpen && desktopRightTab === 'tape' ? 'Hide Paper Tape' : 'Accountant Paper Tape with Annotations & Export'}
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
              </button>
            )}

            {/* Fun Gadgets & Milestones Button */}
            <button
              type="button"
              onClick={() => setGadgetsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Fun Gadgets & Milestones (Dice, Coin, Target 24, Milestones)"
            >
              <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            </button>

            {/* Visual Formula Cheat Sheet */}
            <button
              type="button"
              onClick={() => setFormulaModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Visual Formula Cheat Sheet (Alt+F)"
            >
              <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            </button>

            {/* Keyboard Shortcuts Overlay */}
            <button
              type="button"
              onClick={() => setShortcutsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Keyboard Shortcuts & Programmable Hotkeys (?)"
            >
              <Keyboard className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Preferences & Themes"
            >
              <Cog className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            </button>

            {/* Reset Size */}
            {windowSize && (
              <div className="flex items-center gap-0.5 border-l border-border/40 pl-1 ml-0.5">
                <button
                  type="button"
                  onClick={resetWindowSize}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                  title="Reset Window Size"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* WINDOW BODY: CALCULATOR + HISTORY */}
        <div className="flex flex-col md:flex-row gap-3 lg:gap-3.5 items-stretch flex-1 min-h-0 select-text w-full">
          <div
            style={{
              width: isExpandedWithHistory ? `${calc.settings.tabletRatio || 65}%` : '100%',
              flexBasis: isExpandedWithHistory ? `${calc.settings.tabletRatio || 65}%` : '100%',
            }}
            className="flex flex-col gap-2 sm:gap-2.5 h-full min-h-0 flex-1 min-w-[280px] transition-[width,flex-basis] duration-100"
          >
            {calc.mode === 'finance' ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-y-auto w-full p-2">
                <FinanceView
                  theme={activeTheme}
                  settings={calc.settings}
                  onLogHistory={(expr, res, note) => calc.recordHistory(expr, res, 'finance', undefined, note)}
                  playClick={calc.playClick}
                />
              </div>
            ) : calc.mode === 'convert' ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-y-auto w-full p-2">
                <ConvertView
                  theme={activeTheme}
                  settings={calc.settings}
                  onLogHistory={(expr, res) => calc.recordHistory(expr, res, 'convert', undefined, expr)}
                  playClick={calc.playClick}
                  onUnlockMilestone={calc.unlockAchievement}
                />
              </div>
            ) : (
              <>
                <Display
                  display={calc.display}
                  expression={calc.expression}
                  runningEquation={calc.runningEquation}
                  mode={calc.mode}
                  angleUnit={calc.angleUnit}
                  onToggleAngleUnit={() => {
                    const units = ['DEG', 'RAD', 'GRAD'] as const;
                    const nextIdx = (units.indexOf(calc.angleUnit) + 1) % units.length;
                    calc.setAngleUnit(units[nextIdx]);
                  }}
                  base={calc.base}
                  onSetBase={calc.setBase}
                  bitWidth={calc.bitWidth}
                  onSetBitWidth={calc.setBitWidth}
                  programmerBigInt={calc.programmerBigInt}
                  onToggleBit={calc.toggleBitAt}
                  hasMemoryValue={calc.hasMemoryValue}
                  onToggleMemory={() => calc.updateSettings({ showMemoryBar: !calc.settings.showMemoryBar })}
                  theme={activeTheme}
                  settings={calc.settings}
                  parenthesisDepth={calc.parenthesisDepth}
                  onBackspace={calc.deleteChar}
                  onClear={calc.clear}
                  rpnStack={calc.rpnStack}
                  onInsertExact={(val) => calc.setDisplay(val)}
                />

                <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden max-w-md mx-auto w-full p-1 sm:p-2 md:p-3">
                  <Keypad
                    mode={calc.mode}
                    base={calc.base}
                    onDigit={calc.inputDigit}
                    onDecimal={calc.inputDecimal}
                    onOperator={calc.setOperator}
                    onEquals={calc.calculateEquals}
                    onClear={calc.clear}
                    onBackspace={calc.deleteChar}
                    onUnary={calc.applyUnaryFunction}
                    onConstant={calc.insertConstant}
                    onParenthesis={calc.handleParenthesis}
                    is2nd={calc.is2nd}
                    onToggle2nd={calc.toggle2nd}
                    onBitShift={calc.applyBitShift}
                    onMemoryClear={() => calc.memoryClear()}
                    onMemoryRecall={() => calc.memoryRecall()}
                    onMemoryStore={() => calc.memoryStore()}
                    onMemoryAdd={() => calc.memoryAdd()}
                    onMemorySubtract={() => calc.memorySubtract()}
                    onToggleMemory={() => calc.updateSettings({ showMemoryBar: !calc.settings.showMemoryBar })}
                    activeMemorySlot={calc.activeMemorySlot}
                    hasMemoryValue={calc.hasMemoryValue}
                    theme={activeTheme}
                    settings={calc.settings}
                    onCustomButton={calc.executeCustomButton}
                    onOpenCustomModal={() => {
                      setActiveProgrammableKey('custom');
                      setCustomModalOpen(true);
                    }}
                    onProgrammableKey={(keyId) => {
                      calc.executeProgrammableKey(keyId);
                    }}
                    onOpenProgrammableModal={(keyId) => {
                      setActiveProgrammableKey(keyId);
                      setCustomModalOpen(true);
                    }}
                    onRpnEnter={calc.rpnPush}
                    onRpnSwap={calc.rpnSwap}
                    onRpnDrop={calc.rpnDrop}
                    onRpnRoll={calc.rpnRoll}
                    rpnStack={calc.rpnStack}
                  />
                </div>
              </>
            )}
          </div>

          {isExpandedWithHistory && (
            <div
              style={{
                width: `${100 - (calc.settings.tabletRatio || 65)}%`,
                flexBasis: `${100 - (calc.settings.tabletRatio || 65)}%`,
              }}
              className="h-full flex flex-col min-h-0 min-w-[240px] transition-[width,flex-basis] duration-100"
            >
              {/* Desktop-Only Right Panel Switcher (shown when Paper Tape is enabled in Settings) */}
              {calc.settings.showPaperTape !== false ? (
                <>
                  <div
                    className={`flex items-center gap-1 mb-2 p-0.5 rounded-lg border shrink-0 select-none ${
                      activeTheme.id === 'nordic-light'
                        ? 'bg-[#F1F5F9] border-[#CBD5E1]'
                        : activeTheme.id === 'dockalc-dark'
                        ? 'bg-[#2A2C35] border-[#404350]'
                        : activeTheme.id === 'warm-terracotta'
                        ? 'bg-[#1A1412] border-[#453631]'
                        : activeTheme.id === 'solar-amber'
                        ? 'bg-[#16120C] border-[#423321]'
                        : activeTheme.id === 'cyber-emerald'
                        ? 'bg-[#040804] border-[#16381C]'
                        : activeTheme.id === 'custom'
                        ? 'bg-[var(--theme-display-bg,#19191C)] border-[var(--theme-border,#333338)]'
                        : 'bg-muted/60 border-border/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setDesktopRightTab('history')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        desktopRightTab === 'history'
                          ? activeTheme.id === 'nordic-light'
                            ? 'bg-[#FFFFFF] text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                            : activeTheme.id === 'dockalc-dark'
                            ? 'bg-[#18181B] text-[#FFFFFF] border border-[#3B82F6]/60 shadow-xs font-bold'
                            : activeTheme.id === 'warm-terracotta'
                            ? 'bg-[#251D1A] text-[#FED7AA] border border-[#453631] shadow-xs font-bold'
                            : activeTheme.id === 'solar-amber'
                            ? 'bg-[#241C12] text-[#FEF3C7] border border-[#423321] shadow-xs font-bold'
                            : activeTheme.id === 'cyber-emerald'
                            ? 'bg-[#0A140B] text-[#86EFAC] border border-[#16381C] shadow-xs font-bold'
                            : 'bg-card text-foreground shadow-xs font-bold border border-border/60'
                          : activeTheme.id === 'nordic-light'
                          ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                          : activeTheme.id === 'dockalc-dark'
                          ? 'text-[#D4D4D8] hover:text-[#FFFFFF] hover:bg-[#343642]'
                          : activeTheme.id === 'warm-terracotta'
                          ? 'text-[#A88277] hover:text-[#FED7AA] hover:bg-[#251D1A]/60'
                          : activeTheme.id === 'solar-amber'
                          ? 'text-[#925C13] hover:text-[#FEF3C7] hover:bg-[#241C12]/60'
                          : activeTheme.id === 'cyber-emerald'
                          ? 'text-[#15803D] hover:text-[#86EFAC] hover:bg-[#0A140B]/60'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <HistoryIcon className="w-3.5 h-3.5" />
                      <span>History ({calc.history.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesktopRightTab('tape')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        desktopRightTab === 'tape'
                          ? activeTheme.id === 'nordic-light'
                            ? 'bg-[#FFFFFF] text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                            : activeTheme.id === 'dockalc-dark'
                            ? 'bg-[#18181B] text-[#FFFFFF] border border-[#3B82F6]/60 shadow-xs font-bold'
                            : activeTheme.id === 'warm-terracotta'
                            ? 'bg-[#251D1A] text-[#FED7AA] border border-[#453631] shadow-xs font-bold'
                            : activeTheme.id === 'solar-amber'
                            ? 'bg-[#241C12] text-[#FEF3C7] border border-[#423321] shadow-xs font-bold'
                            : activeTheme.id === 'cyber-emerald'
                            ? 'bg-[#0A140B] text-[#86EFAC] border border-[#16381C] shadow-xs font-bold'
                            : 'bg-card text-foreground shadow-xs font-bold border border-border/60'
                          : activeTheme.id === 'nordic-light'
                          ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                          : activeTheme.id === 'dockalc-dark'
                          ? 'text-[#D4D4D8] hover:text-[#FFFFFF] hover:bg-[#343642]'
                          : activeTheme.id === 'warm-terracotta'
                          ? 'text-[#A88277] hover:text-[#FED7AA] hover:bg-[#251D1A]/60'
                          : activeTheme.id === 'solar-amber'
                          ? 'text-[#925C13] hover:text-[#FEF3C7] hover:bg-[#241C12]/60'
                          : activeTheme.id === 'cyber-emerald'
                          ? 'text-[#15803D] hover:text-[#86EFAC] hover:bg-[#0A140B]/60'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <FileText className={`w-3.5 h-3.5 ${activeTheme.id === 'warm-terracotta' ? 'text-[#EA580C]' : 'text-primary'}`} />
                      <span>Paper Tape</span>
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {desktopRightTab === 'tape' ? (
                      <AccountantPaperTape
                        history={calc.history}
                        onRecall={(item, useResultOnly) => {
                          calc.recallHistoryItem(item, useResultOnly);
                          toast.success('Recalled from tape', { description: item.result });
                        }}
                        onDelete={calc.deleteHistoryItem}
                        onClear={calc.clearHistory}
                        onUpdateNote={calc.updateHistoryItemNote}
                        onExport={calc.exportHistory}
                        theme={activeTheme}
                        settings={calc.settings}
                        onClose={() => setHistoryOpen(false)}
                      />
                    ) : (
                      <HistoryTape
                        history={calc.history}
                        onRecall={(item, useResultOnly) => {
                          calc.recallHistoryItem(item, useResultOnly);
                          toast.success('Recalled from history', { description: item.result });
                        }}
                        onDelete={calc.deleteHistoryItem}
                        onClear={calc.clearHistory}
                        onUpdateNote={calc.updateHistoryItemNote}
                        onExport={calc.exportHistory}
                        theme={activeTheme}
                        settings={calc.settings}
                        onClose={() => setHistoryOpen(false)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <HistoryTape
                    history={calc.history}
                    onRecall={(item, useResultOnly) => {
                      calc.recallHistoryItem(item, useResultOnly);
                      toast.success('Recalled from history', { description: item.result });
                    }}
                    onDelete={calc.deleteHistoryItem}
                    onClear={calc.clearHistory}
                    onUpdateNote={calc.updateHistoryItemNote}
                    onExport={calc.exportHistory}
                    theme={activeTheme}
                    settings={calc.settings}
                    onClose={() => setHistoryOpen(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* DRAG HANDLE FOR WINDOWED MODE */}
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className="absolute bottom-1 right-1 w-6 h-6 flex items-end justify-end p-1 cursor-se-resize text-muted-foreground/40 hover:text-primary transition-colors select-none z-40 touch-none group"
          title="Drag to resize window width and height"
        >
          <div className="flex flex-col gap-0.5 items-end justify-end pointer-events-none">
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ShortcutsModal
        open={shortcutsModalOpen}
        onOpenChange={setShortcutsModalOpen}
        programmableKeys={calc.settings.programmableKeys}
        onUpdateProgrammableKeys={(keys) => calc.updateSettings({ programmableKeys: keys })}
        theme={activeTheme}
        customThemeStyle={customThemeStyle}
      />
      <VisualFormulaCheatSheetDialog
        open={formulaModalOpen}
        onOpenChange={setFormulaModalOpen}
        onInsertExpression={(expr) => calc.setDisplay(expr)}
        onInsertResult={(res) => calc.setDisplay(res)}
        theme={activeTheme}
        customThemeStyle={customThemeStyle}
      />
      <SettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        mode={calc.mode}
        onSetMode={calc.setMode}
        settings={calc.settings}
        onUpdateSettings={calc.updateSettings}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
        onOpenGadgets={() => {
          setGadgetsInitialTab('dice');
          setGadgetsModalOpen(true);
        }}
        onOpenMilestones={handleOpenMilestones}
        currentWindowSize={windowSize}
        onResetWindowSize={resetWindowSize}
        theme={activeTheme}
        customThemeStyle={customThemeStyle}
        onOpenCustomModal={() => {
          setActiveProgrammableKey('custom');
          setCustomModalOpen(true);
        }}
        onOpenProgrammableModal={(keyId) => {
          setActiveProgrammableKey(keyId);
          setCustomModalOpen(true);
        }}
      />
      <GadgetsDialog
        open={gadgetsModalOpen}
        onOpenChange={setGadgetsModalOpen}
        settings={calc.settings}
        onUpdateSettings={calc.updateSettings}
        onUnlockAchievement={calc.unlockAchievement}
        initialTab={gadgetsInitialTab}
        theme={activeTheme}
        customThemeStyle={customThemeStyle}
      />
      <CustomButtonModal
        open={customModalOpen}
        onOpenChange={setCustomModalOpen}
        keyId={activeProgrammableKey}
        config={calc.settings.programmableKeys?.[activeProgrammableKey] || calc.settings.customButton}
        onSave={(newCfg) => calc.updateProgrammableKey(activeProgrammableKey, newCfg)}
      />
      <MilestoneCelebrationModal
        achievement={calc.newlyUnlockedMilestone}
        open={Boolean(calc.newlyUnlockedMilestone)}
        onClose={calc.clearCelebratedMilestone}
        onOpenAllBadges={() => setGadgetsModalOpen(true)}
        totalUnlocked={calc.settings.unlockedAchievements?.length || 0}
        totalAvailable={ACHIEVEMENTS_LIST.length}
        remainingInQueue={calc.remainingInMilestoneQueue}
      />
    </div>
  );
};

export default CalculatorPage;

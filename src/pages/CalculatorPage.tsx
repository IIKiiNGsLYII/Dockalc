import React, { useState, useRef, useEffect } from 'react';
import {
  History as HistoryIcon,
  Cog,
  Pin,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
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
import { getDesktop } from '@/lib/desktop';
import { useDebouncedUse } from '@/hooks/useDebouncedUse';

export const CalculatorPage: React.FC = () => {
  const calc = useCalculator();

  // Panels & Modals State
  const [historyOpen, setHistoryOpen] = useState(true);
  const [desktopRightTab, setDesktopRightTab] = useState<'history' | 'tape'>('history');
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
  const windowOpacity = calc.settings.windowOpacity ?? 1;

  // Ctrl+V / Cmd+V pastes a number into the calculator (unless you're typing in a field).
  const pasteValueRef = useRef(calc.pasteValue);
  pasteValueRef.current = calc.pasteValue;
  const calcModeRef = useRef(calc.mode);
  calcModeRef.current = calc.mode;
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (calcModeRef.current === 'convert' || calcModeRef.current === 'finance') return;
      const text = e.clipboardData?.getData('text') ?? '';
      if (!text) return;
      e.preventDefault();
      if (!pasteValueRef.current(text)) {
        toast.error("Clipboard doesn't contain a number", { description: text.length > 40 ? `${text.slice(0, 40)}…` : text });
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  // Convert and Finance don't use the = key, so count their uses here.
  const trackConvertUse = () => calc.markModeUsed('convert');
  const trackFinanceUse = useDebouncedUse(() => calc.markModeUsed('finance'));

  // In the desktop app these settings drive the real OS window, not just the page.
  const desktop = getDesktop();
  useEffect(() => {
    desktop?.setAlwaysOnTop(isPinned);
  }, [desktop, isPinned]);
  useEffect(() => {
    desktop?.setOpacity(windowOpacity);
  }, [desktop, windowOpacity]);
  useEffect(() => {
    desktop?.setCompact(isCompact);
  }, [desktop, isCompact]);
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

  // Desktop app: the OS window can't be made smaller than the calculator needs.
  const zoomFactor = calc.settings.fontScale && calc.settings.fontScale !== 1 ? calc.settings.fontScale : 1;
  useEffect(() => {
    desktop?.setMinSize(Math.ceil(minWidth * zoomFactor) + 16, Math.ceil(minHeight * zoomFactor) + 16);
  }, [desktop, minWidth, minHeight, zoomFactor]);

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
      if (calc.settings.compactOverlay === true) {
        calc.updateSettings({ compactOverlay: false });
        setHistoryOpen(true);
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
  // DESKTOP WINDOW LAYOUT (the only layout)
  // =========================================================================
  return (
    <div
      style={customThemeStyle}
      className={`min-h-screen w-full transition-colors ${
        activeTheme.id === 'custom' ? 'bg-[var(--theme-bg)]' : activeTheme.classes.bg
      } text-foreground relative flex flex-col justify-center items-center ${
        desktop ? 'h-screen overflow-hidden p-2' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      {/* CALCULATOR WINDOW: fills the app window on desktop; a resizable card in a browser */}
      <div
        ref={windowRef}
        data-theme={activeTheme.id}
        style={{
          opacity: desktop ? 1 : windowOpacity,
          zoom: calc.settings.fontScale && calc.settings.fontScale !== 1 ? calc.settings.fontScale : undefined,
          width: desktop ? '100%' : `${windowSize ? Math.max(windowSize.width, minWidth) : resolvedDefaultWidth}px`,
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`,
          height: desktop ? '100%' : `${windowSize ? Math.max(windowSize.height, minHeight) : resolvedDefaultHeight}px`,
          maxHeight: desktop ? undefined : 'calc(100vh - 24px)',
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
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-foreground tracking-tight shrink-0 font-mono max-[560px]:hidden">
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
            {/* Compact mode toggle */}
            <button
              type="button"
              onClick={() => calc.updateSettings({ compactOverlay: !isCompact })}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isCompact ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={isCompact ? 'Exit compact mode' : 'Compact mode (display and keypad only)'}
            >
              {isCompact ? (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
              )}
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

            {/* History Toggle (in compact mode it switches back to full size) */}
            <button
              type="button"
              onClick={() => {
                if (isCompact) {
                  calc.updateSettings({ compactOverlay: false });
                  setHistoryOpen(true);
                  setDesktopRightTab('history');
                } else if (!historyOpen) {
                  setHistoryOpen(true);
                  setDesktopRightTab('history');
                } else if (desktopRightTab === 'history') {
                  setHistoryOpen(false);
                } else {
                  setDesktopRightTab('history');
                }
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isExpandedWithHistory && desktopRightTab === 'history'
                  ? 'bg-primary/20 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={isExpandedWithHistory && desktopRightTab === 'history' ? 'Hide History' : 'View History Log (Ctrl+H)'}
            >
              <HistoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
            </button>

            {/* Desktop-Only Accountant Paper Tape Button (conditional on settings) */}
            {!isCompact && calc.settings.showPaperTape !== false && (
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
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer max-[520px]:hidden"
              title="Visual Formula Cheat Sheet (Alt+F)"
            >
              <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            </button>

            {/* Keyboard Shortcuts Overlay */}
            <button
              type="button"
              onClick={() => setShortcutsModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer max-[520px]:hidden"
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
              <div className="flex-1 min-h-0 flex flex-col overflow-y-auto w-full p-2" onChange={trackFinanceUse}>
                <FinanceView
                  theme={activeTheme}
                  settings={calc.settings}
                  onLogHistory={(expr, res, note) => calc.recordHistory(expr, res, 'finance', undefined, note, false)}
                  playClick={calc.playClick}
                />
              </div>
            ) : calc.mode === 'convert' ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-y-auto w-full p-2">
                <ConvertView
                  theme={activeTheme}
                  settings={calc.settings}
                  onLogHistory={(expr, res) => calc.recordHistory(expr, res, 'convert', undefined, expr, false)}
                  onConversion={trackConvertUse}
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

        {/* DRAG HANDLE (browser only; on desktop you resize the app window itself) */}
        {!desktop && (
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

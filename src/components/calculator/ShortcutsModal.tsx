import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  Sliders,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { THEMES } from '@/lib/themes';
import type { CalculatorTheme } from '@/types/calculator';
import {
  DEFAULT_KEY_HOTKEYS,
  type ProgrammableKeyId,
  type ProgrammableKeysConfig,
  type HotkeyCombination,
  type HotkeyModifier,
} from '@/types/calculator';

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programmableKeys?: ProgrammableKeysConfig;
  onUpdateProgrammableKeys?: (keys: ProgrammableKeysConfig) => void;
  theme?: CalculatorTheme;
  customThemeStyle?: React.CSSProperties;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  open,
  onOpenChange,
  programmableKeys,
  onUpdateProgrammableKeys,
  theme,
  customThemeStyle,
}) => {
  const activeTheme = theme || THEMES[0];
  const themeId = activeTheme.id;
  const isCustom = themeId === 'custom';
  const isNordic = themeId === 'nordic-light';
  const isSolar = themeId === 'solar-amber';
  const isCyber = themeId === 'cyber-emerald';
  const isRetroMac = themeId === 'retro-mac';
  const isTerracotta = themeId === 'warm-terracotta';

  const themeClasses = {
    dialog: isCustom
      ? 'bg-[var(--theme-bg,#121316)] text-[var(--theme-display-text,#f4f4f5)] border-[var(--theme-border,#2d3139)] shadow-2xl'
      : isNordic
      ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1] shadow-2xl'
      : isSolar
      ? 'bg-[#16120C] text-[#FEF3C7] border-[#423321] shadow-2xl'
      : isCyber
      ? 'bg-[#0A1412] text-[#E6FFFA] border-[#1A3832] shadow-2xl'
      : isRetroMac
      ? 'bg-[#D8D8D8] text-[#111111] border-[#999999] shadow-2xl'
      : isTerracotta
      ? 'bg-[#1A1412] text-[#FED7AA] border-[#453631] shadow-2xl'
      : 'bg-[#18181B] text-[#F4F4F5] border-[#333338] shadow-2xl',

    header: isCustom
      ? 'border-[var(--theme-border,#2d3139)]'
      : isNordic
      ? 'border-[#CBD5E1]'
      : isSolar
      ? 'border-[#423321]'
      : isCyber
      ? 'border-[#1A3832]'
      : isRetroMac
      ? 'border-[#999999]'
      : isTerracotta
      ? 'border-[#453631]'
      : 'border-border/40',

    card: isCustom
      ? 'bg-[var(--theme-card,#1c1e22)] border-[var(--theme-border,#2d3139)] text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] shadow-xs'
      : isSolar
      ? 'bg-[#1D170E] border-[#423321] text-[#FEF3C7] shadow-xs'
      : isCyber
      ? 'bg-[#112320] border-[#1A3832] text-[#E6FFFA] shadow-xs'
      : isRetroMac
      ? 'bg-[#E5E5E5] border-[#999999] text-[#111111] shadow-xs'
      : isTerracotta
      ? 'bg-[#251D1A] border-[#453631] text-[#FED7AA] shadow-xs'
      : 'bg-[#222226] border-[#333338] text-[#F4F4F5] shadow-xs',

    banner: isCustom
      ? 'bg-[var(--theme-card,#1c1e22)] border-[var(--theme-border,#2d3139)] text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A]'
      : isSolar
      ? 'bg-[#241C12] border-[#423321] text-[#FEF3C7]'
      : isCyber
      ? 'bg-[#142B27] border-[#1A3832] text-[#E6FFFA]'
      : isRetroMac
      ? 'bg-[#ECECEC] border-[#999999] text-[#111111]'
      : isTerracotta
      ? 'bg-[#30211D] border-[#453631] text-[#FED7AA]'
      : 'bg-primary/5 border-primary/40 text-foreground',

    kbd: isCustom
      ? 'bg-[var(--theme-key-fn,#1a1d22)] text-[var(--theme-display-text,#f4f4f5)] border-[var(--theme-border,#2d3139)] shadow-xs font-mono font-bold'
      : isNordic
      ? 'bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1] shadow-xs font-mono font-bold'
      : isSolar
      ? 'bg-[#2C2216] text-[#FEF3C7] border-[#523F27] shadow-xs font-mono font-bold'
      : isCyber
      ? 'bg-[#142B27] text-[#E6FFFA] border-[#204941] shadow-xs font-mono font-bold'
      : isRetroMac
      ? 'bg-[#ECECEC] text-[#111111] border-[#999999] shadow-xs font-mono font-bold'
      : isTerracotta
      ? 'bg-[#30211D] text-[#FED7AA] border-[#453631] shadow-xs font-mono font-bold'
      : 'bg-muted/80 text-foreground border-border shadow-xs font-mono font-bold',

    tabActive: isCustom
      ? 'bg-[var(--theme-accent,#3b82f6)] text-[var(--theme-accent-text,#ffffff)] font-bold shadow-xs'
      : isNordic
      ? 'bg-[#1D4ED8] text-white font-bold shadow-xs'
      : isSolar
      ? 'bg-[#F59E0B] text-[#16120C] font-bold shadow-xs'
      : isCyber
      ? 'bg-[#10B981] text-[#0A1412] font-bold shadow-xs'
      : isRetroMac
      ? 'bg-[#222222] text-white font-bold shadow-xs'
      : isTerracotta
      ? 'bg-[#EA580C] text-white font-bold shadow-xs'
      : 'bg-primary text-primary-foreground font-bold shadow-xs',

    tabInactive: isCustom
      ? 'bg-[var(--theme-key-fn,#1a1d22)] text-[var(--theme-display-dim,#a1a1aa)] hover:text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-[#CBD5E1]'
      : isSolar
      ? 'bg-[#2C2216] text-[#D97706] hover:text-[#FEF3C7] hover:bg-[#3D3020]'
      : isCyber
      ? 'bg-[#142B27] text-[#10B981] hover:text-[#E6FFFA] hover:bg-[#1C3B35]'
      : isRetroMac
      ? 'bg-[#CCCCCC] text-[#333333] hover:text-[#111111] hover:bg-[#BBBBBB]'
      : isTerracotta
      ? 'bg-[#30211D] text-[#FED7AA]/80 hover:text-[#FED7AA] hover:bg-[#453631]'
      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted',

    buttonPrimary: isCustom
      ? 'bg-[var(--theme-accent,#3b82f6)] hover:bg-[var(--theme-accent-hover,#60a5fa)] text-[var(--theme-accent-text,#ffffff)]'
      : isNordic
      ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white'
      : isSolar
      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#16120C]'
      : isCyber
      ? 'bg-[#10B981] hover:bg-[#059669] text-[#0A1412]'
      : isRetroMac
      ? 'bg-[#222222] hover:bg-[#444444] text-white'
      : isTerracotta
      ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white'
      : 'bg-primary hover:bg-primary/90 text-primary-foreground',

    buttonSecondary: isCustom
      ? 'bg-[var(--theme-key-fn,#1a1d22)] text-[var(--theme-display-text,#f4f4f5)] border-[var(--theme-border,#2d3139)] hover:bg-[var(--theme-card,#1c1e22)]'
      : isNordic
      ? 'bg-[#E2E8F0] text-[#0F172A] border-[#CBD5E1] hover:bg-[#CBD5E1]'
      : isSolar
      ? 'bg-[#2C2216] text-[#FEF3C7] border-[#423321] hover:bg-[#3D3020]'
      : isCyber
      ? 'bg-[#142B27] text-[#E6FFFA] border-[#1A3832] hover:bg-[#1C3B35]'
      : isRetroMac
      ? 'bg-[#ECECEC] text-[#111111] border-[#999999] hover:bg-[#DCDCDC]'
      : isTerracotta
      ? 'bg-[#30211D] text-[#FED7AA] border-[#453631] hover:bg-[#453631]'
      : 'bg-muted/60 text-foreground border-border/60 hover:bg-muted',

    headingText: isCustom
      ? 'text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'text-[#0F172A]'
      : isSolar
      ? 'text-[#FEF3C7]'
      : isCyber
      ? 'text-[#E6FFFA]'
      : isRetroMac
      ? 'text-[#111111]'
      : isTerracotta
      ? 'text-[#FED7AA]'
      : 'text-foreground',

    mutedText: isCustom
      ? 'text-[var(--theme-display-dim,#a1a1aa)]'
      : isNordic
      ? 'text-[#64748B]'
      : isSolar
      ? 'text-[#925C13]'
      : isCyber
      ? 'text-[#10B981]/70'
      : isRetroMac
      ? 'text-[#555555]'
      : isTerracotta
      ? 'text-[#A88277]'
      : 'text-muted-foreground',

    accentText: isCustom
      ? 'text-[var(--theme-accent,#3b82f6)]'
      : isNordic
      ? 'text-[#1D4ED8]'
      : isSolar
      ? 'text-[#F59E0B]'
      : isCyber
      ? 'text-[#10B981]'
      : isRetroMac
      ? 'text-[#111111]'
      : isTerracotta
      ? 'text-[#EA580C]'
      : 'text-primary',
  };
  const [activeTab, setActiveTab] = useState<'cheatsheet' | 'programmable'>('cheatsheet');

  // Programmable Key Rebinding state
  const [recordingKeyId, setRecordingKeyId] = useState<ProgrammableKeyId | null>(null);

  const shortcutGroups = [
    {
      title: 'General & Mode Switching',
      items: [
        { keys: ['Esc'], desc: 'All Clear (AC)' },
        { keys: ['Backspace'], desc: 'Delete last character (⌫)' },
        { keys: ['Enter', '='], desc: 'Calculate result' },
        { keys: ['Alt', '1'], desc: 'Switch to Standard Mode' },
        { keys: ['Alt', '2'], desc: 'Switch to Scientific Mode' },
        { keys: ['Alt', '3'], desc: 'Switch to Programmer Mode' },
        { keys: ['Alt', '4'], desc: 'Switch to Convert Mode' },
        { keys: ['Alt', 'P'], desc: 'Toggle Always-on-Top Pinned Window' },
        { keys: ['?'], desc: 'Open Keyboard Shortcut Overlay' },
      ],
    },
    {
      title: 'Math & Scientific Operations',
      items: [
        { keys: ['0 - 9'], desc: 'Numeric input' },
        { keys: ['.', ','], desc: 'Decimal point' },
        { keys: ['+', '-', '*', '/'], desc: 'Basic arithmetic operators' },
        { keys: ['(', ')'], desc: 'Parentheses / grouping' },
        { keys: ['%'], desc: 'Percentage / Programmer Modulo' },
        { keys: ['^'], desc: 'Power (xʸ)' },
        { keys: ['s'], desc: 'Sine (sin)' },
        { keys: ['c'], desc: 'Cosine (cos)' },
        { keys: ['t'], desc: 'Tangent (tan)' },
        { keys: ['l'], desc: 'Natural logarithm (ln)' },
        { keys: ['g'], desc: 'Common logarithm (log10)' },
        { keys: ['p'], desc: 'Insert Pi (π)' },
        { keys: ['e'], desc: 'Insert Euler’s number (e)' },
        { keys: ['r'], desc: 'Square root (√x)' },
        { keys: ['!'], desc: 'Factorial (n!)' },
        { keys: ['n'], desc: 'Negate sign (±)' },
      ],
    },
    {
      title: 'Programmer Hex & Bitwise Keys',
      items: [
        { keys: ['A - F'], desc: 'Hexadecimal digits (in HEX base)' },
        { keys: ['Click Bit'], desc: 'Flip single bit (0-63) in bitboard' },
        { keys: ['Lsh / Rsh'], desc: 'Bitwise left and right shift' },
        { keys: ['AND/OR/XOR'], desc: 'Bitwise logic operations' },
        { keys: ['NOT / ~'], desc: 'Bitwise complement' },
      ],
    },
    {
      title: 'Active Programmable Hotkeys',
      items: [
        {
          keys: [
            programmableKeys?.reciprocal?.hotkey?.modifier !== 'None'
              ? programmableKeys?.reciprocal?.hotkey?.modifier || 'Alt'
              : '',
            programmableKeys?.reciprocal?.hotkey?.key || 'R',
          ].filter(Boolean),
          desc: '1/x (Reciprocal) - Configurable in Hotkey Manager',
        },
        {
          keys: [
            programmableKeys?.sqr?.hotkey?.modifier !== 'None'
              ? programmableKeys?.sqr?.hotkey?.modifier || 'Alt'
              : '',
            programmableKeys?.sqr?.hotkey?.key || 'S',
          ].filter(Boolean),
          desc: 'x² (Square) - Configurable in Hotkey Manager',
        },
        {
          keys: [
            programmableKeys?.sqrt?.hotkey?.modifier !== 'None'
              ? programmableKeys?.sqrt?.hotkey?.modifier || 'Alt'
              : '',
            programmableKeys?.sqrt?.hotkey?.key || 'Q',
          ].filter(Boolean),
          desc: '√x (Square Root) - Configurable in Hotkey Manager',
        },
        {
          keys: [
            programmableKeys?.custom?.hotkey?.modifier !== 'None'
              ? programmableKeys?.custom?.hotkey?.modifier || 'Alt'
              : '',
            programmableKeys?.custom?.hotkey?.key || 'K',
          ].filter(Boolean),
          desc: 'Custom Key (M) - Configurable in Hotkey Manager',
        },
      ],
    },
    {
      title: 'Memory Stack & History',
      items: [
        { keys: ['Ctrl', 'M'], desc: 'Memory Store (MS)' },
        { keys: ['Ctrl', 'R'], desc: 'Memory Recall (MR)' },
        { keys: ['Ctrl', 'L'], desc: 'Memory Clear (MC)' },
        { keys: ['Ctrl', 'P'], desc: 'Memory Add (M+)' },
        { keys: ['Ctrl', 'Q'], desc: 'Memory Subtract (M-)' },
        { keys: ['Ctrl', 'Shift', 'M'], desc: 'Open Memory Registers Panel' },
        { keys: ['Ctrl', 'H'], desc: 'Toggle Calculation History Panel' },
      ],
    },
  ];

  // Listen for keypress when rebinding
  useEffect(() => {
    if (!recordingKeyId) return;

    const handleKeydown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setRecordingKeyId(null);
        toast.info('Rebinding cancelled');
        return;
      }

      // Ignore pure modifier presses
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      let modifier: HotkeyModifier = 'None';
      if (e.altKey) modifier = 'Alt';
      else if (e.ctrlKey) modifier = 'Ctrl';
      else if (e.shiftKey) modifier = 'Shift';
      else if (e.metaKey) modifier = 'Meta';

      const pressedKey = e.key.toUpperCase();

      // Check conflict across other programmable keys
      if (programmableKeys) {
        for (const [id, cfg] of Object.entries(programmableKeys) as [ProgrammableKeyId, typeof programmableKeys[ProgrammableKeyId]][]) {
          if (id !== recordingKeyId && cfg?.hotkey) {
            const sameMod = (cfg.hotkey.modifier || 'Alt') === modifier;
            const sameKey = (cfg.hotkey.key || '').toUpperCase() === pressedKey;
            if (sameMod && sameKey) {
              toast.warning(`Conflict: "${modifier !== 'None' ? `${modifier}+` : ''}${pressedKey}" is already assigned to another key.`);
            }
          }
        }
      }

      if (onUpdateProgrammableKeys && programmableKeys) {
        const updated = {
          ...programmableKeys,
          [recordingKeyId]: {
            ...programmableKeys[recordingKeyId],
            hotkey: {
              enabled: true,
              modifier,
              key: pressedKey,
            },
          },
        };
        onUpdateProgrammableKeys(updated);
        toast.success(
          `Bound ${recordingKeyId} to: ${modifier !== 'None' ? `${modifier} + ` : ''}${pressedKey}`
        );
      }

      setRecordingKeyId(null);
    };

    window.addEventListener('keydown', handleKeydown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeydown, { capture: true });
    };
  }, [recordingKeyId, programmableKeys, onUpdateProgrammableKeys]);

  const handleResetToDefaults = () => {
    if (onUpdateProgrammableKeys && programmableKeys) {
      const resetKeys: ProgrammableKeysConfig = {
        custom: {
          ...(programmableKeys.custom || { label: 'Tax +8%', actionType: 'tax', value: '8' }),
          hotkey: DEFAULT_KEY_HOTKEYS.custom,
        },
        reciprocal: {
          ...(programmableKeys.reciprocal || { label: '1/x', actionType: 'default_unary', value: '1/x' }),
          hotkey: DEFAULT_KEY_HOTKEYS.reciprocal,
        },
        sqr: {
          ...(programmableKeys.sqr || { label: 'x²', actionType: 'default_unary', value: 'sqr' }),
          hotkey: DEFAULT_KEY_HOTKEYS.sqr,
        },
        sqrt: {
          ...(programmableKeys.sqrt || { label: '√', actionType: 'default_unary', value: '√x' }),
          hotkey: DEFAULT_KEY_HOTKEYS.sqrt,
        },
      };
      onUpdateProgrammableKeys(resetKeys);
      toast.success('Reset all programmable hotkeys to default factory bindings');
    }
  };

  const programmableItems: { id: ProgrammableKeyId; name: string; defaultHotkey: string }[] = [
    { id: 'reciprocal', name: '1/x Key (Reciprocal)', defaultHotkey: 'Alt + R' },
    { id: 'sqr', name: 'x² Key (Square)', defaultHotkey: 'Alt + S' },
    { id: 'sqrt', name: '√x Key (Square Root)', defaultHotkey: 'Alt + Q' },
    { id: 'custom', name: 'Custom Key (M)', defaultHotkey: 'Alt + K' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[85vh] overflow-y-auto p-0 ${themeClasses.dialog}`}
        style={customThemeStyle}
      >
        <DialogHeader className={`p-4 md:p-6 pb-2 border-b ${themeClasses.header}`}>
          <div className="flex items-center gap-2">
            <Keyboard className={`w-5 h-5 ${themeClasses.accentText}`} />
            <DialogTitle className={`text-lg md:text-xl font-bold ${themeClasses.headingText}`}>
              Keyboard Shortcut Overlay & Programmable Manager
            </DialogTitle>
          </div>
          <DialogDescription className={`text-xs ${themeClasses.mutedText}`}>
            View full calculator shortcuts and customize programmable key bindings.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className={`px-4 md:px-6 pt-3 flex items-center gap-2 border-b pb-2 ${themeClasses.header}`}>
          <button
            type="button"
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'cheatsheet'
                ? themeClasses.tabActive
                : themeClasses.tabInactive
            }`}
          >
            Shortcut Cheatsheet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('programmable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'programmable'
                ? themeClasses.tabActive
                : themeClasses.tabInactive
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Programmable Hotkeys</span>
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {activeTab === 'programmable' ? (
            <div className="space-y-4">
              <div className={`p-3.5 rounded-xl border space-y-2 ${themeClasses.banner}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${themeClasses.headingText}`}>
                    <Sparkles className={`w-4 h-4 ${themeClasses.accentText}`} />
                    Custom Programmable Hotkey Remapping
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer border ${themeClasses.buttonSecondary}`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Defaults
                  </button>
                </div>
                <p className={`text-xs leading-relaxed ${themeClasses.mutedText}`}>
                  Click <strong>Rebind</strong> and press any physical key combination (single key like <kbd className={`px-1 py-0.5 rounded border text-[10px] ${themeClasses.kbd}`}>X</kbd> or with <kbd className={`px-1 py-0.5 rounded border text-[10px] ${themeClasses.kbd}`}>Alt</kbd>, <kbd className={`px-1 py-0.5 rounded border text-[10px] ${themeClasses.kbd}`}>Ctrl</kbd>, <kbd className={`px-1 py-0.5 rounded border text-[10px] ${themeClasses.kbd}`}>Shift</kbd>). Press <kbd className={`px-1 py-0.5 rounded border text-[10px] ${themeClasses.kbd}`}>Esc</kbd> to cancel.
                </p>
              </div>

              {recordingKeyId && (
                <div className="p-3 rounded-lg border-2 border-dashed border-amber-500 bg-amber-500/10 animate-pulse text-center">
                  <p className="text-xs font-bold text-amber-500">
                    Listening for keystroke... Press any key on your keyboard to assign to {recordingKeyId} (or Esc to cancel)
                  </p>
                </div>
              )}

              <div className="space-y-2.5">
                {programmableItems.map((item) => {
                  const cfg = programmableKeys?.[item.id];
                  const hk = cfg?.hotkey || DEFAULT_KEY_HOTKEYS[item.id];
                  const isRecording = recordingKeyId === item.id;
                  const modifierLabel = hk.modifier !== 'None' ? `${hk.modifier} + ` : '';
                  const keyStr = `${modifierLabel}${hk.key}`;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${themeClasses.card}`}
                    >
                      <div className="space-y-0.5">
                        <h5 className={`text-xs font-bold ${themeClasses.headingText}`}>{item.name}</h5>
                        <p className={`text-[11px] ${themeClasses.mutedText}`}>
                          Default: <span className="font-mono">{item.defaultHotkey}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`px-2.5 py-1 rounded border font-mono font-bold text-xs ${themeClasses.kbd}`}>
                          {isRecording ? 'Listening...' : keyStr}
                        </div>

                        <button
                          type="button"
                          onClick={() => setRecordingKeyId(item.id)}
                          disabled={isRecording}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isRecording
                              ? 'bg-amber-500 text-white'
                              : themeClasses.buttonPrimary
                          }`}
                        >
                          {isRecording ? 'Press Key...' : 'Rebind'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className={`font-semibold text-sm flex items-center gap-2 ${themeClasses.headingText}`}>
                <Keyboard className={`w-4 h-4 ${themeClasses.accentText}`} />
                Full Keyboard Shortcuts Cheatsheet
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shortcutGroups.map((group) => (
                    <div
                      key={group.title}
                      className={`p-3.5 rounded-xl border space-y-2.5 ${themeClasses.card}`}
                    >
                      <h5 className={`font-semibold text-xs uppercase tracking-wider ${themeClasses.accentText}`}>
                        {group.title}
                      </h5>
                      <div className="space-y-1.5">
                        {group.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between text-xs py-1 border-b last:border-0 ${themeClasses.header}`}
                          >
                            <span className={`text-[11px] ${themeClasses.mutedText}`}>{item.desc}</span>
                            <div className="flex items-center gap-1">
                              {item.keys.map((k, kIdx) => (
                                <kbd
                                  key={kIdx}
                                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border shadow-xs ${themeClasses.kbd}`}
                                >
                                  {k}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

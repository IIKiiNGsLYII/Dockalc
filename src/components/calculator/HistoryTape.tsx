import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  Copy,
  History as HistoryIcon,
  X,
} from 'lucide-react';
import type { HistoryItem, CalculatorTheme, CalculatorSettings } from '@/types/calculator';
import { getCornerRadiusClasses } from '@/lib/cornerRadius';
import { toast } from 'sonner';

interface HistoryTapeProps {
  history: HistoryItem[];
  onRecall: (item: HistoryItem, useResultOnly?: boolean) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onUpdateNote: (id: string, note: string) => void;
  onExport: (format: 'text' | 'csv' | 'json') => string;
  theme: CalculatorTheme;
  settings?: CalculatorSettings;
  onClose?: () => void;
  onQuickInsert?: (val: string) => void;
}

export const HistoryTape: React.FC<HistoryTapeProps> = ({
  history,
  onRecall,
  onDelete,
  onClear,
  onUpdateNote,
  onExport,
  theme,
  settings,
  onClose,
  onQuickInsert,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when a new calculation is recorded (since history is newest-first)
  const prevHistoryLenRef = useRef(history.length);
  useEffect(() => {
    if (history.length > prevHistoryLenRef.current) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    prevHistoryLenRef.current = history.length;
  }, [history.length]);
  const getCardDisplayBgClass = () => {
    if (theme.id === 'oled-black') {
      return 'bg-[#000000] border-[#222226] hover:border-[#3F3F46] hover:bg-[#0A0A0A] text-[#FFFFFF] shadow-none';
    }
    if (theme.id === 'nordic-light') {
      return 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#F1F5F9] hover:border-[#94A3B8] text-[#0F172A] shadow-xs';
    }
    if (theme.id === 'dockalc-dark') {
      return 'bg-[#19191C] border-[#2E2E34] hover:border-primary/50 hover:bg-[#222227] text-[#F4F4F5] shadow-xs';
    }
    if (theme.id === 'custom') {
      return 'bg-[var(--theme-display-bg)] border-[var(--theme-display-border)] hover:border-primary/50 text-[var(--theme-display-text)] shadow-xs';
    }
    return 'bg-[#0A0D14] border-white/10 hover:border-white/20 hover:bg-[#111622] text-white shadow-xs';
  };

  const cornerClasses = getCornerRadiusClasses(settings?.cornerRadius || 'extra');

  const getCleanEquation = (item: HistoryItem) => {
    const raw = item.runningEquation || item.expression;
    const trimmed = raw.trim();
    // If running equation ended prematurely with a trailing operator (e.g. "3 +"), fall back to expression
    if (/[\+\-\×\*\÷\/\%]$/.test(trimmed)) {
      return item.expression || trimmed;
    }
    return trimmed;
  };

  const handleCopyCard = (item: HistoryItem) => {
    const text = `${getCleanEquation(item)} = ${item.result}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast.success('Copied to clipboard', { description: text });
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = () => {
    if (history.length === 0) return;
    // Copy all history in chronological order of input (earliest to latest) for complete trace back
    const inOrderOfInput = [...history].reverse();
    const formatted = inOrderOfInput
      .map((item, idx) => {
        const eq = getCleanEquation(item);
        return `${idx + 1}. ${eq} = ${item.result}`;
      })
      .join('\n');

    navigator.clipboard.writeText(formatted);
    toast.success('Copied all history to clipboard', {
      description: `${history.length} calculations in order of input with equations`,
    });
  };

  return (
    <div className={`flex flex-col h-full ${cornerClasses.card} border ${theme.classes.card} overflow-hidden shadow-sm`}>
      {/* Top Header of History Panel: "History" on left, Copy All, Counter, Trash on right */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-border/40 shrink-0 select-none">
        <h3 className="font-semibold text-base text-foreground tracking-tight">History</h3>
        <div className="flex items-center gap-1.5">
          {/* Copy All Button in top right */}
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={history.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-border/40"
            title="Copy all history in order of input (including equations for trace back)"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy All</span>
          </button>

          {/* Counter rendered as clean text immediately to the left of the trash can icon */}
          <span className="text-xs font-mono font-semibold text-muted-foreground tabular-nums px-1.5">
            {history.length}
          </span>

          {/* Trash Icon to clear history */}
          <button
            type="button"
            onClick={onClear}
            disabled={history.length === 0}
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear all history (Trash)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer lg:hidden"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Entries List / Empty State - Auto-scrolls when cards reach bottom */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 font-mono text-xs select-text overscroll-contain"
      >
        {history.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-muted-foreground">
            <HistoryIcon className="w-9 h-9 opacity-35 mb-2.5 stroke-[1.5]" />
            <p className="text-xs font-normal text-muted-foreground/80">No calculations yet</p>
          </div>
        ) : (
          history.map((item) => {
            const isNordic = theme.id === 'nordic-light';
            const eqText = getCleanEquation(item);
            return (
              <div
                key={item.id}
                onClick={() => onRecall(item)}
                className={`group p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${getCardDisplayBgClass()}`}
                title="Click to recall into calculator"
              >
                <div className={`flex items-center justify-between text-xs sm:text-[13px] gap-2 ${
                  isNordic ? 'text-[#475569]' : theme.id === 'dockalc-dark' ? 'text-zinc-400' : 'text-white/60'
                }`}>
                  <span className="truncate font-mono font-semibold" title={eqText}>
                    {eqText}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Copy Button next to the X symbol */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCard(item);
                      }}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        copiedId === item.id
                          ? 'text-primary bg-primary/10'
                          : isNordic
                            ? 'text-[#64748B] hover:text-foreground hover:bg-[#E2E8F0]'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                      title="Copy calculation (equation & result)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete entry button (X symbol) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isNordic
                          ? 'text-[#64748B] hover:text-destructive hover:bg-destructive/10'
                          : 'text-white/60 hover:text-destructive hover:bg-destructive/10'
                      }`}
                      title="Delete entry (X)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className={`text-right text-sm sm:text-base font-bold ${
                  isNordic ? 'text-[#0F172A]' : theme.id === 'dockalc-dark' ? 'text-[#F4F4F5]' : 'text-white'
                }`}>
                  = {item.result}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

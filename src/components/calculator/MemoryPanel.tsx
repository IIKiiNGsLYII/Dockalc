import React, { useState } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  X,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Plus,
  Minus,
} from 'lucide-react';
import type { MemorySlot, CalculatorTheme } from '@/types/calculator';
import { toast } from 'sonner';

interface MemoryPanelProps {
  memorySlots: MemorySlot[];
  activeSlotIndex: number;
  onSelectSlot: (idx: number) => void;
  onRecall: (idx: number) => void;
  onStore: (idx: number) => void;
  onAdd: (idx: number) => void;
  onSubtract: (idx: number) => void;
  onClear: (idx: number) => void;
  currentDisplay: string;
  theme: CalculatorTheme;
  onClose?: () => void;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  memorySlots,
  activeSlotIndex,
  onSelectSlot,
  onRecall,
  onStore,
  onAdd,
  onSubtract,
  onClear,
  currentDisplay,
  theme,
  onClose,
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (idx: number, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIdx(idx);
    toast.success(`Copied M${idx} to clipboard`, { description: val });
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className={`flex flex-col h-full rounded-xl border ${theme.classes.card} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Memory Registers</h3>
          <span className="text-xs text-muted-foreground font-mono">(M0 – M9)</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Memory Slot List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs select-text">
        {memorySlots.map((slot) => {
          const isActive = slot.index === activeSlotIndex;
          const hasValue = slot.value !== '0';

          return (
            <div
              key={slot.index}
              className={`p-2.5 rounded-lg border transition-all ${
                isActive
                  ? 'border-primary/60 bg-primary/10 shadow-sm'
                  : 'border-border/40 bg-card/60 hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-border/30">
                <button
                  type="button"
                  onClick={() => onSelectSlot(slot.index)}
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    M{slot.index}
                  </span>
                  {isActive && <span className="text-[10px] text-primary font-normal">(Active)</span>}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(slot.index, slot.value)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Copy register value"
                  >
                    {copiedIdx === slot.index ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  {hasValue && (
                    <button
                      type="button"
                      onClick={() => onClear(slot.index)}
                      className="px-1.5 py-0.5 rounded text-[10px] text-destructive hover:bg-destructive/15 transition-colors cursor-pointer"
                      title="Clear this register (MC)"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Value display */}
              <div
                onClick={() => onRecall(slot.index)}
                className={`py-1.5 text-right font-mono text-sm truncate cursor-pointer transition-colors ${
                  hasValue ? 'text-foreground font-semibold hover:text-primary' : 'text-muted-foreground/60'
                }`}
                title="Click to recall into calculator"
              >
                {slot.value}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => onRecall(slot.index)}
                  disabled={!hasValue}
                  className="px-2 py-1 rounded bg-muted/60 hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  title="Recall into calculator (MR)"
                >
                  <ArrowUpFromLine className="w-2.5 h-2.5" />
                  Recall
                </button>
                <button
                  type="button"
                  onClick={() => onStore(slot.index)}
                  className="px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary font-semibold flex items-center gap-1 cursor-pointer"
                  title="Store current display (MS)"
                >
                  <ArrowDownToLine className="w-2.5 h-2.5" />
                  Store
                </button>
                <button
                  type="button"
                  onClick={() => onAdd(slot.index)}
                  className="p-1 rounded bg-muted/60 hover:bg-muted text-foreground cursor-pointer"
                  title="Add to slot (M+)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onSubtract(slot.index)}
                  className="p-1 rounded bg-muted/60 hover:bg-muted text-foreground cursor-pointer"
                  title="Subtract from slot (M-)"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import type { CalcMode, CalculatorTheme } from '@/types/calculator';
import {
  Calculator,
  Binary,
  Layers,
  ArrowLeftRight,
  CircleDollarSign,
  ChevronDown,
  Check,
  FlaskConical,
} from 'lucide-react';
import { toast } from 'sonner';

interface ModeDropdownProps {
  mode: CalcMode;
  onSetMode: (mode: CalcMode) => void;
  theme: CalculatorTheme;
  playClick?: (type?: 'num' | 'op' | 'fn') => void;
}

const MODES: Array<{
  id: CalcMode;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'standard', name: 'Standard', desc: 'Basic arithmetic & memory', icon: Calculator },
  { id: 'scientific', name: 'Scientific', desc: 'Trig, powers & logs', icon: FlaskConical },
  { id: 'programmer', name: 'Programmer', desc: 'Hex, Bin & bitwise logic', icon: Binary },
  { id: 'convert', name: 'Converter', desc: 'Units & live currency FX', icon: ArrowLeftRight },
  { id: 'finance', name: 'Finance', desc: 'Loans, growth & retirement', icon: CircleDollarSign },
];

export const ModeDropdown: React.FC<ModeDropdownProps> = ({
  mode,
  onSetMode,
  theme,
  playClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeMode = MODES.find((m) => m.id === mode) || MODES[0];
  const ActiveIcon = activeMode.icon;
  const isLight = theme.category === 'light' || theme.id === 'nordic-light';

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const buttonStyle = isLight
    ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border-[#CBD5E1]'
    : theme.id === 'dockalc-dark'
    ? 'bg-[#272832] hover:bg-[#323440] text-[#FFFFFF] border-[#404352]'
    : theme.id === 'warm-terracotta'
    ? 'bg-[#251D1A] hover:bg-[#332723] text-[#FED7AA] border-[#453631]'
    : theme.id === 'solar-amber'
    ? 'bg-[#241C12] hover:bg-[#35291A] text-[#FEF3C7] border-[#423321]'
    : theme.id === 'cyber-emerald'
    ? 'bg-[#0A140B] hover:bg-[#122415] text-[#86EFAC] border-[#16381C]'
    : 'bg-card hover:bg-muted text-foreground border-border/70';

  const menuStyle = isLight
    ? 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A] shadow-xl'
    : theme.id === 'dockalc-dark'
    ? 'bg-[#1E1F26] border-[#383A48] text-[#FFFFFF] shadow-2xl'
    : theme.id === 'warm-terracotta'
    ? 'bg-[#1F1714] border-[#453631] text-[#FED7AA] shadow-2xl'
    : theme.id === 'solar-amber'
    ? 'bg-[#1C160E] border-[#423321] text-[#FEF3C7] shadow-2xl'
    : theme.id === 'cyber-emerald'
    ? 'bg-[#060D07] border-[#16381C] text-[#86EFAC] shadow-2xl'
    : 'bg-popover border-border text-foreground shadow-2xl';

  return (
    <div className="relative shrink-0 select-none z-30" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (playClick) playClick('fn');
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-1.5 px-2.5 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-2xs ${buttonStyle}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ActiveIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
        <span className="font-bold">{activeMode.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 top-full mt-1.5 w-56 rounded-xl border p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100 ${menuStyle}`}
        >
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/40 mb-1">
            Calculator Modes
          </div>
          <div className="space-y-0.5">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    if (playClick) playClick('fn');
                    onSetMode(m.id);
                    setIsOpen(false);
                    toast.success(`Switched to ${m.name} mode`);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : isLight
                      ? 'hover:bg-[#F1F5F9] text-[#1E293B]'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                    <div className="truncate">
                      <div className="leading-tight font-medium">{m.name}</div>
                      <div className={`text-[10px] leading-tight ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {m.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5 text-primary-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

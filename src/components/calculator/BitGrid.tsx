import React from 'react';
import type { BitWidth, CalculatorTheme } from '@/types/calculator';

interface BitGridProps {
  val: bigint;
  bitWidth: BitWidth;
  onToggleBit: (index: number) => void;
  theme: CalculatorTheme;
}

export const BitGrid: React.FC<BitGridProps> = ({
  val,
  bitWidth,
  onToggleBit,
  theme,
}) => {
  // Render bits from bitWidth - 1 down to 0
  const bits: number[] = [];
  for (let i = bitWidth - 1; i >= 0; i--) {
    bits.push(i);
  }

  // Group bits in 4s (nibbles)
  const nibbles: number[][] = [];
  for (let i = 0; i < bits.length; i += 4) {
    nibbles.push(bits.slice(i, i + 4));
  }

  return (
    <div className={`p-2.5 rounded-lg border ${theme.classes.card} text-xs font-mono select-none overflow-x-auto`}>
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/50 text-[10px] text-muted-foreground">
        <span>64-BIT BINARY BITBOARD (CLICK BIT TO FLIP)</span>
        <span className="font-semibold text-primary">{bitWidth}-BIT ACTIVE</span>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-2 justify-end min-w-max">
        {nibbles.map((nibble, nIdx) => {
          const highBit = nibble[0];
          return (
            <div key={nIdx} className="flex flex-col items-center">
              <span className="text-[9px] text-muted-foreground/70 mb-0.5">{highBit}</span>
              <div className="flex gap-0.5 bg-background/40 p-0.5 rounded border border-border/40">
                {nibble.map((bitIdx) => {
                  const isSet = ((val >> BigInt(bitIdx)) & 1n) === 1n;
                  return (
                    <button
                      key={bitIdx}
                      type="button"
                      onClick={() => onToggleBit(bitIdx)}
                      title={`Bit ${bitIdx}: click to toggle`}
                      className={`w-4 h-5 rounded-sm flex items-center justify-center font-bold text-[11px] transition-all cursor-pointer ${
                        isSet
                          ? `${theme.classes.accent} bg-primary/20 shadow-sm shadow-primary/30 font-extrabold ring-1 ring-primary/40`
                          : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      {isSet ? '1' : '0'}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

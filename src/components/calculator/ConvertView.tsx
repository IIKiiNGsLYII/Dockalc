import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ruler,
  Scale,
  Coins,
  Thermometer,
  Maximize2,
  FlaskConical,
  Gauge,
  Clock,
  HardDrive,
  Activity,
  Compass,
  Zap,
  Flame,
  ArrowDownToLine,
  Cpu,
  SquareDashed,
  ArrowDownUp,
  Copy,
  Check,
  Delete,
  RefreshCw,
  BookmarkPlus,
  WifiOff,
  Star,
  X,
} from 'lucide-react';
import {
  CONVERSION_CATEGORIES,
  convertValue,
  formatConvertedValue,
  type ConversionCategory,
} from '@/utils/conversions';
import {
  getCachedRates,
  fetchLiveExchangeRates,
  formatLastUpdated,
  type ExchangeRateState,
} from '@/utils/exchangeRates';
import type { CalculatorTheme, CalculatorSettings } from '@/types/calculator';
import { getCornerRadiusClasses } from '@/lib/cornerRadius';
import { toast } from 'sonner';

interface ConvertViewProps {
  theme: CalculatorTheme;
  settings: CalculatorSettings;
  onLogHistory?: (expression: string, result: string) => void;
  playClick?: (type?: 'num' | 'op' | 'fn') => void;
  onUnlockMilestone?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Ruler,
  Scale,
  FlaskConical,
  Coins,
  Compass,
  Zap,
  Flame,
  ArrowDownToLine,
  Cpu,
  Thermometer,
  Maximize2,
  SquareDashed,
  Gauge,
  Clock,
  HardDrive,
  Activity,
};

const CATEGORY_UNITS_STORAGE_KEY = 'dockcalc_category_units_v1';
const FAVORITES_STORAGE_KEY = 'dockcalc_favorite_conversions_v1';

export interface FavoriteConversion {
  id: string; // `${categoryId}_${fromUnitId}_${toUnitId}`
  categoryId: string;
  categoryName: string;
  fromUnitId: string;
  fromUnitName: string;
  fromUnitSymbol: string;
  toUnitId: string;
  toUnitName: string;
  toUnitSymbol: string;
}

const DEFAULT_FAVORITES: FavoriteConversion[] = [
  {
    id: 'volume_cup_ml',
    categoryId: 'volume',
    categoryName: 'Cooking / Volume',
    fromUnitId: 'cup',
    fromUnitName: 'US Cup',
    fromUnitSymbol: 'cup',
    toUnitId: 'ml',
    toUnitName: 'Milliliter',
    toUnitSymbol: 'ml',
  },
  {
    id: 'currency_USD_EUR',
    categoryId: 'currency',
    categoryName: 'Currency',
    fromUnitId: 'USD',
    fromUnitName: 'US Dollar',
    fromUnitSymbol: '$',
    toUnitId: 'EUR',
    toUnitName: 'Euro',
    toUnitSymbol: '€',
  },
  {
    id: 'weight_kg_lb',
    categoryId: 'weight',
    categoryName: 'Weight / Mass',
    fromUnitId: 'kg',
    fromUnitName: 'Kilogram',
    fromUnitSymbol: 'kg',
    toUnitId: 'lb',
    toUnitName: 'Pound',
    toUnitSymbol: 'lb',
  },
  {
    id: 'temperature_c_f',
    categoryId: 'temperature',
    categoryName: 'Temperature',
    fromUnitId: 'c',
    fromUnitName: 'Celsius',
    fromUnitSymbol: '°C',
    toUnitId: 'f',
    toUnitName: 'Fahrenheit',
    toUnitSymbol: '°F',
  },
  {
    id: 'length_in_cm',
    categoryId: 'length',
    categoryName: 'Length',
    fromUnitId: 'in',
    fromUnitName: 'Inch',
    fromUnitSymbol: 'in',
    toUnitId: 'cm',
    toUnitName: 'Centimeter',
    toUnitSymbol: 'cm',
  },
];

const getInitialFavorites = (): FavoriteConversion[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_FAVORITES;
};

const getInitialCategoryUnits = (): Record<string, { from: string; to: string }> => {
  const defaults: Record<string, { from: string; to: string }> = {};
  CONVERSION_CATEGORIES.forEach((cat) => {
    defaults[cat.id] = { from: cat.defaultFrom, to: cat.defaultTo };
  });

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CATEGORY_UNITS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          CONVERSION_CATEGORIES.forEach((cat) => {
            const entry = parsed[cat.id];
            if (entry && typeof entry.from === 'string' && typeof entry.to === 'string') {
              const hasFrom = cat.units.some((u) => u.id === entry.from);
              const hasTo = cat.units.some((u) => u.id === entry.to);
              if (hasFrom && hasTo) {
                defaults[cat.id] = { from: entry.from, to: entry.to };
              }
            }
          });
        }
      }
    } catch {
      // ignore
    }
  }
  return defaults;
};

export const ConvertView: React.FC<ConvertViewProps> = ({
  theme,
  settings,
  onLogHistory,
  playClick,
  onUnlockMilestone,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('volume');
  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState(false);

  // Track unique unit categories converted for Unit Nomad secret milestone
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('dockcalc_units_nomad') || '[]');
      if (!stored.includes(selectedCategoryId)) {
        const next = [...stored, selectedCategoryId];
        localStorage.setItem('dockcalc_units_nomad', JSON.stringify(next));
        if (next.length >= 10 && onUnlockMilestone) {
          onUnlockMilestone('unit-nomad');
        }
      }
    } catch {
      // ignore
    }
  }, [selectedCategoryId, onUnlockMilestone]);

  const category = useMemo<ConversionCategory>(() => {
    return (
      CONVERSION_CATEGORIES.find((c) => c.id === selectedCategoryId) ||
      CONVERSION_CATEGORIES[0]
    );
  }, [selectedCategoryId]);

  // Per-category persistent selected units map
  const [categoryUnits, setCategoryUnits] = useState<Record<string, { from: string; to: string }>>(
    getInitialCategoryUnits
  );

  const activeUnits = categoryUnits[selectedCategoryId] || {
    from: category.defaultFrom,
    to: category.defaultTo,
  };
  const fromUnitId = activeUnits.from;
  const toUnitId = activeUnits.to;

  // Favorites state and handlers
  const [favorites, setFavorites] = useState<FavoriteConversion[]>(getInitialFavorites);

  const currentFavId = `${selectedCategoryId}_${fromUnitId}_${toUnitId}`;
  const isCurrentFavorited = favorites.some((f) => f.id === currentFavId);

  const handleToggleFavorite = useCallback(() => {
    if (playClick) playClick('fn');
    const fromUnit = category.units.find((u) => u.id === fromUnitId);
    const toUnit = category.units.find((u) => u.id === toUnitId);
    if (!fromUnit || !toUnit) return;

    if (isCurrentFavorited) {
      const updated = favorites.filter((f) => f.id !== currentFavId);
      setFavorites(updated);
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      toast.info(`Removed ${fromUnit.symbol} → ${toUnit.symbol} from favorites`);
    } else {
      const newFav: FavoriteConversion = {
        id: currentFavId,
        categoryId: selectedCategoryId,
        categoryName: category.name,
        fromUnitId,
        fromUnitName: fromUnit.name,
        fromUnitSymbol: fromUnit.symbol,
        toUnitId,
        toUnitName: toUnit.name,
        toUnitSymbol: toUnit.symbol,
      };
      const updated = [newFav, ...favorites.filter((f) => f.id !== currentFavId)];
      setFavorites(updated);
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      toast.success(`Saved ${fromUnit.symbol} → ${toUnit.symbol} to favorites`);
    }
  }, [playClick, category, fromUnitId, toUnitId, isCurrentFavorited, favorites, currentFavId, selectedCategoryId]);

  const handleSelectFavorite = useCallback((fav: FavoriteConversion) => {
    if (playClick) playClick('fn');
    if (fav.categoryId !== selectedCategoryId) {
      setSelectedCategoryId(fav.categoryId);
    }
    setCategoryUnits((prev) => {
      const updated = {
        ...prev,
        [fav.categoryId]: {
          from: fav.fromUnitId,
          to: fav.toUnitId,
        },
      };
      try {
        localStorage.setItem(CATEGORY_UNITS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Switched to ${fav.fromUnitSymbol} → ${fav.toUnitSymbol}`);
  }, [playClick, selectedCategoryId]);

  const handleRemoveFavorite = useCallback((favId: string) => {
    const updated = favorites.filter((f) => f.id !== favId);
    setFavorites(updated);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    toast.info('Favorite removed');
  }, [favorites]);

  const handleSetFromUnitId = useCallback((newFrom: string) => {
    setCategoryUnits((prev) => {
      const current = prev[selectedCategoryId] || {
        from: category.defaultFrom,
        to: category.defaultTo,
      };
      const updated = {
        ...prev,
        [selectedCategoryId]: {
          from: newFrom,
          to: current.to,
        },
      };
      try {
        localStorage.setItem(CATEGORY_UNITS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [selectedCategoryId, category]);

  const handleSetToUnitId = useCallback((newTo: string) => {
    setCategoryUnits((prev) => {
      const current = prev[selectedCategoryId] || {
        from: category.defaultFrom,
        to: category.defaultTo,
      };
      const updated = {
        ...prev,
        [selectedCategoryId]: {
          from: current.from,
          to: newTo,
        },
      };
      try {
        localStorage.setItem(CATEGORY_UNITS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [selectedCategoryId, category]);

  // Live exchange rate state
  const [rateState, setRateState] = useState<ExchangeRateState>(getCachedRates());

  const cornerClasses = getCornerRadiusClasses(settings.cornerRadius || 'extra');
  const isNordic = theme.id === 'nordic-light';

  // Keypad font weight calculation based on active settings
  const btnWeightClass =
    settings.keypadFontWeight === 'regular'
      ? 'font-normal'
      : settings.keypadFontWeight === 'bold'
      ? 'font-bold'
      : 'font-medium';

  const baseBtn = `relative flex items-center justify-center calc-btn ${btnWeightClass} transition-all active:scale-[0.97] ${cornerClasses.button} select-none cursor-pointer focus:outline-none`;

  // Fetch live exchange rates on mount and when currency is active
  const loadRates = useCallback(async (isManualRefresh = false) => {
    setRateState((prev) => ({ ...prev, isLoading: true }));
    try {
      const updated = await fetchLiveExchangeRates('USD');
      setRateState(updated);
      if (isManualRefresh) {
        if (updated.source === 'live') {
          toast.success('Live currency exchange rates updated');
        } else {
          toast.info('Using cached exchange rates (offline)');
        }
      }
    } catch {
      setRateState((prev) => ({ ...prev, isLoading: false }));
      if (isManualRefresh) {
        toast.error('Failed to fetch live rates, using cache');
      }
    }
  }, []);

  useEffect(() => {
    // Initial fetch in background
    loadRates(false);
  }, [loadRates]);

  // When category changes, keep the user's previously selected units for that category intact!
  const handleSelectCategory = (catId: string) => {
    if (playClick) playClick('fn');
    setSelectedCategoryId(catId);
    if (catId === 'currency' && rateState.source !== 'live' && !rateState.isLoading) {
      loadRates(false);
    }
  };

  // Live conversion result
  const numericInput = parseFloat(inputValue) || 0;
  const convertedResult = useMemo(() => {
    return convertValue(
      numericInput,
      fromUnitId,
      toUnitId,
      category,
      category.id === 'currency' ? rateState.rates : undefined
    );
  }, [numericInput, fromUnitId, toUnitId, category, rateState.rates]);

  const formattedResult = formatConvertedValue(convertedResult);

  // Reference formula description
  const referenceRateText = useMemo(() => {
    const oneResult = convertValue(
      1,
      fromUnitId,
      toUnitId,
      category,
      category.id === 'currency' ? rateState.rates : undefined
    );
    const fromUnit = category.units.find((u) => u.id === fromUnitId);
    const toUnit = category.units.find((u) => u.id === toUnitId);
    if (!fromUnit || !toUnit) return '';

    if (category.id === 'temperature') {
      if (fromUnitId === 'c' && toUnitId === 'f') return '°F = (°C × 9/5) + 32';
      if (fromUnitId === 'f' && toUnitId === 'c') return '°C = (°F - 32) × 5/9';
      if (fromUnitId === 'c' && toUnitId === 'k') return 'K = °C + 273.15';
      if (fromUnitId === 'k' && toUnitId === 'c') return '°C = K - 273.15';
      return `1 ${fromUnit.symbol} = ${formatConvertedValue(oneResult)} ${toUnit.symbol}`;
    }

    return `1 ${fromUnit.symbol} = ${formatConvertedValue(oneResult)} ${toUnit.symbol}`;
  }, [fromUnitId, toUnitId, category, rateState.rates]);

  // Keypad Handlers
  const handleDigit = useCallback(
    (digit: string) => {
      if (playClick) playClick('num');
      setInputValue((prev) => {
        if (prev === '0') return digit;
        if (prev.length >= 15) return prev;
        return prev + digit;
      });
    },
    [playClick]
  );

  const handleDecimal = useCallback(() => {
    if (playClick) playClick('num');
    setInputValue((prev) => {
      if (prev.includes('.')) return prev;
      return prev + '.';
    });
  }, [playClick]);

  const handleBackspace = useCallback(() => {
    if (playClick) playClick('fn');
    setInputValue((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [playClick]);

  const handleClear = useCallback(() => {
    if (playClick) playClick('fn');
    setInputValue('0');
  }, [playClick]);

  const handleToggleSign = useCallback(() => {
    if (playClick) playClick('fn');
    setInputValue((prev) => {
      if (prev === '0') return '0';
      if (prev.startsWith('-')) return prev.slice(1);
      return '-' + prev;
    });
  }, [playClick]);

  const handleSwapUnits = useCallback(() => {
    if (playClick) playClick('op');
    setCategoryUnits((prev) => {
      const current = prev[selectedCategoryId] || {
        from: category.defaultFrom,
        to: category.defaultTo,
      };
      const updated = {
        ...prev,
        [selectedCategoryId]: {
          from: current.to,
          to: current.from,
        },
      };
      try {
        localStorage.setItem(CATEGORY_UNITS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [selectedCategoryId, category, playClick]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formattedResult);
    setCopied(true);
    toast.success(`Copied: ${formattedResult}`);
    setTimeout(() => setCopied(false), 1500);
  }, [formattedResult]);

  const handleSaveToHistory = useCallback(() => {
    if (playClick) playClick('op');
    const fromUnit = category.units.find((u) => u.id === fromUnitId);
    const toUnit = category.units.find((u) => u.id === toUnitId);
    if (!fromUnit || !toUnit) return;

    const expression = `${inputValue} ${fromUnit.symbol} → ${toUnit.symbol}`;
    const result = `${formattedResult} ${toUnit.symbol}`;

    if (onLogHistory) {
      onLogHistory(expression, result);
      toast.success('Logged conversion to history');
    }
  }, [inputValue, fromUnitId, toUnitId, category, formattedResult, onLogHistory, playClick]);

  // Listen for physical keyboard / numeric keypad typing directly on ConvertView
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input, textarea or contenteditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // If Alt, Ctrl, or Meta keys are pressed, let global shortcuts handle (mode switch, history toggle)
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleDigit(key);
        return;
      }

      if (key === '.' || key === ',') {
        e.preventDefault();
        handleDecimal();
        return;
      }

      if (key === 'Backspace' || key === 'Delete') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
        return;
      }

      if (key === 'F9' || key.toLowerCase() === 'n') {
        e.preventDefault();
        handleToggleSign();
        return;
      }

      if (key.toLowerCase() === 's') {
        e.preventDefault();
        handleSwapUnits();
        return;
      }

      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleSaveToHistory();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleBackspace,
    handleClear,
    handleToggleSign,
    handleSwapUnits,
    handleSaveToHistory,
  ]);

  return (
    <div className="flex flex-col gap-2.5 h-full w-full max-w-full overflow-hidden select-none">
      {/* Category Selection Bar (Scrollable pill badges) */}
      <div className="w-full shrink-0 overflow-x-auto whitespace-nowrap scrollbar-thin pb-1">
        <div className="flex items-center gap-1.5 px-0.5">
          {CONVERSION_CATEGORIES.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.iconName] || Ruler;
            const isSelected = cat.id === selectedCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? isNordic
                      ? 'bg-[#2563EB] text-white border-[#1D4ED8] shadow-xs'
                      : theme.id === 'dockalc-dark'
                      ? 'bg-[#3B82F6] text-white border-[#60A5FA] shadow-xs'
                      : theme.id === 'warm-terracotta'
                      ? 'bg-[#EA580C] text-white border-[#FB923C] shadow-xs'
                      : theme.id === 'solar-amber'
                      ? 'bg-[#F59E0B] text-[#16120C] border-[#FCD34D] shadow-xs'
                      : theme.id === 'cyber-emerald'
                      ? 'bg-[#22C55E] text-[#040804] border-[#86EFAC] shadow-xs'
                      : 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : isNordic
                    ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] border-[#CBD5E1]'
                    : theme.id === 'dockalc-dark'
                    ? 'bg-[#1E1E22] hover:bg-[#27272A] text-[#9CA3AF] border-[#36363C]'
                    : theme.id === 'warm-terracotta'
                    ? 'bg-[#251D1A] hover:bg-[#2E2420] text-[#D1C7BD] border-[#453631]'
                    : theme.id === 'solar-amber'
                    ? 'bg-[#241C12] hover:bg-[#2C2216] text-[#D8CCA8] border-[#423321]'
                    : theme.id === 'cyber-emerald'
                    ? 'bg-[#0A140B] hover:bg-[#0F2111] text-[#9CA89E] border-[#16381C]'
                    : 'bg-card/70 hover:bg-muted text-muted-foreground border-border/60'
                }`}
                title={cat.description}
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick-Access Favorite Conversion Pairs Bar */}
      {favorites.length > 0 && (
        <div className="w-full shrink-0 overflow-x-auto whitespace-nowrap scrollbar-thin pb-0.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 shrink-0 pr-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Favorites:</span>
            </div>
            {favorites.map((fav) => {
              const isFavActive =
                fav.categoryId === selectedCategoryId &&
                fav.fromUnitId === fromUnitId &&
                fav.toUnitId === toUnitId;
              const CatIcon =
                CATEGORY_ICONS[
                  CONVERSION_CATEGORIES.find((c) => c.id === fav.categoryId)?.iconName || 'Ruler'
                ] || Ruler;
              return (
                <div
                  key={fav.id}
                  onClick={() => handleSelectFavorite(fav)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 select-none ${
                    isFavActive
                      ? isNordic
                        ? 'bg-[#EBF3FF] text-[#1D4ED8] border-[#93C5FD] font-bold shadow-xs'
                        : 'bg-amber-500/15 text-amber-500 border-amber-500/40 font-bold shadow-xs'
                      : isNordic
                      ? 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]'
                      : 'bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/50'
                  }`}
                  title={`Switch to ${fav.fromUnitName} → ${fav.toUnitName} (${fav.categoryName})`}
                >
                  <CatIcon className="w-3 h-3 shrink-0 opacity-70" />
                  <span>
                    {fav.fromUnitSymbol} → {fav.toUnitSymbol}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(fav.id);
                    }}
                    className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                    title="Remove favorite"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Conversion Display & Units Card */}
      <div
        className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all ${cornerClasses.card} ${
          isNordic
            ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-xs'
            : theme.id === 'dockalc-dark'
            ? 'bg-[#18181B] border-[#27272A] shadow-xs'
            : theme.id === 'warm-terracotta'
            ? 'bg-[#1D1714] border-[#362B26] shadow-xs'
            : theme.id === 'solar-amber'
            ? 'bg-[#1B150E] border-[#332717] shadow-xs'
            : theme.id === 'cyber-emerald'
            ? 'bg-[#060D07] border-[#0E2413] shadow-xs'
            : 'bg-card border-border/80 shadow-xs'
        }`}
      >
        {/* Real-time Currency Exchange Rate Status Bar (Fixes overflowing text issue from screenshot) */}
        {category.id === 'currency' ? (
          <div className="flex flex-wrap items-center justify-between gap-1 p-1.5 rounded-lg border border-border/50 bg-muted/20 text-xs mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  rateState.source === 'live'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <span className="font-semibold text-[11px] sm:text-xs truncate">
                Exchange Rates (Base: USD)
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0 hidden xs:inline">
                • {formatLastUpdated(rateState.lastUpdatedUtc, rateState.lastUpdatedUnix)}
              </span>
              {rateState.source !== 'live' && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-mono rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                  <WifiOff className="w-2.5 h-2.5" />
                  Cached
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (playClick) playClick('fn');
                loadRates(true);
              }}
              disabled={rateState.isLoading}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border/60 hover:bg-muted text-[11px] font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh live exchange rates"
            >
              <RefreshCw className={`w-3 h-3 ${rateState.isLoading ? 'animate-spin' : ''}`} />
              <span>{rateState.isLoading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium mb-1 px-0.5">
            <span className="truncate">{category.description}</span>
          </div>
        )}

        {/* Source Unit & Value Row */}
        <div className="flex flex-col gap-1 mb-1.5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold opacity-85">
            <span className="text-foreground/90 font-bold">From</span>
            <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground">Input</span>
          </div>

          <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center">
            {/* Source Unit Selector */}
            <div className="col-span-5">
              <select
                value={fromUnitId}
                onChange={(e) => handleSetFromUnitId(e.target.value)}
                className={`w-full py-1 sm:py-1.5 px-2 text-xs font-semibold rounded-lg sm:rounded-xl border outline-none cursor-pointer truncate ${
                  isNordic
                    ? 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1]'
                    : 'bg-muted/40 text-foreground border-border/60'
                }`}
              >
                {category.units.map((u) => (
                  <option key={u.id} value={u.id} className="bg-popover text-popover-foreground">
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Value Input Box */}
            <div className="col-span-7">
              <div
                className={`w-full py-1 sm:py-1.5 px-2.5 rounded-lg sm:rounded-xl border font-mono font-bold text-sm xs:text-base sm:text-lg text-right overflow-x-auto whitespace-nowrap scrollbar-none ${
                  isNordic
                    ? 'bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1]'
                    : 'bg-muted/20 text-white border-border/60'
                }`}
              >
                {inputValue}
              </div>
            </div>
          </div>
        </div>

        {/* Swap / Favorite / Rate Divider Bar */}
        <div className="flex items-center justify-between py-0.5 my-1 border-t border-b border-border/40">
          <div className="text-[10px] sm:text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 min-w-0 pr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0" />
            <span className="truncate">{referenceRateText}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Star Favorite Toggle Button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isCurrentFavorited
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 shadow-xs'
                  : isNordic
                  ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-muted-foreground hover:text-foreground border-[#CBD5E1]'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50'
              }`}
              title={
                isCurrentFavorited
                  ? 'Remove this conversion pair from favorites'
                  : 'Bookmark this conversion pair to favorites'
              }
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isCurrentFavorited ? 'text-amber-500 fill-amber-500' : ''
                }`}
              />
              <span className="hidden xs:inline">{isCurrentFavorited ? 'Saved' : 'Favorite'}</span>
            </button>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapUnits}
              className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shrink-0 ${
                isNordic
                  ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1D4ED8] border-[#CBD5E1]'
                  : theme.id === 'dockalc-dark'
                  ? 'bg-[#27272A] hover:bg-[#323236] text-[#93C5FD] border-[#3F3F46]'
                  : theme.id === 'warm-terracotta'
                  ? 'bg-[#2E2420] hover:bg-[#3E312C] text-[#FED7AA] border-[#4D3C36]'
                  : theme.id === 'solar-amber'
                  ? 'bg-[#2C2216] hover:bg-[#3D3020] text-[#FEF3C7] border-[#4A3924]'
                  : theme.id === 'cyber-emerald'
                  ? 'bg-[#0F2111] hover:bg-[#153319] text-[#86EFAC] border-[#1C4722]'
                  : 'bg-muted/60 hover:bg-muted text-primary border-border/60'
              }`}
              title="Swap source and target units (Hotkey: S)"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          </div>
        </div>

        {/* Target Unit & Converted Result Row */}
        <div className="flex flex-col gap-1 mt-1.5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold opacity-85">
            <span className="text-foreground/90 font-bold">To</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-primary hover:underline cursor-pointer"
                title="Copy result"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center">
            {/* Target Unit Selector */}
            <div className="col-span-5">
              <select
                value={toUnitId}
                onChange={(e) => handleSetToUnitId(e.target.value)}
                className={`w-full py-1 sm:py-1.5 px-2 text-xs font-semibold rounded-lg sm:rounded-xl border outline-none cursor-pointer truncate ${
                  isNordic
                    ? 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1]'
                    : 'bg-muted/40 text-foreground border-border/60'
                }`}
              >
                {category.units.map((u) => (
                  <option key={u.id} value={u.id} className="bg-popover text-popover-foreground">
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Converted Result Box */}
            <div className="col-span-7">
              <div
                onClick={handleCopy}
                className={`w-full py-1 sm:py-1.5 px-2.5 rounded-lg sm:rounded-xl border font-mono font-bold text-sm xs:text-base sm:text-lg text-right overflow-x-auto whitespace-nowrap scrollbar-none cursor-pointer transition-all ${
                  isNordic
                    ? 'bg-[#EBF3FF] text-[#1D4ED8] border-[#93C5FD]'
                    : theme.id === 'dockalc-dark'
                    ? 'bg-[#1E293B]/60 text-[#60A5FA] border-[#2563EB]/40'
                    : theme.id === 'warm-terracotta'
                    ? 'bg-[#431407]/40 text-[#FB923C] border-[#EA580C]/40'
                    : theme.id === 'solar-amber'
                    ? 'bg-[#451A03]/40 text-[#F59E0B] border-[#D97706]/40'
                    : theme.id === 'cyber-emerald'
                    ? 'bg-[#052E16]/40 text-[#4ADE80] border-[#16A34A]/40'
                    : 'bg-primary/10 text-primary border-primary/30'
                }`}
                title="Click to copy converted result"
              >
                {formattedResult}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Numeric Keypad for Conversion */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1 min-h-0 keypad-container">
        {/* ROW 1: Clear, ±, Backspace, Swap */}
        <button
          type="button"
          onClick={handleClear}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-sm ${theme.classes.keyFn}`}
          title="Clear (Esc/C)"
        >
          C
        </button>

        <button
          type="button"
          onClick={handleToggleSign}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-sm ${theme.classes.keyFn}`}
          title="Negate (±)"
        >
          ±
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-sm ${theme.classes.keyFn}`}
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSwapUnits}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-sm ${theme.classes.keyOp}`}
          title="Swap Units"
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>

        {/* ROW 2: 7, 8, 9, Copy */}
        <button
          type="button"
          onClick={() => handleDigit('7')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          7
        </button>

        <button
          type="button"
          onClick={() => handleDigit('8')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          8
        </button>

        <button
          type="button"
          onClick={() => handleDigit('9')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          9
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-xs ${theme.classes.keyFn}`}
          title="Copy converted value"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* ROW 3: 4, 5, 6, Preset 1 */}
        <button
          type="button"
          onClick={() => handleDigit('4')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          4
        </button>

        <button
          type="button"
          onClick={() => handleDigit('5')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          5
        </button>

        <button
          type="button"
          onClick={() => handleDigit('6')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          6
        </button>

        <button
          type="button"
          onClick={() => {
            if (playClick) playClick('fn');
            setInputValue('1');
          }}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-xs ${theme.classes.keyFn}`}
          title="Reset value to 1"
        >
          = 1
        </button>

        {/* ROW 4: 1, 2, 3, Preset 100 */}
        <button
          type="button"
          onClick={() => handleDigit('1')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          1
        </button>

        <button
          type="button"
          onClick={() => handleDigit('2')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          2
        </button>

        <button
          type="button"
          onClick={() => handleDigit('3')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          3
        </button>

        <button
          type="button"
          onClick={() => {
            if (playClick) playClick('fn');
            setInputValue('100');
          }}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-xs ${theme.classes.keyFn}`}
          title="Set value to 100"
        >
          = 100
        </button>

        {/* ROW 5: 00, 0, ., Commit / Save to History */}
        <button
          type="button"
          onClick={() => {
            if (playClick) playClick('num');
            setInputValue((prev) => (prev === '0' ? '0' : prev + '00'));
          }}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-sm ${theme.classes.keyNum}`}
        >
          00
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-base sm:text-lg ${theme.classes.keyNum}`}
        >
          0
        </button>

        <button
          type="button"
          onClick={handleDecimal}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-lg font-mono ${theme.classes.keyNum}`}
        >
          .
        </button>

        <button
          type="button"
          onClick={handleSaveToHistory}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] max-h-[50px] h-full py-0.5 sm:py-1 text-xs sm:text-sm ${theme.classes.keyEqual} shadow-xs flex items-center justify-center gap-1`}
          title="Record this conversion to History"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>Log</span>
        </button>
      </div>
    </div>
  );
};

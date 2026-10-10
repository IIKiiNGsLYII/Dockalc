import React, { useState, useEffect } from 'react';
import {
  Cog,
  Check,
  RotateCcw,
  Percent,
  Calculator,
  Binary,
  ArrowRightLeft,
  FunctionSquare,
  Keyboard,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { CustomActionType, CustomButtonConfig, ProgrammableKeyId, HotkeyModifier } from '@/types/calculator';
import { DEFAULT_KEY_HOTKEYS } from '@/types/calculator';
import { toast } from 'sonner';

interface CustomButtonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: CustomButtonConfig;
  onSave: (config: CustomButtonConfig) => void;
  keyId?: ProgrammableKeyId;
}

const DEFAULT_KEY_INFO: Record<ProgrammableKeyId, { name: string; defaultLabel: string; defaultAction: CustomActionType; defaultValue: string }> = {
  custom: { name: 'Custom Programmable (M)', defaultLabel: 'Tax +8%', defaultAction: 'tax', defaultValue: '8' },
  reciprocal: { name: 'Reciprocal Key (1/x)', defaultLabel: '1/x', defaultAction: 'default_unary', defaultValue: '1/x' },
  sqr: { name: 'Square Key (x²)', defaultLabel: 'x²', defaultAction: 'default_unary', defaultValue: 'sqr' },
  sqrt: { name: 'Square Root Key (√x)', defaultLabel: '√', defaultAction: 'default_unary', defaultValue: '√x' },
};

interface ActionGroupDefinition {
  type: CustomActionType;
  title: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
  valueLabel: string;
  valuePlaceholder: string;
  presets: { name: string; label: string; value: string }[];
}

export const CustomButtonModal: React.FC<CustomButtonModalProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
  keyId = 'custom',
}) => {
  const [label, setLabel] = useState(config.label);
  const [actionType, setActionType] = useState<CustomActionType>(config.actionType);
  const [value, setValue] = useState(config.value);

  const keyMeta = DEFAULT_KEY_INFO[keyId] || DEFAULT_KEY_INFO.custom;
  const defaultHotkey = DEFAULT_KEY_HOTKEYS[keyId] || { enabled: true, modifier: 'Alt', key: 'K' };

  const [hotkeyEnabled, setHotkeyEnabled] = useState<boolean>(config.hotkey?.enabled ?? defaultHotkey.enabled);
  const [hotkeyModifier, setHotkeyModifier] = useState<HotkeyModifier>(config.hotkey?.modifier ?? defaultHotkey.modifier);
  const [hotkeyKey, setHotkeyKey] = useState<string>(config.hotkey?.key ?? defaultHotkey.key);
  const [isRecordingKey, setIsRecordingKey] = useState<boolean>(false);

  useEffect(() => {
    setLabel(config.label);
    setActionType(config.actionType);
    setValue(config.value);
    const def = DEFAULT_KEY_HOTKEYS[keyId] || { enabled: true, modifier: 'Alt', key: 'K' };
    setHotkeyEnabled(config.hotkey?.enabled ?? def.enabled);
    setHotkeyModifier(config.hotkey?.modifier ?? def.modifier);
    setHotkeyKey(config.hotkey?.key ?? def.key);
    setIsRecordingKey(false);
  }, [config, keyId, open]);

  // Listener when user is capturing a keypress
  useEffect(() => {
    if (!isRecordingKey) return;

    const handleCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Ignore bare modifier presses
      if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }
      const rawKey = e.key.toUpperCase();
      setHotkeyKey(rawKey);
      setIsRecordingKey(false);
      toast.success(`Key captured: ${rawKey}`);
    };

    window.addEventListener('keydown', handleCapture, { capture: true });
    return () => window.removeEventListener('keydown', handleCapture, { capture: true });
  }, [isRecordingKey]);

  const ACTION_GROUPS: ActionGroupDefinition[] = [
    ...(keyId !== 'custom'
      ? [
          {
            type: 'default_unary' as CustomActionType,
            title: `Default Math (${keyMeta.defaultLabel})`,
            badge: 'Original',
            desc: `Restores original calculator math operation for this key`,
            icon: Calculator,
            valueLabel: 'Function ID',
            valuePlaceholder: keyMeta.defaultValue,
            presets: [{ name: `Default (${keyMeta.defaultLabel})`, label: keyMeta.defaultLabel, value: keyMeta.defaultValue }],
          },
        ]
      : []),
    {
      type: 'tax',
      title: 'Sales Tax / VAT Addition',
      badge: '+%',
      desc: 'Adds a percentage tax/VAT directly to the current value (e.g. $100 + 8% = $108)',
      icon: Percent,
      valueLabel: 'Tax Rate (%)',
      valuePlaceholder: '8.25',
      presets: [
        { name: '+8% Tax', label: 'Tax +8%', value: '8' },
        { name: '+10% VAT', label: 'VAT 10%', value: '10' },
        { name: '+13% HST', label: 'HST 13%', value: '13' },
        { name: '+20% VAT', label: 'VAT 20%', value: '20' },
      ],
    },
    {
      type: 'tip',
      title: 'Gratuity & Tip Calculation',
      badge: 'Tip',
      desc: 'Adds standard restaurant or service tip percentage to the amount',
      icon: Percent,
      valueLabel: 'Tip Rate (%)',
      valuePlaceholder: '18',
      presets: [
        { name: '+15% Tip', label: 'Tip 15%', value: '15' },
        { name: '+18% Tip', label: 'Tip 18%', value: '18' },
        { name: '+20% Tip', label: 'Tip 20%', value: '20' },
        { name: '+25% Tip', label: 'Tip 25%', value: '25' },
      ],
    },
    {
      type: 'multiplier',
      title: 'Unit Multiplier / Conversion',
      badge: '×Factor',
      desc: 'Multiplies active value by a fixed conversion factor (miles to km, currencies, etc.)',
      icon: ArrowRightLeft,
      valueLabel: 'Multiplication Factor',
      valuePlaceholder: '1.60934',
      presets: [
        { name: 'Miles → Km (×1.609)', label: 'mi→km', value: '1.60934' },
        { name: 'Km → Miles (×0.621)', label: 'km→mi', value: '0.62137' },
        { name: 'Inch → Cm (×2.54)', label: 'in→cm', value: '2.54' },
        { name: 'Lbs → Kg (×0.4536)', label: 'lbs→kg', value: '0.453592' },
      ],
    },
    {
      type: 'doubleZero',
      title: 'Double Zero Key',
      badge: '00',
      desc: 'Appends "00" directly to input, ideal for fast financial, accounting, and cashier entries',
      icon: Binary,
      valueLabel: 'Appended Digits',
      valuePlaceholder: '00',
      presets: [
        { name: 'Double Zero "00"', label: '00', value: '00' },
        { name: 'Triple Zero "000"', label: '000', value: '000' },
      ],
    },
    {
      type: 'constant',
      title: 'Scientific or Business Constant',
      badge: 'Const',
      desc: 'Injects an exact mathematical, physical, or custom numeric constant',
      icon: Calculator,
      valueLabel: 'Constant Numeric Value',
      valuePlaceholder: '3.14159265',
      presets: [
        { name: 'Golden Ratio φ (1.618)', label: 'φ', value: '1.6180339887' },
        { name: 'Speed of Light c (2.998e8)', label: 'c', value: '299792458' },
        { name: 'Euler Number e (2.718)', label: 'e', value: '2.718281828' },
      ],
    },
    {
      type: 'formula',
      title: 'Custom Math Formula f(x)',
      badge: 'f(x)',
      desc: 'Evaluates dynamic algebraic expression where "x" is current value on display',
      icon: FunctionSquare,
      valueLabel: 'Formula Expression (using x)',
      valuePlaceholder: 'x * x + 1',
      presets: [
        { name: 'Square & Plus 1 (x² + 1)', label: 'x²+1', value: 'x*x + 1' },
        { name: 'Fahrenheit → Celsius ((x-32)*5/9)', label: '°F→°C', value: '(x-32)*5/9' },
        { name: 'Monthly Payment (x / 12)', label: '÷12', value: 'x / 12' },
        { name: 'Double (2 * x)', label: '2x', value: '2 * x' },
      ],
    },
  ];

  const currentGroup = ACTION_GROUPS.find((g) => g.type === actionType) || ACTION_GROUPS[0];

  const handleSelectAction = (group: ActionGroupDefinition) => {
    setActionType(group.type);
    if (group.presets.length > 0) {
      const firstPreset = group.presets[0];
      setLabel(firstPreset.label);
      setValue(firstPreset.value);
    }
  };

  const handleApplyPreset = (preset: { name: string; label: string; value: string }, groupType: CustomActionType) => {
    setActionType(groupType);
    setLabel(preset.label);
    setValue(preset.value);
    toast.info(`Preset applied: ${preset.name}`);
  };

  const handleResetToDefault = () => {
    setLabel(keyMeta.defaultLabel);
    setActionType(keyMeta.defaultAction);
    setValue(keyMeta.defaultValue);
    const def = DEFAULT_KEY_HOTKEYS[keyId] || { enabled: true, modifier: 'Alt', key: 'K' };
    setHotkeyEnabled(def.enabled);
    setHotkeyModifier(def.modifier);
    setHotkeyKey(def.key);
    const hotkeyDesc = def.modifier === 'None' ? def.key : `${def.modifier}+${def.key}`;
    toast.info(`Reset to default: ${keyMeta.defaultLabel} (${hotkeyDesc})`);
  };

  const handleResetHotkeyOnly = () => {
    const def = DEFAULT_KEY_HOTKEYS[keyId] || { enabled: true, modifier: 'Alt', key: 'K' };
    setHotkeyEnabled(true);
    setHotkeyModifier(def.modifier);
    setHotkeyKey(def.key);
    const hotkeyDesc = def.modifier === 'None' ? def.key : `${def.modifier}+${def.key}`;
    toast.info(`Hotkey reset to default: ${hotkeyDesc}`);
  };

  const handleSave = () => {
    if (!label.trim()) {
      toast.error('Button label cannot be empty');
      return;
    }
    const cleanKey = hotkeyKey.trim().toUpperCase() || defaultHotkey.key;
    const hotkeyDesc = hotkeyEnabled
      ? (hotkeyModifier === 'None' ? cleanKey : `${hotkeyModifier}+${cleanKey}`)
      : 'Off';
    onSave({
      label: label.trim(),
      actionType,
      value: value.trim(),
      hotkey: {
        enabled: hotkeyEnabled,
        modifier: hotkeyModifier,
        key: cleanKey,
      },
    });
    toast.success('Key programmed successfully', {
      description: `"${keyMeta.name}" assigned to [${label}] with hotkey ${hotkeyDesc}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 md:p-5 pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cog className="w-5 h-5 text-primary shrink-0" />
              <DialogTitle className="text-base md:text-lg font-bold">
                Program Key: {keyMeta.name}
              </DialogTitle>
            </div>
            {keyId !== 'custom' && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md border border-border/50 hover:bg-muted cursor-pointer transition-colors"
                title="Reset key to original function"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Select an action behavior and choose a preset or customize parameters below.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 md:p-5 space-y-4">
          {/* Unified Action Behavior & Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Action Behavior & Quick Presets</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                Click behavior card or tap a preset chip
              </span>
            </div>

            <div className="space-y-2">
              {ACTION_GROUPS.map((group) => {
                const isSelected = actionType === group.type;
                const IconComponent = group.icon;

                return (
                  <div
                    key={group.type}
                    className={`rounded-xl border transition-all p-2.5 sm:p-3 ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/40 shadow-xs'
                        : 'border-border/60 bg-card/60 hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div
                      className="flex items-start justify-between gap-2 cursor-pointer select-none"
                      onClick={() => handleSelectAction(group)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted text-muted-foreground border-border/50'
                          }`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{group.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-muted/80 text-primary border border-border/50">
                              {group.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {group.desc}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Integrated Presets row for this action */}
                    {group.presets.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-medium text-muted-foreground mr-1">Presets:</span>
                        {group.presets.map((preset) => {
                          const isPresetActive = isSelected && label === preset.label && value === preset.value;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyPreset(preset, group.type);
                              }}
                              className={`px-2 py-0.5 text-[11px] rounded-md border transition-all cursor-pointer ${
                                isPresetActive
                                  ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-xs'
                                  : 'bg-background hover:bg-muted border-border/60 text-foreground/80 hover:text-foreground'
                              }`}
                            >
                              {preset.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Parameters & Appearance */}
          <div className="p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Button Appearance & Configuration</span>
              <span className="text-[10px] text-muted-foreground">Live Keypad Preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button Label */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Keypad Display Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Tax +8%, 00, mi→km"
                  maxLength={12}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Shown on button (max 12 chars)
                </span>
              </div>

              {/* Value Input */}
              {actionType !== 'doubleZero' && (
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    {currentGroup.valueLabel}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={currentGroup.valuePlaceholder}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">
                    {actionType === 'formula' ? 'Use x as input variable' : 'Numerical value applied'}
                  </span>
                </div>
              )}
            </div>

            {/* Live Keypad Button Preview */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground">Resulting key preview:</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-mono font-bold text-xs shadow-xs border border-primary/50">
                  {label || 'Custom'}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  ({currentGroup.badge}: {value || '—'})
                </span>
              </div>
            </div>
          </div>

          {/* Hotkey Combination (Modifier + User-Defined Key) */}
          <div className="p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Hotkey Combination</span>
              </div>
              <button
                type="button"
                onClick={handleResetHotkeyOnly}
                className="text-[10px] text-primary hover:underline cursor-pointer"
                title={`Reset to default (${defaultHotkey.modifier === 'None' ? defaultHotkey.key : `${defaultHotkey.modifier} + ${defaultHotkey.key}`})`}
              >
                Reset Default ({defaultHotkey.modifier === 'None' ? defaultHotkey.key : `${defaultHotkey.modifier}+${defaultHotkey.key}`})
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-foreground">Enable Key Shortcut</span>
                <p className="text-[10px] text-muted-foreground">Trigger this programmable key via keyboard shortcut (single key or with modifier)</p>
              </div>
              <input
                type="checkbox"
                checked={hotkeyEnabled}
                onChange={(e) => setHotkeyEnabled(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>

            {hotkeyEnabled && (
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* Modifier Key Selection */}
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                      Modifier (Optional)
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {([
                        { id: 'None', label: 'None' },
                        { id: 'Alt', label: 'Alt' },
                        { id: 'Ctrl', label: 'Ctrl' },
                        { id: 'Shift', label: 'Shift' },
                        { id: 'Meta', label: 'Cmd' },
                      ] as { id: HotkeyModifier; label: string }[]).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setHotkeyModifier(item.id)}
                          className={`py-1 text-xs rounded-md border font-mono font-semibold transition-all cursor-pointer ${
                            hotkeyModifier === item.id
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-background hover:bg-muted border-border/60 text-muted-foreground'
                          }`}
                          title={item.id === 'None' ? 'No modifier key (trigger with single key directly)' : `Require ${item.label} modifier`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Single or Secondary Key Input */}
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                      {hotkeyModifier === 'None' ? 'Single Key Input' : 'Secondary Key Input'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={hotkeyKey}
                        onChange={(e) => setHotkeyKey(e.target.value.slice(-1).toUpperCase())}
                        placeholder={defaultHotkey.key}
                        maxLength={1}
                        className="w-16 px-2.5 py-1 text-center font-mono font-bold text-xs rounded-lg bg-background border border-border text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setIsRecordingKey(true)}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isRecordingKey
                            ? 'bg-primary text-primary-foreground border-primary animate-pulse'
                            : 'bg-muted hover:bg-muted/80 text-foreground border-border/60'
                        }`}
                      >
                        {isRecordingKey ? 'Press any key...' : 'Capture Key'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hotkey Preview Display */}
                <div className="flex items-center justify-between text-xs pt-1.5">
                  <span className="text-[11px] text-muted-foreground">Active Shortcut:</span>
                  <div className="flex items-center gap-1 font-mono">
                    {hotkeyModifier !== 'None' && (
                      <>
                        <kbd className="px-2 py-0.5 rounded bg-muted border border-border text-xs font-bold text-foreground shadow-xs">
                          {hotkeyModifier}
                        </kbd>
                        <span className="text-muted-foreground">+</span>
                      </>
                    )}
                    <kbd className="px-2 py-0.5 rounded bg-muted border border-border text-xs font-bold text-primary shadow-xs">
                      {hotkeyKey || defaultHotkey.key}
                    </kbd>
                    {hotkeyModifier === 'None' && (
                      <span className="text-[10px] text-muted-foreground ml-1 font-sans">(Single key)</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


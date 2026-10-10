import { FALLBACK_RATES_USD } from './exchangeRates';

export interface ConversionUnit {
  id: string;
  name: string;
  symbol: string;
  // Factor relative to base unit for linear conversions: baseValue = unitValue * toBaseFactor
  toBase?: number;
  fromBase?: number;
  // Custom functions for non-linear conversions like temperature
  customToBase?: (val: number) => number;
  customFromBase?: (val: number) => number;
}

export interface ConversionCategory {
  id: string;
  name: string;
  iconName:
    | 'Ruler'
    | 'Scale'
    | 'Coins'
    | 'Thermometer'
    | 'Maximize2'
    | 'FlaskConical'
    | 'Gauge'
    | 'Clock'
    | 'HardDrive'
    | 'Activity'
    | 'Compass'
    | 'Zap'
    | 'Flame'
    | 'ArrowDownToLine'
    | 'Cpu'
    | 'SquareDashed';
  description: string;
  defaultFrom: string;
  defaultTo: string;
  units: ConversionUnit[];
}

export const CONVERSION_CATEGORIES: ConversionCategory[] = [
  {
    id: 'length',
    name: 'Length',
    iconName: 'Ruler',
    description: 'Distance and dimensions',
    defaultFrom: 'm',
    defaultTo: 'ft',
    units: [
      { id: 'm', name: 'Meter', symbol: 'm', toBase: 1 },
      { id: 'km', name: 'Kilometer', symbol: 'km', toBase: 1000 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', toBase: 0.01 },
      { id: 'mm', name: 'Millimeter', symbol: 'mm', toBase: 0.001 },
      { id: 'mi', name: 'Mile', symbol: 'mi', toBase: 1609.344 },
      { id: 'yd', name: 'Yard', symbol: 'yd', toBase: 0.9144 },
      { id: 'ft', name: 'Foot', symbol: 'ft', toBase: 0.3048 },
      { id: 'in', name: 'Inch', symbol: 'in', toBase: 0.0254 },
      { id: 'nmi', name: 'Nautical Mile', symbol: 'NM', toBase: 1852 },
      { id: 'ly', name: 'Light Year', symbol: 'ly', toBase: 9.460730472e15 },
    ],
  },
  {
    id: 'weight',
    name: 'Weight / Mass',
    iconName: 'Scale',
    description: 'Mass and weights',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    units: [
      { id: 'kg', name: 'Kilogram', symbol: 'kg', toBase: 1 },
      { id: 'g', name: 'Gram', symbol: 'g', toBase: 0.001 },
      { id: 'mg', name: 'Milligram', symbol: 'mg', toBase: 0.000001 },
      { id: 'lb', name: 'Pound', symbol: 'lb', toBase: 0.45359237 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', toBase: 0.028349523125 },
      { id: 't', name: 'Metric Ton', symbol: 't', toBase: 1000 },
      { id: 'st', name: 'Stone', symbol: 'st', toBase: 6.35029318 },
      { id: 'ct', name: 'Carat', symbol: 'ct', toBase: 0.0002 },
      { id: 'grain', name: 'Grain', symbol: 'gr', toBase: 0.00006479891 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume & Cooking',
    iconName: 'FlaskConical',
    description: 'Liquid and culinary volumes',
    defaultFrom: 'cup',
    defaultTo: 'ml',
    units: [
      { id: 'cup', name: 'US Cup', symbol: 'cup', toBase: 0.2365882365 },
      { id: 'metric_cup', name: 'Metric Cup', symbol: 'm.cup', toBase: 0.25 },
      { id: 'tbsp', name: 'Tablespoon (US)', symbol: 'tbsp', toBase: 0.01478676478125 },
      { id: 'metric_tbsp', name: 'Tablespoon (Metric)', symbol: 'm.tbsp', toBase: 0.015 },
      { id: 'tsp', name: 'Teaspoon (US)', symbol: 'tsp', toBase: 0.00492892159375 },
      { id: 'metric_tsp', name: 'Teaspoon (Metric)', symbol: 'm.tsp', toBase: 0.005 },
      { id: 'floz', name: 'Fluid Ounce (US)', symbol: 'fl oz', toBase: 0.0295735295625 },
      { id: 'imp_floz', name: 'Fluid Ounce (Imperial)', symbol: 'imp fl oz', toBase: 0.0284130625 },
      { id: 'ml', name: 'Milliliter', symbol: 'mL', toBase: 0.001 },
      { id: 'l', name: 'Liter', symbol: 'L', toBase: 1 },
      { id: 'gal', name: 'Gallon (US)', symbol: 'gal', toBase: 3.785411784 },
      { id: 'qt', name: 'Quart (US)', symbol: 'qt', toBase: 0.946352946 },
      { id: 'pt', name: 'Pint (US)', symbol: 'pt', toBase: 0.473176473 },
      { id: 'imp_gal', name: 'Gallon (Imperial)', symbol: 'imp gal', toBase: 4.54609 },
      { id: 'imp_qt', name: 'Quart (Imperial)', symbol: 'imp qt', toBase: 1.1365225 },
      { id: 'imp_pt', name: 'Pint (Imperial)', symbol: 'imp pt', toBase: 0.56826125 },
      { id: 'cum', name: 'Cubic Meter', symbol: 'm³', toBase: 1000 },
      { id: 'cucm', name: 'Cubic Centimeter', symbol: 'cm³', toBase: 0.001 },
      { id: 'cuft', name: 'Cubic Foot', symbol: 'ft³', toBase: 28.316846592 },
      { id: 'cuin', name: 'Cubic Inch', symbol: 'in³', toBase: 0.016387064 },
    ],
  },
  {
    id: 'currency',
    name: 'Currency',
    iconName: 'Coins',
    description: 'World foreign exchange rates',
    defaultFrom: 'USD',
    defaultTo: 'EUR',
    units: [
      { id: 'USD', name: 'US Dollar', symbol: '$', toBase: 1 },
      { id: 'EUR', name: 'Euro', symbol: '€', toBase: 1 / (FALLBACK_RATES_USD['EUR'] || 0.923) },
      { id: 'GBP', name: 'British Pound', symbol: '£', toBase: 1 / (FALLBACK_RATES_USD['GBP'] || 0.789) },
      { id: 'JPY', name: 'Japanese Yen', symbol: '¥', toBase: 1 / (FALLBACK_RATES_USD['JPY'] || 154.6) },
      { id: 'CAD', name: 'Canadian Dollar', symbol: 'C$', toBase: 1 / (FALLBACK_RATES_USD['CAD'] || 1.362) },
      { id: 'AUD', name: 'Australian Dollar', symbol: 'A$', toBase: 1 / (FALLBACK_RATES_USD['AUD'] || 1.524) },
      { id: 'CNY', name: 'Chinese Yuan', symbol: '¥', toBase: 1 / (FALLBACK_RATES_USD['CNY'] || 7.241) },
      { id: 'CHF', name: 'Swiss Franc', symbol: 'Fr', toBase: 1 / (FALLBACK_RATES_USD['CHF'] || 0.908) },
      { id: 'INR', name: 'Indian Rupee', symbol: '₹', toBase: 1 / (FALLBACK_RATES_USD['INR'] || 83.54) },
      { id: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', toBase: 1 / (FALLBACK_RATES_USD['HKD'] || 7.823) },
      { id: 'SGD', name: 'Singapore Dollar', symbol: 'S$', toBase: 1 / (FALLBACK_RATES_USD['SGD'] || 1.351) },
      { id: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', toBase: 1 / (FALLBACK_RATES_USD['NZD'] || 1.662) },
      { id: 'KRW', name: 'South Korean Won', symbol: '₩', toBase: 1 / (FALLBACK_RATES_USD['KRW'] || 1378.5) },
      { id: 'SEK', name: 'Swedish Krona', symbol: 'kr', toBase: 1 / (FALLBACK_RATES_USD['SEK'] || 10.62) },
      { id: 'NOK', name: 'Norwegian Krone', symbol: 'kr', toBase: 1 / (FALLBACK_RATES_USD['NOK'] || 10.78) },
      { id: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', toBase: 1 / (FALLBACK_RATES_USD['MXN'] || 18.25) },
      { id: 'BRL', name: 'Brazilian Real', symbol: 'R$', toBase: 1 / (FALLBACK_RATES_USD['BRL'] || 5.48) },
      { id: 'ZAR', name: 'South African Rand', symbol: 'R', toBase: 1 / (FALLBACK_RATES_USD['ZAR'] || 18.32) },
      { id: 'AED', name: 'UAE Dirham', symbol: 'AED', toBase: 1 / (FALLBACK_RATES_USD['AED'] || 3.673) },
      { id: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', toBase: 1 / (FALLBACK_RATES_USD['SAR'] || 3.751) },
      { id: 'TRY', name: 'Turkish Lira', symbol: '₺', toBase: 1 / (FALLBACK_RATES_USD['TRY'] || 32.65) },
    ],
  },
  {
    id: 'angle',
    name: 'Angle',
    iconName: 'Compass',
    description: 'Rotational and angular measures',
    defaultFrom: 'deg',
    defaultTo: 'rad',
    units: [
      { id: 'deg', name: 'Degree', symbol: '°', toBase: 1 },
      { id: 'rad', name: 'Radian', symbol: 'rad', toBase: 180 / Math.PI },
      { id: 'grad', name: 'Gradian', symbol: 'grad', toBase: 0.9 },
      { id: 'arcmin', name: 'Arcminute', symbol: '′', toBase: 1 / 60 },
      { id: 'arcsec', name: 'Arcsecond', symbol: '″', toBase: 1 / 3600 },
      { id: 'turn', name: 'Revolution / Turn', symbol: 'rev', toBase: 360 },
      { id: 'mrad', name: 'Milliradian', symbol: 'mrad', toBase: 0.0572957795 },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    iconName: 'Flame',
    description: 'Mechanical, thermal, and electrical energy',
    defaultFrom: 'j',
    defaultTo: 'cal',
    units: [
      { id: 'j', name: 'Joule', symbol: 'J', toBase: 1 },
      { id: 'kj', name: 'Kilojoule', symbol: 'kJ', toBase: 1000 },
      { id: 'mj', name: 'Megajoule', symbol: 'MJ', toBase: 1000000 },
      { id: 'cal', name: 'Calorie', symbol: 'cal', toBase: 4.184 },
      { id: 'kcal', name: 'Kilocalorie (Food Calorie)', symbol: 'kcal', toBase: 4184 },
      { id: 'wh', name: 'Watt-hour', symbol: 'Wh', toBase: 3600 },
      { id: 'kwh', name: 'Kilowatt-hour', symbol: 'kWh', toBase: 3600000 },
      { id: 'mwh', name: 'Megawatt-hour', symbol: 'MWh', toBase: 3600000000 },
      { id: 'btu', name: 'British Thermal Unit', symbol: 'BTU', toBase: 1055.06 },
      { id: 'ev', name: 'Electronvolt', symbol: 'eV', toBase: 1.602176634e-19 },
      { id: 'ftlbf', name: 'Foot-pound', symbol: 'ft⋅lbf', toBase: 1.3558179483314 },
    ],
  },
  {
    id: 'force',
    name: 'Force',
    iconName: 'ArrowDownToLine',
    description: 'Physical force and thrust',
    defaultFrom: 'n',
    defaultTo: 'lbf',
    units: [
      { id: 'n', name: 'Newton', symbol: 'N', toBase: 1 },
      { id: 'kn', name: 'Kilonewton', symbol: 'kN', toBase: 1000 },
      { id: 'dyn', name: 'Dyne', symbol: 'dyn', toBase: 0.00001 },
      { id: 'lbf', name: 'Pound-force', symbol: 'lbf', toBase: 4.4482216152605 },
      { id: 'kgf', name: 'Kilogram-force', symbol: 'kgf', toBase: 9.80665 },
      { id: 'ozf', name: 'Ounce-force', symbol: 'ozf', toBase: 0.27801385 },
      { id: 'tf', name: 'Ton-force (metric)', symbol: 'tf', toBase: 9806.65 },
    ],
  },
  {
    id: 'power',
    name: 'Power',
    iconName: 'Zap',
    description: 'Work rate and engine power',
    defaultFrom: 'w',
    defaultTo: 'hp',
    units: [
      { id: 'w', name: 'Watt', symbol: 'W', toBase: 1 },
      { id: 'kw', name: 'Kilowatt', symbol: 'kW', toBase: 1000 },
      { id: 'mw', name: 'Megawatt', symbol: 'MW', toBase: 1000000 },
      { id: 'gw', name: 'Gigawatt', symbol: 'GW', toBase: 1000000000 },
      { id: 'hp_m', name: 'Horsepower (Metric PS)', symbol: 'hp(M)', toBase: 735.49875 },
      { id: 'hp', name: 'Horsepower (Mechanical)', symbol: 'hp', toBase: 745.69987158227 },
      { id: 'btuh', name: 'BTU per hour', symbol: 'BTU/h', toBase: 0.29307107 },
      { id: 'ftlbmin', name: 'Foot-pounds / min', symbol: 'ft⋅lb/min', toBase: 0.0225969658 },
      { id: 'cals', name: 'Calories / sec', symbol: 'cal/s', toBase: 4.184 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    iconName: 'Thermometer',
    description: 'Thermal degrees',
    defaultFrom: 'c',
    defaultTo: 'f',
    units: [
      {
        id: 'c',
        name: 'Celsius',
        symbol: '°C',
        customToBase: (v) => v,
        customFromBase: (v) => v,
      },
      {
        id: 'f',
        name: 'Fahrenheit',
        symbol: '°F',
        customToBase: (v) => ((v - 32) * 5) / 9,
        customFromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        id: 'k',
        name: 'Kelvin',
        symbol: 'K',
        customToBase: (v) => v - 273.15,
        customFromBase: (v) => v + 273.15,
      },
      {
        id: 'r',
        name: 'Rankine',
        symbol: '°R',
        customToBase: (v) => ((v - 491.67) * 5) / 9,
        customFromBase: (v) => (v * 9) / 5 + 491.67,
      },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    iconName: 'SquareDashed',
    description: 'Surface measurements',
    defaultFrom: 'sqm',
    defaultTo: 'sqft',
    units: [
      { id: 'sqm', name: 'Square Meter', symbol: 'm²', toBase: 1 },
      { id: 'sqkm', name: 'Square Kilometer', symbol: 'km²', toBase: 1000000 },
      { id: 'sqft', name: 'Square Foot', symbol: 'ft²', toBase: 0.09290304 },
      { id: 'sqyd', name: 'Square Yard', symbol: 'yd²', toBase: 0.83612736 },
      { id: 'ac', name: 'Acre', symbol: 'ac', toBase: 4046.8564224 },
      { id: 'ha', name: 'Hectare', symbol: 'ha', toBase: 10000 },
      { id: 'sqmi', name: 'Square Mile', symbol: 'mi²', toBase: 2589988.110336 },
      { id: 'sqcm', name: 'Square Centimeter', symbol: 'cm²', toBase: 0.0001 },
      { id: 'sqin', name: 'Square Inch', symbol: 'in²', toBase: 0.00064516 },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    iconName: 'Gauge',
    description: 'Velocity and motion',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    units: [
      { id: 'ms', name: 'Meters / second', symbol: 'm/s', toBase: 1 },
      { id: 'kmh', name: 'Kilometers / hour', symbol: 'km/h', toBase: 1 / 3.6 },
      { id: 'mph', name: 'Miles / hour', symbol: 'mph', toBase: 0.44704 },
      { id: 'kn', name: 'Knot', symbol: 'kn', toBase: 0.514444 },
      { id: 'fts', name: 'Feet / second', symbol: 'ft/s', toBase: 0.3048 },
      { id: 'mach', name: 'Mach (Standard)', symbol: 'M', toBase: 340.29 },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    iconName: 'Clock',
    description: 'Duration and intervals',
    defaultFrom: 'min',
    defaultTo: 'h',
    units: [
      { id: 'ms', name: 'Millisecond', symbol: 'ms', toBase: 0.001 },
      { id: 's', name: 'Second', symbol: 's', toBase: 1 },
      { id: 'min', name: 'Minute', symbol: 'min', toBase: 60 },
      { id: 'h', name: 'Hour', symbol: 'h', toBase: 3600 },
      { id: 'd', name: 'Day', symbol: 'd', toBase: 86400 },
      { id: 'wk', name: 'Week', symbol: 'wk', toBase: 604800 },
      { id: 'mo', name: 'Month (30.44d)', symbol: 'mo', toBase: 2629800 },
      { id: 'yr', name: 'Year (365.25d)', symbol: 'yr', toBase: 31557600 },
    ],
  },
  {
    id: 'data',
    name: 'Digital Data',
    iconName: 'HardDrive',
    description: 'Bits, bytes, and storage',
    defaultFrom: 'mb',
    defaultTo: 'gb',
    units: [
      { id: 'bit', name: 'Bit', symbol: 'b', toBase: 1 / 8 },
      { id: 'b', name: 'Byte', symbol: 'B', toBase: 1 },
      { id: 'kb', name: 'Kilobyte', symbol: 'KB', toBase: 1024 },
      { id: 'mb', name: 'Megabyte', symbol: 'MB', toBase: 1048576 },
      { id: 'gb', name: 'Gigabyte', symbol: 'GB', toBase: 1073741824 },
      { id: 'tb', name: 'Terabyte', symbol: 'TB', toBase: 1099511627776 },
      { id: 'pb', name: 'Petabyte', symbol: 'PB', toBase: 1125899906842624 },
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    iconName: 'Activity',
    description: 'Atmospheric and fluid pressure',
    defaultFrom: 'bar',
    defaultTo: 'psi',
    units: [
      { id: 'pa', name: 'Pascal', symbol: 'Pa', toBase: 1 },
      { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', toBase: 1000 },
      { id: 'bar', name: 'Bar', symbol: 'bar', toBase: 100000 },
      { id: 'psi', name: 'PSI', symbol: 'psi', toBase: 6894.75729 },
      { id: 'atm', name: 'Atmosphere', symbol: 'atm', toBase: 101325 },
      { id: 'torr', name: 'Torr (mmHg)', symbol: 'Torr', toBase: 133.322 },
    ],
  },
];

export function convertValue(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: ConversionCategory,
  customRates?: Record<string, number>
): number {
  if (isNaN(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  // Currency with live rates (rates are relative to USD = 1)
  if (category.id === 'currency' && customRates) {
    const fromRate = customRates[fromUnitId] || 1;
    const toRate = customRates[toUnitId] || 1;
    // 1 USD = fromRate [fromUnit] => 1 [fromUnit] = (1 / fromRate) USD
    // value in [fromUnit] to USD = value / fromRate
    // USD to [toUnit] = (value / fromRate) * toRate
    return (value / fromRate) * toRate;
  }

  const fromUnit = category.units.find((u) => u.id === fromUnitId);
  const toUnit = category.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return value;

  // Custom conversion (e.g. Temperature)
  if (fromUnit.customToBase && toUnit.customFromBase) {
    const baseVal = fromUnit.customToBase(value);
    return toUnit.customFromBase(baseVal);
  }

  // Linear conversion
  const fromFactor = fromUnit.toBase || 1;
  const toFactor = toUnit.toBase || 1;

  const baseVal = value * fromFactor;
  return baseVal / toFactor;
}

export function formatConvertedValue(val: number): string {
  if (!isFinite(val)) return 'Error';
  if (val === 0) return '0';

  const absVal = Math.abs(val);

  // For very small or very large values, use scientific notation
  if (absVal < 0.000001 || absVal >= 10000000000) {
    return val.toExponential(4);
  }

  // Precision formatting up to 6 decimal places, trimming trailing zeros
  const rounded = Number(val.toFixed(6));
  return rounded.toLocaleString('en-US', {
    maximumFractionDigits: 6,
    useGrouping: false,
  });
}

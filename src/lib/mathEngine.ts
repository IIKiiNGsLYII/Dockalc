import type { AngleUnit, BitWidth, NotationMode, NumberBase } from '@/types/calculator';

// Factorial calculation
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (!Number.isInteger(n)) {
    // Lanczos approximation for Gamma(n+1)
    return gamma(n + 1);
  }
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Lanczos approximation for Gamma
function gamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109583115912,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }

  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Convert angle to radians for Math.* functions
export function toRadians(val: number, unit: AngleUnit): number {
  switch (unit) {
    case 'DEG':
      return (val * Math.PI) / 180;
    case 'GRAD':
      return (val * Math.PI) / 200;
    case 'RAD':
    default:
      return val;
  }
}

// Convert radians back to target angle unit
export function fromRadians(val: number, unit: AngleUnit): number {
  switch (unit) {
    case 'DEG':
      return (val * 180) / Math.PI;
    case 'GRAD':
      return (val * 200) / Math.PI;
    case 'RAD':
    default:
      return val;
  }
}

// Clean floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004 -> 0.3)
export function sanitizeNumber(num: number): number {
  if (Number.isNaN(num) || !Number.isFinite(num)) return num;
  return parseFloat(num.toPrecision(14));
}

// Format number according to settings
export function formatDisplayNumber(
  val: string | number,
  options: {
    thousandsSeparator?: boolean;
    decimalPlaces?: number;
    notation?: NotationMode;
  } = {}
): string {
  const { thousandsSeparator = true, decimalPlaces = -1, notation = 'normal' } = options;

  if (typeof val === 'string') {
    if (val === 'Error' || val === 'Cannot divide by zero' || val === 'Overflow' || val === 'Invalid Input') {
      return val;
    }
    // Handle partial decimal input like "12." or "-0."
    if (val.endsWith('.')) {
      const numPart = formatDisplayNumber(val.slice(0, -1), options);
      return `${numPart}.`;
    }
    if (val.includes('.') && val.endsWith('0')) {
      const [intPart, decPart] = val.split('.');
      const formattedInt = formatDisplayNumber(intPart, { thousandsSeparator, notation: 'normal' });
      return `${formattedInt}.${decPart}`;
    }
  }

  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return typeof val === 'string' ? val : 'NaN';
  if (!Number.isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Scientific or engineering notation
  if (notation === 'scientific') {
    return num.toExponential(decimalPlaces >= 0 ? decimalPlaces : 6);
  }

  if (notation === 'engineering') {
    if (num === 0) return '0';
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = num / Math.pow(10, engExp);
    const roundedMantissa = decimalPlaces >= 0 ? mantissa.toFixed(decimalPlaces) : parseFloat(mantissa.toPrecision(7));
    return `${roundedMantissa}e${engExp >= 0 ? `+${engExp}` : engExp}`;
  }

  // Normal notation
  let numStr: string;
  if (decimalPlaces >= 0) {
    numStr = num.toFixed(decimalPlaces);
  } else {
    // Auto precision
    numStr = sanitizeNumber(num).toString();
  }

  if (thousandsSeparator) {
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  return numStr;
}

// Programmer Mode Helpers using BigInt
export function getBitMask(width: BitWidth): bigint {
  switch (width) {
    case 8:
      return 0xffn;
    case 16:
      return 0xffffn;
    case 32:
      return 0xffffffffn;
    case 64:
    default:
      return 0xffffffffffffffffn;
  }
}

export function clampBigInt(val: bigint, width: BitWidth, signed: boolean = false): bigint {
  const mask = getBitMask(width);
  const unsigned = val & mask;

  if (signed) {
    const signBit = 1n << BigInt(width - 1);
    if ((unsigned & signBit) !== 0n) {
      return unsigned - (1n << BigInt(width));
    }
  }
  return unsigned;
}

export function parseBaseString(str: string, base: NumberBase): bigint {
  const cleanStr = str.replace(/[\s,_]/g, '');
  if (!cleanStr || cleanStr === '-') return 0n;

  try {
    let radix = 10;
    if (base === 'HEX') radix = 16;
    else if (base === 'OCT') radix = 8;
    else if (base === 'BIN') radix = 2;

    const isNegative = cleanStr.startsWith('-');
    const digits = isNegative ? cleanStr.slice(1) : cleanStr;

    if (!digits) return 0n;

    // Direct BigInt parser with radix prefix
    let prefix = '';
    if (radix === 16) prefix = '0x';
    else if (radix === 8) prefix = '0o';
    else if (radix === 2) prefix = '0b';

    const parsed = BigInt(prefix + digits);
    return isNegative ? -parsed : parsed;
  } catch {
    return 0n;
  }
}

export function formatBaseBigInt(val: bigint, base: NumberBase, width: BitWidth): string {
  const mask = getBitMask(width);
  const unsigned = val & mask;

  switch (base) {
    case 'HEX':
      return unsigned.toString(16).toUpperCase();
    case 'OCT':
      return unsigned.toString(8);
    case 'BIN':
      return unsigned.toString(2);
    case 'DEC':
    default:
      return unsigned.toString(10);
  }
}

// Format binary string with grouped nibbles (4-bit spaces)
export function formatBinaryWithSpaces(binStr: string, width: BitWidth): string {
  const padded = binStr.padStart(width, '0');
  const chunks: string[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    chunks.push(padded.slice(i, i + 4));
  }
  return chunks.join(' ');
}

// Toggle a single bit in BigInt
export function toggleBit(val: bigint, bitIndex: number, width: BitWidth): bigint {
  if (bitIndex < 0 || bitIndex >= width) return val;
  const bit = 1n << BigInt(bitIndex);
  const result = val ^ bit;
  return clampBigInt(result, width);
}

// Bit shifts
export function bitShift(
  val: bigint,
  type: 'Lsh' | 'Rsh' | 'RoL' | 'RoR' | 'Ash',
  amount: bigint = 1n,
  width: BitWidth
): bigint {
  const mask = getBitMask(width);
  const unsigned = val & mask;
  const shift = amount % BigInt(width);

  switch (type) {
    case 'Lsh':
      return (unsigned << shift) & mask;
    case 'Rsh':
      return unsigned >> shift;
    case 'RoL':
      return ((unsigned << shift) | (unsigned >> (BigInt(width) - shift))) & mask;
    case 'RoR':
      return ((unsigned >> shift) | (unsigned << (BigInt(width) - shift))) & mask;
    case 'Ash': {
      const signedVal = clampBigInt(unsigned, width, true);
      return (signedVal >> shift) & mask;
    }
    default:
      return unsigned;
  }
}

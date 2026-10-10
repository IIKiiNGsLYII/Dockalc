/**
 * Exact Mathematics Utilities for Dockalc
 * Provides exact fraction simplification and radical representation detection.
 */

export interface ExactFractionResult {
  fraction: string; // e.g. "3/4" or "2 1/2" or "-5/8"
  vulgar: string;   // e.g. "3/4" or "5/2"
  decimal: number;
  isExact: boolean;
}

export interface ExactRadicalResult {
  radical: string;  // e.g. "2√2" or "√3" or "3√5"
  decimal: number;
  exactSquare: number;
}

/**
 * Converts a decimal number to an exact simplified vulgar fraction.
 * e.g., 0.75 -> "3/4", 0.333333333333 -> "1/3", 2.5 -> "5/2"
 */
export function toExactFraction(val: number, maxDenominator = 10000, tolerance = 1e-7): ExactFractionResult | null {
  if (!isFinite(val) || isNaN(val)) return null;

  // Don't format whole numbers as fractions
  if (Math.abs(val - Math.round(val)) < tolerance) {
    return null;
  }

  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);

  // Continued fractions algorithm
  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = absVal;

  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;

    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;

    const denom = b - a;
    if (Math.abs(denom) < tolerance) break;
    b = 1 / denom;
  } while (Math.abs(absVal - h1 / k1) > tolerance && k1 < maxDenominator);

  // Check if approximation is close enough
  if (k1 <= 1 || k1 > maxDenominator) return null;
  const approx = h1 / k1;
  if (Math.abs(absVal - approx) > tolerance * 5) return null;

  const num = sign * h1;
  const den = k1;

  const vulgar = `${num}/${den}`;
  let fraction = vulgar;

  // If improper, also offer mixed format e.g. 5/2 -> "2 ½" or "2 1/2"
  if (Math.abs(num) > den) {
    const whole = Math.trunc(num / den);
    const remainder = Math.abs(num % den);
    fraction = `${whole} ${remainder}/${den}`;
  }

  return {
    fraction,
    vulgar,
    decimal: val,
    isExact: Math.abs(absVal - approx) < 1e-9,
  };
}

/**
 * Detects if a decimal number corresponds to a simplified square root (radical).
 * e.g., 1.41421356... -> "√2", 2.82842712... -> "2√2", 1.7320508... -> "√3"
 */
export function toExactRadical(val: number, tolerance = 1e-5): ExactRadicalResult | null {
  if (!isFinite(val) || isNaN(val)) return null;

  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);

  // Integer results don't need radical notation
  if (Math.abs(absVal - Math.round(absVal)) < 1e-6) {
    return null;
  }

  // Case 1: Direct square N where val ≈ √N
  const sq = absVal * absVal;
  const roundedSq = Math.round(sq);

  if (roundedSq > 1 && roundedSq <= 10000 && Math.abs(sq - roundedSq) < tolerance) {
    // Check if roundedSq is not already a perfect square
    const sqrtInt = Math.round(Math.sqrt(roundedSq));
    if (sqrtInt * sqrtInt !== roundedSq) {
      // Simplify √N: find largest square factor k^2 of roundedSq
      let k = 1;
      let r = roundedSq;
      for (let i = Math.floor(Math.sqrt(roundedSq)); i >= 2; i--) {
        if (roundedSq % (i * i) === 0) {
          k = i;
          r = roundedSq / (i * i);
          break;
        }
      }

      let radicalStr = '';
      if (k === 1) {
        radicalStr = `√${r}`;
      } else {
        radicalStr = `${k}√${r}`;
      }

      if (sign < 0) {
        radicalStr = `-${radicalStr}`;
      }

      return {
        radical: radicalStr,
        decimal: val,
        exactSquare: roundedSq,
      };
    }
  }

  // Case 2: Rational multiple of root, e.g. √2 / 2 ≈ 0.70710678... (sq = 0.5 = 2/4)
  const sq4 = sq * 4;
  const roundedSq4 = Math.round(sq4);
  if (roundedSq4 > 0 && Math.abs(sq4 - roundedSq4) < tolerance) {
    if (roundedSq4 === 2) {
      return {
        radical: sign < 0 ? '-√2/2' : '√2/2',
        decimal: val,
        exactSquare: 0.5,
      };
    }
    if (roundedSq4 === 3) {
      return {
        radical: sign < 0 ? '-√3/2' : '√3/2',
        decimal: val,
        exactSquare: 0.75,
      };
    }
  }

  return null;
}

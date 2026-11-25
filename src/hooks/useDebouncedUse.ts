import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a trigger that fires `onUse` once the user pauses for `delayMs`.
 * Used to count a finished conversion or finance calculation as one "use"
 * instead of counting every keystroke. A pending use is still counted if the
 * view closes before the pause ends.
 */
export function useDebouncedUse(onUse: () => void, delayMs = 1500): () => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(onUse);
  latest.current = onUse;

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
        latest.current();
      }
    },
    []
  );

  return useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      latest.current();
    }, delayMs);
  }, [delayMs]);
}

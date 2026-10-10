import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'dockalc_static_window_pos';

export function useDraggableWindow() {
  const windowRef = useRef<HTMLDivElement | null>(null);

  // Position coordinates in pixels relative to viewport
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return { x: parsed.x, y: parsed.y };
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isRepositioning, setIsRepositioning] = useState(false);

  // Reposition start tracking refs
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    hasStartedDrag: boolean;
  }>({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, hasStartedDrag: false });

  // Center window in viewport and persist
  const centerWindow = useCallback(() => {
    if (!windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const pad = 16;
    const newPos = {
      x: Math.max(pad, Math.round((vpW - rect.width) / 2)),
      y: Math.max(pad, Math.round((vpH - rect.height) / 2)),
    };
    setPosition(newPos);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPos));
    } catch {
      // ignore
    }
  }, []);

  // Initial centering on mount if no saved position exists
  useEffect(() => {
    if (!position) {
      const timer = setTimeout(() => {
        centerWindow();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [centerWindow, position]);

  // Keep static window clamped within viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!windowRef.current || !position) return;
      const rect = windowRef.current.getBoundingClientRect();
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const pad = 8;

      const maxX = Math.max(pad, vpW - rect.width - pad);
      const maxY = Math.max(pad, vpH - rect.height - pad);

      setPosition((prev) => {
        if (!prev) return null;
        const clamped = {
          x: Math.min(Math.max(pad, prev.x), maxX),
          y: Math.min(Math.max(pad, prev.y), maxY),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
        } catch {
          // ignore
        }
        return clamped;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Also re-clamp when the window element itself changes size (e.g. History panel toggle)
  useEffect(() => {
    if (!windowRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;

        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        const pad = 8;

        const maxX = Math.max(pad, vpW - width - pad);
        const maxY = Math.max(pad, vpH - height - pad);

        setPosition((prev) => {
          if (!prev) return null;
          if (prev.x > maxX || prev.y > maxY) {
            const clamped = {
              x: Math.min(Math.max(pad, prev.x), maxX),
              y: Math.min(Math.max(pad, prev.y), maxY),
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
            } catch {
              // ignore
            }
            return clamped;
          }
          return prev;
        });
      }
    });

    resizeObserver.observe(windowRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Reposition pointer start handler attached to header
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary mouse button
    if (e.button !== 0) return;

    // Don't reposition if target is a button, input, anchor or inside one
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.closest('button') ||
        target.closest('input') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.no-drag'))
    ) {
      return;
    }

    if (!windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();

    const curX = position ? position.x : rect.left;
    const curY = position ? position.y : rect.top;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: curX,
      initialPosY: curY,
      hasStartedDrag: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!windowRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    // Movement threshold before repositioning kicks in
    if (!dragStartRef.current.hasStartedDrag) {
      if (Math.hypot(deltaX, deltaY) < 5) return;
      dragStartRef.current.hasStartedDrag = true;
      setIsRepositioning(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    if (!isRepositioning && !dragStartRef.current.hasStartedDrag) return;

    const rect = windowRef.current.getBoundingClientRect();
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const pad = 8;

    const rawX = dragStartRef.current.initialPosX + deltaX;
    const rawY = dragStartRef.current.initialPosY + deltaY;

    // Clamp coordinates within visible viewport
    const clampedX = Math.min(Math.max(pad, rawX), vpW - rect.width - pad);
    const clampedY = Math.min(Math.max(pad, rawY), vpH - rect.height - pad);

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const wasRepositioning = isRepositioning || dragStartRef.current.hasStartedDrag;
    dragStartRef.current.hasStartedDrag = false;
    setIsRepositioning(false);

    if (wasRepositioning) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      // Persist the user's chosen static position
      if (position) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
        } catch {
          // ignore
        }
      }
    }
  };

  return {
    windowRef,
    position,
    isRepositioning,
    centerWindow,
    dragProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}

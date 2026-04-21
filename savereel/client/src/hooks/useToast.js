import { useState, useCallback, useRef } from 'react';

const DEFAULT_DURATION_MS = 4200;

/**
 * Manages a single toast notification with auto-dismiss.
 *
 * @returns {{ toast, showToast, hideToast }}
 */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    setToast(null);
    clearTimeout(timerRef.current);
  }, []);

  const showToast = useCallback((message, type = 'info', duration = DEFAULT_DURATION_MS) => {
    clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(hideToast, duration);
  }, [hideToast]);

  return { toast, showToast, hideToast };
}

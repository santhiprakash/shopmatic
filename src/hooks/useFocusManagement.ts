import { useEffect, useRef } from "react";

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  );
}

export function useFocusOnMount<T extends HTMLElement = HTMLDivElement>(
  onMountFocus?: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const focusable = ref.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable || ref.current)?.focus();
      onMountFocus?.();
    }
  }, [onMountFocus]);

  return ref;
}

export function useReturnFocus<T extends HTMLElement = HTMLButtonElement>(
  triggerRef: React.RefObject<T>
) {
  const returnRef = useRef<T | null>(null);

  useEffect(() => {
    returnRef.current = document.activeElement as T;
    
    return () => {
      if (returnRef.current && typeof returnRef.current.focus === 'function') {
        returnRef.current.focus();
      }
    };
  }, []);

  return triggerRef;
}

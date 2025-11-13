/**
 * Accessibility utilities for keyboard navigation, focus management, and ARIA attributes
 */

/**
 * Trap focus within a container element
 */
export function trapFocus(element: HTMLElement | null) {
  if (!element) return () => {};

  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

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

  element.addEventListener("keydown", handleTab);
  firstElement?.focus();

  return () => {
    element.removeEventListener("keydown", handleTab);
  };
}

/**
 * Get accessible label for a button or interactive element
 */
export function getAccessibleLabel(
  label: string,
  action?: string,
  context?: string
): string {
  if (context) {
    return `${label}${action ? ` ${action}` : ""}${context ? ` for ${context}` : ""}`;
  }
  return label;
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite") {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.getAttribute("aria-hidden") !== "true"
  );
}

/**
 * Get focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => isVisibleToScreenReader(el)
  );
}

/**
 * Restore focus to previously focused element
 */
export function restoreFocus(previousElement: HTMLElement | null) {
  if (previousElement && document.contains(previousElement)) {
    previousElement.focus();
  }
}

/**
 * Skip to main content link (for screen readers)
 */
export function createSkipLink() {
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.className = "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gsv-green focus:text-white focus:rounded-lg";
  skipLink.textContent = "Skip to main content";
  skipLink.setAttribute("aria-label", "Skip to main content");
  
  return skipLink;
}


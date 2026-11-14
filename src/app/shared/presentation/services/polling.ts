import {DestroyRef, inject} from '@angular/core';

/**
 * Runs an action every few seconds while the component lives and the tab is visible. It is how the trip detail
 * and the proposal chat stay up to date without websockets.
 */
export const startPolling = (action: () => void, intervalMs: number): void => {
  const handle = setInterval(() => {
    if (document.visibilityState === 'visible') action();
  }, intervalMs);
  inject(DestroyRef).onDestroy(() => clearInterval(handle));
};

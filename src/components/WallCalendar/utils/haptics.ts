/**
 * Haptic feedback utility interacting securely with navigator.vibrate
 */

export const HAP_TAP_CELL = 10;
export const HAP_NAVIGATE = 8;
export const HAP_CHECK_NOTE = 15;
export const HAP_RANGE_COMPLETE = [20, 10, 20];

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors gracefully
    }
  }
}

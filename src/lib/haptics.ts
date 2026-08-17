export function haptic(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

export function hapticSuccess() {
  try {
    navigator.vibrate?.([12, 40, 18]);
  } catch {
    /* ignore */
  }
}

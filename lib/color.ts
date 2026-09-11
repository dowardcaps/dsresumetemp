/**
 * Small color helpers used to derive a template's "soft" background tint
 * from a single user-picked accent color, so a custom theme color only
 * needs one input (the color picker) rather than two.
 */

function normalizeHex(hex: string): string | null {
  const clean = hex.trim().replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return full;
}

export function isValidHex(hex: string): boolean {
  return normalizeHex(hex) !== null;
}

/** Mixes a hex color toward white by `amount` (0-1) to produce a soft tint
 *  suitable for a template's `accentSoft` background. */
export function tintHex(hex: string, amount = 0.85): string {
  const full = normalizeHex(hex);
  if (!full) return "#EFEFEF";
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`.toUpperCase();
}

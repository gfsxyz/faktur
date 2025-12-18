import { createAvatar } from "@dicebear/core";
import * as glass from "@dicebear/glass";

/**
 * Generate a unique DiceBear Glass avatar for a client
 * @param seed - Unique identifier (clientId) to generate consistent avatars
 * @param size - Avatar size in pixels (default: 40)
 * @returns Data URI string for the generated avatar
 */

export function getClientAvatar(seed: string, size: number = 40): string {
  const avatar = createAvatar(glass, {
    seed,
    size,
    scale: 70,
    backgroundColor: GLASS_COLORS,
  });
  return avatar.toDataUri();
}

export const GLASS_COLORS = [
  "00C97F",
  "00B86B",
  "14D18F",
  "2EE6A0",
  "3AF2B0",
  "00E39A",
  "1FB6FF",
  "0EA5E9",
  "38CFFF",
  "4FDFFF",
  "00C2FF",
  "33BFFF",
  "FFB020",
  "F59E0B",
  "FFC04D",
  "FFAA00",
  "FFD166",
  "FF9F1C",
  "A855F7",
  "9333EA",
  "C084FC",
  "B16BFF",
  "8B5CF6",
  "7C3AED",
  "F43F5E",
  "FB7185",
  "FF5D8F",
  "E11D48",
  "FF6B6B",
  "FF4D4D",
  "22D3EE",
  "06B6D4",
  "67E8F9",
  "2DD4BF",
  "14B8A6",
  "5EEAD4",
];

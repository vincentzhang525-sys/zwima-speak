import type { BilingualLine } from "../types";

export function bil(native: string, target: string): BilingualLine {
  return { native, target };
}

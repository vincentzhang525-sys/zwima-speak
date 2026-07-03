/**
 * ZWIMA Speak — language transition loop.
 * Anna fades native support as demonstrated understanding grows.
 * Patterns repeat in real life — grammar is never taught first.
 */
export const TRANSITION_LOOP = [
  { id: "live", label: "Live the moment", description: "Step into a real situation in Germany." },
  { id: "hear", label: "Hear locals", description: "Listen to what people actually say." },
  { id: "speak", label: "Speak it", description: "Say it in the moment — like you live there." },
  { id: "shift", label: "Think shifts", description: "Anna uses less native support as you show you get it." },
  { id: "repeat", label: "Same pattern, new life", description: "The pattern appears again in another real situation." },
] as const;

import { getContentPack } from "./content";

export const PRODUCT_PROMISE = {
  de: getContentPack("german").ui.productPromise,
  en: getContentPack("english").ui.productPromise,
} as const;

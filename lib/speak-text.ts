/**
 * Browser-native speech — must run synchronously inside a user tap on iOS Safari / PWA.
 */
import type { ConversationMoment, Language } from "./types";

export type SpeechLang = "de-DE" | "en-GB" | "en-US" | (string & {});

export type SpeakOutcome = "started" | "unsupported";

export function languageToSpeechLang(language: Language): SpeechLang {
  return language === "german" ? "de-DE" : "en-US";
}

/** Target-language lines for the Listen button — never Chinese coach text. */
export function getListenSpeechParts(
  language: Language,
  moment: ConversationMoment
): { text: string; lang: SpeechLang }[] {
  const lang = languageToSpeechLang(language);
  const parts: { text: string; lang: SpeechLang }[] = [];
  if (moment.npcLine?.trim()) {
    parts.push({ text: moment.npcLine.trim(), lang });
  }
  if (moment.phrase?.trim()) {
    parts.push({ text: moment.phrase.trim(), lang });
  }
  return parts;
}

let voicesHooked = false;

function primeVoices(synth: SpeechSynthesis): SpeechSynthesisVoice[] {
  const voices = synth.getVoices();
  if (!voicesHooked) {
    voicesHooked = true;
    synth.addEventListener("voiceschanged", () => synth.getVoices(), { once: true });
  }
  return voices;
}

function pickVoice(lang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;
  const base = lang.split("-")[0];
  if (base === "en") {
    return (
      voices.find((v) => v.lang === "en-GB") ??
      voices.find((v) => v.lang === "en-US") ??
      voices.find((v) => v.lang.startsWith("en")) ??
      null
    );
  }
  return voices.find((v) => v.lang.startsWith(base)) ?? null;
}

function iosResume(synth: SpeechSynthesis): void {
  if (synth.paused) synth.resume();
  window.setTimeout(() => {
    if (synth.paused) synth.resume();
  }, 100);
}

function utter(
  synth: SpeechSynthesis,
  text: string,
  lang: string,
  onEnd?: () => void,
  onBlocked?: () => void
): void {
  const trimmed = text.trim();
  if (!trimmed) {
    onEnd?.();
    return;
  }

  const u = new SpeechSynthesisUtterance(trimmed);
  u.lang = lang;
  const voice = pickVoice(lang, synth.getVoices());
  if (voice) u.voice = voice;

  let started = false;
  u.onstart = () => {
    started = true;
  };
  u.onend = () => onEnd?.();
  u.onerror = (e) => {
    if (e.error === "not-allowed" || (!started && e.error !== "canceled")) {
      onBlocked?.();
    }
    onEnd?.();
  };

  synth.speak(u);
  iosResume(synth);
}

/**
 * Speak one sentence. Call directly from a tap handler — no await before this.
 */
export function speakText(
  text: string,
  lang: SpeechLang,
  onBlocked?: () => void
): SpeakOutcome {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onBlocked?.();
    return "unsupported";
  }

  const synth = window.speechSynthesis;
  synth.cancel();
  primeVoices(synth);

  const run = () => utter(synth, text, lang, undefined, onBlocked);

  const voices = synth.getVoices();
  if (voices.length === 0) {
    let retried = false;
    const onVoices = () => {
      synth.removeEventListener("voiceschanged", onVoices);
      if (retried) return;
      retried = true;
      synth.cancel();
      run();
    };
    synth.addEventListener("voiceschanged", onVoices);
    run();
    return "started";
  }

  run();
  return "started";
}

/** Speak multiple target-language lines in order (e.g. NPC line, then learner phrase). */
export function speakTextSequence(
  parts: { text: string; lang: SpeechLang }[],
  onBlocked?: () => void
): SpeakOutcome {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onBlocked?.();
    return "unsupported";
  }

  const queue = parts.filter((p) => p.text.trim());
  if (queue.length === 0) return "started";

  const synth = window.speechSynthesis;
  synth.cancel();
  primeVoices(synth);

  let index = 0;
  let retried = false;

  const speakNext = () => {
    if (index >= queue.length) return;
    const { text, lang } = queue[index];
    index += 1;
    utter(synth, text, lang, speakNext, onBlocked);
  };

  const start = () => {
    index = 0;
    synth.cancel();
    speakNext();
  };

  const voices = synth.getVoices();
  if (voices.length === 0) {
    const onVoices = () => {
      synth.removeEventListener("voiceschanged", onVoices);
      if (retried) return;
      retried = true;
      start();
    };
    synth.addEventListener("voiceschanged", onVoices);
    speakNext();
    return "started";
  }

  speakNext();
  return "started";
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

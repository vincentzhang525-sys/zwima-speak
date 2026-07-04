/**
 * Sprint 14 — Ambient sound immersion (Web Audio, no assets required)
 */
type AmbienceProfile = {
  baseHz: number;
  pulseMs: number;
  beep?: boolean;
};

const PROFILES: Record<string, AmbienceProfile> = {
  airport: { baseHz: 180, pulseMs: 4200, beep: true },
  arrive: { baseHz: 120, pulseMs: 6000 },
  coffee: { baseHz: 220, pulseMs: 2800, beep: true },
  supermarket: { baseHz: 140, pulseMs: 3500, beep: true },
  bus: { baseHz: 90, pulseMs: 5000 },
  train: { baseHz: 100, pulseMs: 4500, beep: true },
  bank: { baseHz: 160, pulseMs: 5500 },
  doctor: { baseHz: 130, pulseMs: 6000 },
  buergeramt: { baseHz: 150, pulseMs: 5000 },
  work: { baseHz: 170, pulseMs: 4800 },
  apartment: { baseHz: 110, pulseMs: 7000 },
};

function milestoneToProfile(milestoneId: string): AmbienceProfile {
  return PROFILES[milestoneId] ?? { baseHz: 130, pulseMs: 5000 };
}

export function startMilestoneAmbience(milestoneId: string): () => void {
  if (typeof window === "undefined") return () => {};

  let stopped = false;
  let ctx: AudioContext | null = null;
  let nodes: AudioNode[] = [];

  const start = () => {
    if (stopped) return;
    try {
      ctx = new AudioContext();
      const profile = milestoneToProfile(milestoneId);
      const gain = ctx.createGain();
      gain.gain.value = 0.04;
      gain.connect(ctx.destination);
      nodes.push(gain);

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = profile.baseHz;
      osc.connect(gain);
      osc.start();
      nodes.push(osc);

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      nodes.push(lfo, lfoGain);

      if (profile.beep) {
        const beep = () => {
          if (stopped || !ctx) return;
          const b = ctx.createOscillator();
          const g = ctx.createGain();
          b.frequency.value = profile.baseHz * 3;
          g.gain.value = 0.02;
          b.connect(g);
          g.connect(ctx.destination);
          b.start();
          b.stop(ctx.currentTime + 0.08);
          setTimeout(beep, profile.pulseMs);
        };
        setTimeout(beep, profile.pulseMs);
      }
    } catch {
      // Audio blocked until user gesture — silent fallback
    }
  };

  start();

  return () => {
    stopped = true;
    nodes.forEach((n) => {
      try {
        if ("stop" in n && typeof n.stop === "function") (n as OscillatorNode).stop();
        n.disconnect();
      } catch {
        /* ignore */
      }
    });
    nodes = [];
    void ctx?.close();
    ctx = null;
  };
}

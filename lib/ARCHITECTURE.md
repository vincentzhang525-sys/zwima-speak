# ZWIMA Speak — Sprint 1 Architecture (frozen)

## Product

**Language transition**, not language learning. Anna is a companion walking beside the learner through real life in Germany (or parallel English-speaking life abroad).

## Frozen layers

| Layer | Role | Sprint 1 status |
|-------|------|-----------------|
| UI shell | Phone shell, tabs, coach chat | **Frozen** — no redesign |
| Transition engine | `lib/transition.ts` | Adaptive 中文 → DE/EN fade |
| Journey roadmap | `lib/journey.ts` | 11 milestones defined |
| Playable experiences | `lib/milestones/*` | **3 playable:** arrive, coffee, supermarket |
| Coach loop | `CoachSessionScreen` | hear → speak → Anna coaches → continue |

## Coach loop (no lessons)

1. Anna sets scene (bilingual, blended by understanding)
2. Optional: hear NPC line
3. Learner speaks (full sentence in context)
4. Anna encourages + 2–3 pattern examples (target language only)
5. Scene continues into next beat

No grammar chapters, scores, levels, vocabulary lists, or sentence numbers.

## Transition state

`JourneyProgress.transitionByLanguage` tracks:

- `demonstratedMoments` — each successful speak in a scene
- `patternStrength` — per `milestoneId:momentId` key

`getNativeSupportRatio()` drives how much Chinese Anna uses — continuous, not tiered.

## Adding experiences (post–Sprint 1)

1. Add `lib/milestones/<id>.ts` with `BilingualLine` content
2. Register in `lib/milestones/index.ts`
3. Add coach responses in `lib/coach-session.ts` `COACH_DATA`
4. Reuse sentence patterns across scenes where natural

## Sprint 2 — Anna companion (frozen)

| Layer | Role |
|-------|------|
| `lib/anna-memory.ts` | Persistent memory: attempts, struggles, confidence, days together |
| `lib/anna-companion.ts` | Dynamic welcomes, try-first prompts, life summaries |
| Coach loop | **Try first** → optional NPC demo → encourage → pattern discovery (after success) |

Anna never lectures. Pattern lists appear only after demonstrated understanding.
Scene ends with what the learner can now **do in real life**, not what lesson was completed.

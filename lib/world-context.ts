/**
 * Sprint 11 — Apply world state (time, weather, location) to scenes
 */
import type { Language, LifeMilestone, LivingWorldState } from "./types";
import { bil } from "./milestones/bilingual";
import { getLocationForMilestone, getLocationLabel, getNpcRecallAtLocation, getTravelBridge } from "./germany-map";
import { getWorldAtmosphere, getWeatherSceneNote } from "./world-clock";

export function applyWorldContextToMilestone(
  milestone: LifeMilestone,
  world: LivingWorldState,
  language: Language
): LifeMilestone {
  const locationId = getLocationForMilestone(milestone.id);
  const atmosphere = getWorldAtmosphere(world, language);
  const weatherNote = getWeatherSceneNote(world, language);

  let opening = milestone.opening;
  const travel =
    world.previousLocationId && world.currentLocationId
      ? getTravelBridge(language, world.previousLocationId, world.currentLocationId)
      : null;

  const openingParts = [atmosphere.native, travel?.native, milestone.opening.native].filter(Boolean);
  const openingTarget = [atmosphere.target, travel?.target, milestone.opening.target].filter(Boolean);

  opening = bil(openingParts.join("\n\n"), openingTarget.join("\n\n"));

  const character = world.characterThreads[
    Object.values(world.characterThreads).find((t) =>
      t.remembers.includes(`visited_${locationId}`)
    )?.characterId ?? ""
  ];

  const moments = milestone.moments.map((moment, index) => {
    let sceneBridge = moment.sceneBridge;
    if (index === 0 && weatherNote) {
      sceneBridge = bil(
        `${weatherNote}\n\n${moment.sceneBridge.native}`,
        `${weatherNote}\n\n${moment.sceneBridge.target}`
      );
    }

    if (index === 0 && character && character.interactionCount >= 2) {
      const recall = getNpcRecallAtLocation(
        language,
        locationId,
        character.interactionCount,
        character.remembers
      );
      if (recall && moment.npcLine) {
        return {
          ...moment,
          npcLine: recall,
          sceneBridge,
          variantMeta: {
            ...moment.variantMeta,
            personalityId: moment.variantMeta?.personalityId ?? "warm",
            npcPace: moment.variantMeta?.npcPace ?? "normal",
            npcIntent: "returning_visitor",
            locationId,
          },
        };
      }
    }

    return {
      ...moment,
      sceneBridge,
      variantMeta: {
        ...moment.variantMeta,
        personalityId: moment.variantMeta?.personalityId ?? "warm",
        npcPace: moment.variantMeta?.npcPace ?? "normal",
        locationId,
      },
    };
  });

  const locLabel = getLocationLabel(locationId, language);
  const settingDetail =
    world.weather === "rainy"
      ? bil(
          `${milestone.settingDetail.native} 外面在下雨。`,
          `${milestone.settingDetail.target} Es regnet draußen.`
        )
      : milestone.settingDetail;

  return {
    ...milestone,
    opening,
    settingDetail,
    moments,
    setting: `${locLabel} — ${milestone.setting}`,
  };
}

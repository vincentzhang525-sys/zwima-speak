/**
 * Sprint 9 — Local rule-based provider (current engines)
 * Receives built prompts from the pipeline; executes with existing rule engines.
 */
import { getStaticCoachResponse } from "../../coach-static-response";
import {
  getAnnaMeaningNudge,
  getNpcClarificationLine,
} from "../../anna-intervention";
import { brainMaterializeMilestone } from "../../conversation-brain";
import { getLiveCoachResponse } from "../../conversation-coach";
import { isDynamicMilestone } from "../../conversation-objectives";
import { applyMemoryUpdate } from "../memory";
import { assertAnnaVoice, isAnnaVoicePrompt } from "../../personality";
import type { PipelinedRequest } from "../pipeline";
import type { PromptPackage } from "../prompt";
import { evaluateLearnerLocally } from "../scoring";
import type {
  AIProvider,
  AIProviderConfig,
  EvaluateLearnerInput,
  EvaluateLearnerOutput,
  GenerateCoachReplyInput,
  GenerateCoachReplyOutput,
  GenerateNPCReplyInput,
  GenerateNPCReplyOutput,
  GenerateSceneInput,
  GenerateSceneOutput,
  UpdateMemoryInput,
  UpdateMemoryOutput,
} from "../provider";

export class LocalAIProvider implements AIProvider {
  readonly id = "local" as const;

  private ensureAnnaVoice(prompt: PromptPackage): void {
    if (isAnnaVoicePrompt(prompt.metadata)) {
      assertAnnaVoice(prompt);
    }
  }

  generateScene(req: PipelinedRequest<GenerateSceneInput>): GenerateSceneOutput {
    const { input, prompt } = req;
    this.ensureAnnaVoice(prompt);
    const milestone = brainMaterializeMilestone(
      input.template,
      input.language,
      input.conversationSeed,
      input.memory.anna,
      input.memory.world
    );
    return { milestone };
  }

  generateCoachReply(
    req: PipelinedRequest<GenerateCoachReplyInput>
  ): GenerateCoachReplyOutput {
    const { input, prompt } = req;
    this.ensureAnnaVoice(prompt);
    const {
      language,
      milestoneId,
      moment,
      momentIndex,
      learner,
      kind,
      supportLevel,
      skipExplanation,
    } = input;

    if (kind === "nudge" || kind === "rescue") {
      return {
        message: getAnnaMeaningNudge(
          language,
          moment,
          supportLevel,
          skipExplanation ?? false
        ),
        patternExamples: [],
      };
    }

    if (isDynamicMilestone(milestoneId)) {
      return getLiveCoachResponse(
        language,
        milestoneId,
        moment,
        momentIndex,
        learner,
        {
          responseLatencyMs: input.responseLatencyMs,
          neededDemonstration: input.neededDemonstration,
          targetPhrase: input.targetPhrase,
        }
      );
    }

    return getStaticCoachResponse(language, milestoneId, momentIndex, learner, {
      responseLatencyMs: input.responseLatencyMs,
      neededDemonstration: input.neededDemonstration,
      targetPhrase: input.targetPhrase,
    });
  }

  generateNPCReply(req: PipelinedRequest<GenerateNPCReplyInput>): GenerateNPCReplyOutput {
    const { input, prompt } = req;
    void prompt;
    const { language, moment, kind } = input;
    if (kind === "demo" && moment.npcLine) {
      return { line: moment.npcLine };
    }
    const misunderstood = kind === "misunderstanding";
    return {
      line: getNpcClarificationLine(language, moment, misunderstood),
    };
  }

  evaluateLearner(req: PipelinedRequest<EvaluateLearnerInput>): EvaluateLearnerOutput {
    this.ensureAnnaVoice(req.prompt);
    return evaluateLearnerLocally(req.input);
  }

  updateMemory(req: PipelinedRequest<UpdateMemoryInput>): UpdateMemoryOutput {
    void req.prompt;
    return applyMemoryUpdate(req.input);
  }
}

export function createLocalProvider(_config: AIProviderConfig): LocalAIProvider {
  return new LocalAIProvider();
}

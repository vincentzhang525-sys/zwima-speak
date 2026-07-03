/**
 * Remote AI provider base — consumes PromptPackage and calls an LLM API.
 * Anna personality is enforced on every Anna-voice prompt before the model sees it.
 */
import { assertAnnaVoice, getModelSuppressionDirective, isAnnaVoicePrompt } from "../../personality";
import type { PipelinedRequest } from "../pipeline";
import type { PromptPackage } from "../prompt";
import type {
  AIProvider,
  AIProviderConfig,
  AIProviderId,
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

export abstract class RemoteAIProvider implements AIProvider {
  abstract readonly id: AIProviderId;

  constructor(protected readonly config: AIProviderConfig) {}

  protected requireApiKey(): string {
    if (!this.config.apiKey?.trim()) {
      throw new Error(
        `AI provider "${this.id}" requires an API key. Set apiKey in configureAIProvider().`
      );
    }
    return this.config.apiKey;
  }

  /**
   * Prepare prompt for vendor API. Anna prompts are validated;
   * model personality is explicitly suppressed again at call time.
   */
  protected preparePrompt(prompt: PromptPackage, language: "german" | "english"): PromptPackage {
    if (!isAnnaVoicePrompt(prompt.metadata)) {
      return prompt;
    }

    assertAnnaVoice(prompt);

    return {
      ...prompt,
      system: `${prompt.system}\n\n${getModelSuppressionDirective(language)}`,
      metadata: {
        ...prompt.metadata,
        provider: this.id,
        annaEnforced: "true",
      },
    };
  }

  /** Subclasses call their vendor API with the Anna-prepared prompt */
  protected abstract complete(prompt: PromptPackage): Promise<string>;

  generateScene(_req: PipelinedRequest<GenerateSceneInput>): GenerateSceneOutput {
    throw this.notReady("generateScene");
  }

  generateCoachReply(
    _req: PipelinedRequest<GenerateCoachReplyInput>
  ): GenerateCoachReplyOutput {
    throw this.notReady("generateCoachReply");
  }

  generateNPCReply(_req: PipelinedRequest<GenerateNPCReplyInput>): GenerateNPCReplyOutput {
    throw this.notReady("generateNPCReply");
  }

  evaluateLearner(_req: PipelinedRequest<EvaluateLearnerInput>): EvaluateLearnerOutput {
    throw this.notReady("evaluateLearner");
  }

  updateMemory(_req: PipelinedRequest<UpdateMemoryInput>): UpdateMemoryOutput {
    throw this.notReady("updateMemory");
  }

  private notReady(op: string): Error {
    return new Error(
      `AI provider "${this.id}" — ${op} is not wired yet. Prompt is built; connect the vendor API.`
    );
  }
}

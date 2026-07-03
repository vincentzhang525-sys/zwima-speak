/**
 * Sprint 9 — Provider registry
 *
 * Pipeline: Brain → Memory Engine → Prompt Builder → Provider → Model
 */
import type { AIProvider, AIProviderConfig, AIProviderId, AIProviderFactory } from "../provider";
import { createClaudeProvider } from "./claude";
import { createGeminiProvider } from "./gemini";
import { createLocalProvider } from "./local-provider";
import { createOpenAIProvider } from "./openai";

function createUnimplementedProvider(id: AIProviderId): AIProviderFactory {
  return () => {
    throw new Error(
      `AI provider "${id}" is not implemented yet. Configure providerId: "local".`
    );
  };
}

const PROVIDER_FACTORIES: Partial<Record<AIProviderId, AIProviderFactory>> = {
  local: createLocalProvider,
  openai: createOpenAIProvider,
  claude: createClaudeProvider,
  gemini: createGeminiProvider,
  deepseek: createUnimplementedProvider("deepseek"),
  qwen: createUnimplementedProvider("qwen"),
};

export function createProvider(config: AIProviderConfig): AIProvider {
  const factory = PROVIDER_FACTORIES[config.providerId];
  if (!factory) {
    throw new Error(
      `AI provider "${config.providerId}" is not registered. Use "local" for now.`
    );
  }
  return factory(config);
}

export function registeredProviderIds(): AIProviderId[] {
  return Object.keys(PROVIDER_FACTORIES) as AIProviderId[];
}

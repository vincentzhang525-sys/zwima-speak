import type { AIProviderConfig } from "../provider";
import { RemoteAIProvider } from "./remote-provider";

export class GeminiProvider extends RemoteAIProvider {
  readonly id = "gemini" as const;

  protected async complete(): Promise<string> {
    this.requireApiKey();
    throw new Error("Gemini provider: API call not implemented yet.");
  }
}

export function createGeminiProvider(config: AIProviderConfig): GeminiProvider {
  return new GeminiProvider(config);
}

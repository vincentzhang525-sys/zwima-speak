import type { AIProviderConfig } from "../provider";
import { RemoteAIProvider } from "./remote-provider";

export class OpenAIProvider extends RemoteAIProvider {
  readonly id = "openai" as const;

  protected async complete(): Promise<string> {
    this.requireApiKey();
    throw new Error("OpenAI provider: API call not implemented yet.");
  }
}

export function createOpenAIProvider(config: AIProviderConfig): OpenAIProvider {
  return new OpenAIProvider(config);
}

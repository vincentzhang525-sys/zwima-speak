import type { AIProviderConfig } from "../provider";
import { RemoteAIProvider } from "./remote-provider";

export class ClaudeProvider extends RemoteAIProvider {
  readonly id = "claude" as const;

  protected async complete(): Promise<string> {
    this.requireApiKey();
    throw new Error("Claude provider: API call not implemented yet.");
  }
}

export function createClaudeProvider(config: AIProviderConfig): ClaudeProvider {
  return new ClaudeProvider(config);
}

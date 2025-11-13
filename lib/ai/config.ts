export type AIProvider = "openrouter" | "ollama";

export function getAIProvider(): AIProvider {
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  return "ollama";
}

export function getModel(): string {
  // Reasonable defaults; can be stored in settings table later
  return getAIProvider() === "openrouter" ? "openrouter/anthropic/claude-3.5-sonnet" : "llama3.1:8b";
}



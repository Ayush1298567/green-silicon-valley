// Lightweight AI abstraction with local-first backends
// Default order: Ollama -> LMStudio -> LocalAI
// All callers should use runAIQuery() for short, structured outputs

type RunOptions = {
  temperature?: number;
  maxTokens?: number;
};

const CACHE_LIMIT = 10;
const cache = new Map<string, string>();

function getBackend() {
  const ollama = process.env.OLLAMA_URL || "http://localhost:11434";
  const lmstudio = process.env.LMSTUDIO_URL || "";
  const localAI = process.env.LOCALAI_URL || "";
  return { ollama, lmstudio, localAI };
}

async function tryOllama(prompt: string, options?: RunOptions) {
  const url = `${getBackend().ollama}/api/generate`;
  const model =
    process.env.OLLAMA_MODEL ||
    process.env.AI_MODEL ||
    "llama3";
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.2
      }
    })
  });
  if (!resp.ok) throw new Error(`Ollama error ${resp.status}`);
  const data = await resp.json();
  // Ollama /api/generate returns { response: string }
  return data.response as string;
}

async function tryOpenAICompat(baseUrl: string, prompt: string, options?: RunOptions) {
  const model =
    process.env.OLLAMA_MODEL ||
    process.env.AI_MODEL ||
    "llama3";
  const resp = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 512,
      stream: false
    })
  });
  if (!resp.ok) throw new Error(`OpenAI-compatible error ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function cacheKey(prompt: string) {
  return `${(process.env.OLLAMA_MODEL || "llama3").toLowerCase()}::${prompt.slice(0, 400)}`;
}

function readCache(key: string) {
  return cache.get(key);
}

function writeCache(key: string, value: string) {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, value);
  if (cache.size > CACHE_LIMIT) {
    const first = cache.keys().next().value as string | undefined;
    if (first) cache.delete(first);
  }
}

export async function runAIQuery(prompt: string, options?: RunOptions): Promise<string> {
  const key = cacheKey(prompt);
  const fromCache = readCache(key);
  if (fromCache) return fromCache;

  const { ollama, lmstudio, localAI } = getBackend();
  const backends = [
    async () => tryOllama(prompt, options),
    async () => (lmstudio ? tryOpenAICompat(lmstudio, prompt, options) : Promise.reject()),
    async () => (localAI ? tryOpenAICompat(localAI, prompt, options) : Promise.reject())
  ];

  let lastErr: any;
  for (const fn of backends) {
    try {
      const out = await fn();
      if (out) {
        writeCache(key, out);
        return out;
      }
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr || new Error("No AI backend available");
}



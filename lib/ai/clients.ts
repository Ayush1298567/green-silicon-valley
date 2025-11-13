import { getAIProvider, getModel } from "./config";

export async function generateChatCompletion(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  const provider = getAIProvider();
  const model = getModel();
  if (provider === "openrouter") {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({ model, messages, stream: false })
    });
    if (!resp.ok) throw new Error(`OpenRouter error: ${resp.status}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content ?? "";
  } else {
    const resp = await fetch(`${process.env.OLLAMA_URL ?? "http://localhost:11434"}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false })
    });
    if (!resp.ok) throw new Error(`Ollama error: ${resp.status}`);
    const data = await resp.json();
    return data.message?.content ?? "";
  }
}



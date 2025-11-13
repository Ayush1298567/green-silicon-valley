# Free Local AI Setup

This project defaults to free, local AI using Ollama.

1) Install Ollama
- macOS/Linux: `curl -fsSL https://ollama.com/install.sh | sh`
- Windows: download from https://ollama.com/download

2) Pull models
```
npm run ai:install
```

3) Environment (create `.env.local`)
```
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
# Optional fallbacks:
# LMSTUDIO_URL=http://localhost:1234
# LOCALAI_URL=http://localhost:8080
```

4) Run
```
npm run dev
```

5) Switch model
- Visit `/admin/settings/ai` and select any installed model.
- The list comes from `/api/ai/models`.

Notes
- All AI endpoints use `lib/aiClient.ts` and run locally by default.
- You can enable cloud providers later by adding keys and extending `aiClient`.



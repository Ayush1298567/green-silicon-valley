/* eslint-disable no-console */
import { execSync } from "node:child_process";

function hasCmd(cmd: string) {
  try {
    execSync(process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`, {
      stdio: "ignore"
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const haveOllama = hasCmd("ollama");
  if (!haveOllama) {
    console.log("Ollama not found. Please install from https://ollama.com");
    console.log("On macOS or Linux: curl -fsSL https://ollama.com/install.sh | sh");
    console.log("On Windows: https://ollama.com/download");
    process.exit(1);
  }
  console.log("Pulling recommended models (llama3, mistral, phi3)...");
  try {
    execSync("ollama pull llama3", { stdio: "inherit" });
  } catch {}
  try {
    execSync("ollama pull mistral", { stdio: "inherit" });
  } catch {}
  try {
    execSync("ollama pull phi3", { stdio: "inherit" });
  } catch {}
  console.log(`Ensure Ollama is running at ${ollamaUrl}`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



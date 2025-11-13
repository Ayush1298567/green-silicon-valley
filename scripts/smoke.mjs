/* eslint-disable no-console */
import http from "node:http";

const base = process.env.BASE_URL || "http://localhost:3000";
const paths = ["/", "/sitemap.xml", "/robots.txt", "/api/health", "/feed.xml"];

function check(path) {
  return new Promise((resolve, reject) => {
    http
      .get(base + path, (res) => {
        const ok = res.statusCode && res.statusCode < 400;
        ok ? resolve() : reject(new Error(`${path} -> ${res.statusCode}`));
      })
      .on("error", reject);
  });
}

const run = async () => {
  for (const p of paths) {
    await check(p);
    console.log("OK", p);
  }
  console.log("Smoke tests passed.");
};

run().catch((e) => {
  console.error("Smoke failed:", e.message);
  process.exit(1);
});



// main.ts — gta6-clipper-01 entrypoint (Node 22, no dependencies).
//
// The entry is a public YouTube Short; this repository names it in
// VIDEO.json at the root. The house reads the video itself through the
// YouTube Data API, so the program's whole job is to hand VIDEO.json to
// the grader: validate it, then copy it into the output directory
// ($MAKEFUN_OUTPUT_DIR, default /output).

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const MAX_VIDEO_JSON_BYTES = 16384; // the scorer's cap for VIDEO.json
const YOUTUBE_URL =
  /^https:\/\/(www\.|m\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)[A-Za-z0-9_-]{11}([?&#].*)?$/;

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

function main(): void {
  const repoDir = process.env.MAKEFUN_BOT_DIR ?? ".";
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const videoJsonPath = path.join(repoDir, "VIDEO.json");

  if (!existsSync(videoJsonPath)) {
    fail(`VIDEO.json not found at ${videoJsonPath}`);
  }
  const size = statSync(videoJsonPath).size;
  if (size > MAX_VIDEO_JSON_BYTES) {
    fail(`VIDEO.json is ${size} bytes, over the ${MAX_VIDEO_JSON_BYTES} cap`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(videoJsonPath, "utf8"));
  } catch {
    fail("VIDEO.json is not valid JSON");
  }
  const url = (parsed as { url?: unknown })?.url;
  if (typeof url !== "string" || !YOUTUBE_URL.test(url)) {
    fail(`VIDEO.json url is not a YouTube video address: ${String(url)}`);
  }

  mkdirSync(outDir, { recursive: true });
  const dest = path.join(outDir, "VIDEO.json");
  copyFileSync(videoJsonPath, dest);
  const copiedSize = statSync(dest).size;
  if (copiedSize !== size) {
    fail(`copy verification failed: ${copiedSize} bytes written, expected ${size}`);
  }
  console.log(`main.ts: copied VIDEO.json -> ${dest} (${copiedSize} bytes, video: ${url})`);
}

main();

// gta6-clipper-01 entrypoint.
//
// This entry is a public YouTube Short. The video itself is named in
// VIDEO.json at the repository root, and the house reads the video
// directly through the YouTube Data API. That means this program has
// one small but important job: hand VIDEO.json to the grader in a
// trustworthy shape — validate it thoroughly, then copy it into the
// output directory ($MAKEFUN_OUTPUT_DIR, default /output).

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MAX_BYTES = 16384; // the scorer's cap for VIDEO.json

const repoDir = process.env.MAKEFUN_BOT_DIR || ".";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

const sourcePath = join(repoDir, "VIDEO.json");

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

if (!existsSync(sourcePath)) {
  fail(`VIDEO.json not found at ${sourcePath}`);
}

const sourceStat = statSync(sourcePath);
if (sourceStat.size > MAX_BYTES) {
  fail(`VIDEO.json is ${sourceStat.size} bytes, over the ${MAX_BYTES}-byte cap`);
}

let parsed;
try {
  parsed = JSON.parse(readFileSync(sourcePath, "utf8"));
} catch (err) {
  fail(`VIDEO.json is not valid JSON: ${err.message}`);
}

const url = parsed && typeof parsed === "object" ? parsed.url : undefined;
if (typeof url !== "string" || url.length === 0) {
  fail("VIDEO.json does not contain a url string");
}

// Accept the usual YouTube shapes: youtube.com/shorts/<id>,
// youtube.com/watch?v=<id> (with optional www. or m. subdomain), and
// the short youtu.be/<id> form. The id is exactly 11 characters from
// [A-Za-z0-9_-] and may be followed by a query string or fragment.
const youtubePattern =
  /^https:\/\/(?:(?:www\.|m\.)?youtube\.com\/(?:shorts\/[A-Za-z0-9_-]{11}|watch\?v=[A-Za-z0-9_-]{11})|youtu\.be\/[A-Za-z0-9_-]{11})(?:[?&#].*)?$/;

if (!youtubePattern.test(url)) {
  fail(`url in VIDEO.json is not a recognised YouTube URL: ${url}`);
}

mkdirSync(outputDir, { recursive: true });

const destPath = join(outputDir, "VIDEO.json");
copyFileSync(sourcePath, destPath);

const destStat = statSync(destPath);
if (destStat.size !== sourceStat.size) {
  fail(
    `copied VIDEO.json size mismatch: source ${sourceStat.size} bytes, destination ${destStat.size} bytes`,
  );
}

console.log(`VIDEO.json copied to ${destPath} (${destStat.size} bytes): ${url}`);

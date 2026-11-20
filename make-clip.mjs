// make-clip.mjs — builds the gta6-clipper-01 YouTube Short with ffmpeg.
//
// Source: Rockstar's official GTA VI Trailer 2 (from YouTube), kept
// locally at source/trailer2.mp4. The moment we take is 129.0s into the
// trailer, for 26.0s — the closing montage: Phil's gun-store TV ad,
// Lucia's living-room dance, a helicopter over the swamp, a jetski,
// Jason riding a seaplane wing with a rifle, a night chase, and the
// golden Vice City sunset aerial. It is the densest 26 seconds of the
// trailer and it ends on the most beautiful shot, right where the
// trailer cuts away — here, it cuts to our pitch card instead.
//
// Format rationale: the trailer is letterboxed 2.39:1, so a straight
// centre crop would throw away the edges of every shot. Instead the
// picture is laid full-width over a blurred, darkened copy of itself
// (the standard Shorts reframe), so no action is cropped.
//
// Usage: node make-clip.mjs [source.mp4] [out.mp4]
//        defaults: source/trailer2.mp4 -> clip-final.mp4

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

const repoDir = dirname(fileURLToPath(import.meta.url));
const sourceFile = process.argv[2] || join(repoDir, "source", "trailer2.mp4");
const outputFile = process.argv[3] || join(repoDir, "clip-final.mp4");
const buildDir = join(repoDir, "build");
const segmentFile = join(buildDir, "segment.mp4");
const cardFile = join(buildDir, "card.mp4");

if (!existsSync(sourceFile)) {
  console.error(`error: source file does not exist: ${sourceFile}`);
  process.exit(1);
}

mkdirSync(buildDir, { recursive: true });

function runFfmpeg(args) {
  console.log(`ffmpeg ${args.join(" ")}`);
  execFileSync("ffmpeg", args, { stdio: "inherit" });
}

function escapeDrawtext(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%");
}

// Small helper for one drawtext filter: centred horizontally, white by
// default, black border and a soft shadow, optionally only visible
// inside a [from, to] time window (seconds).
function drawtext(text, size, colour, y, window, borderWidth = 3) {
  const parts = [
    `fontfile=${FONT}`,
    `text='${escapeDrawtext(text)}'`,
    `fontsize=${size}`,
    `fontcolor=${colour}`,
    `borderw=${borderWidth}`,
    "bordercolor=black",
    "shadowcolor=black@0.45",
    "shadowx=2",
    "shadowy=2",
    "x=(w-text_w)/2",
    `y=${y}`,
  ];
  if (window) {
    parts.push(`enable='between(t,${window[0]},${window[1]})'`);
  }
  return `drawtext=${parts.join(":")}`;
}

const ENCODE = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "160k"];

// ---------------------------------------------------------------------
// 1. The 26-second segment, reframed to 1080x1920 with timed text.
// ---------------------------------------------------------------------

const captionFilters = [
  // Hook, up for the first couple of seconds only.
  drawtext("GTA 6 IS PURE CHAOS", 78, "white", 150, [0, 2.2], 4),
  drawtext("watch till the plane part", 42, "white", 248, [0, 2.2], 2),
  // One hype caption per beat of the montage.
  drawtext("ONLY IN VICE CITY", 54, "white", 1300, [0.4, 5.0]),
  drawtext("LUCIA IS ALREADY ICONIC", 54, "white", 1300, [5.0, 9.0]),
  drawtext("THE MAP IS MASSIVE", 54, "white", 1300, [9.0, 13.0]),
  drawtext("HE RODE THE PLANE?!", 54, "white", 1300, [12.3, 14.8]),
  // GTA VI launched on 19 Nov 2026, so this caption says it is out now;
  // the earlier "DROPS MAY 26 2026" wording was the outdated schedule.
  drawtext("GTA VI IS OUT NOW", 54, "white", 1300, [14.8, 25.8]),
];

const segmentFilter = [
  "[0:v]split=2[bg][fg]",
  "[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=55,eq=brightness=-0.20:saturation=0.85[bgdone]",
  "[fg]scale=1080:-2[fgdone]",
  `[bgdone][fgdone]overlay=(W-w)/2:(H-h)/2,${captionFilters.join(",")},fps=30,setsar=1,format=yuv420p[vout]`,
  "[0:a]afade=t=in:st=0:d=0.15,afade=t=out:st=24.6:d=1.4,aresample=48000[aout]",
].join(";");

runFfmpeg([
  "-y",
  "-ss", "129",
  "-t", "26",
  "-i", sourceFile,
  "-filter_complex", segmentFilter,
  "-map", "[vout]",
  "-map", "[aout]",
  ...ENCODE,
  segmentFile,
]);

// ---------------------------------------------------------------------
// 2. The 3.5-second pitch card on a dark plum background.
// ---------------------------------------------------------------------

const cardText = [
  drawtext("ENJOYED THAT CLIP?", 54, "white", 690),
  drawtext("make.fun", 138, "0xff5da2", 790),
  drawtext("Make clips like this with AI", 57, "white", 985),
  drawtext("and earn money on make.fun", 57, "white", 1060),
  drawtext("make.fun/bounty/gta6-clipper-01", 40, "0xffd166", 1200),
];

const cardFilter = `[0:v]${cardText.join(",")},fps=30,setsar=1,format=yuv420p[vout]`;

runFfmpeg([
  "-y",
  "-f", "lavfi",
  "-i", "color=c=0x14060f:s=1080x1920:r=30:d=3.5",
  "-f", "lavfi",
  "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
  "-t", "3.5",
  "-filter_complex", cardFilter,
  "-map", "[vout]",
  "-map", "1:a",
  ...ENCODE,
  "-shortest",
  cardFile,
]);

// ---------------------------------------------------------------------
// 3. Join segment + card into the final Short.
// ---------------------------------------------------------------------

runFfmpeg([
  "-y",
  "-i", segmentFile,
  "-i", cardFile,
  "-filter_complex", "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[vout][aout]",
  "-map", "[vout]",
  "-map", "[aout]",
  ...ENCODE,
  "-movflags", "+faststart",
  outputFile,
]);

console.log(`done: wrote ${outputFile}`);

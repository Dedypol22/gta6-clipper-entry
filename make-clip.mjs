// make-clip.mjs — builds our gta6-clipper-01 YouTube Short.
//
// Creative decision (made by the agent, in session):
//   Source: Rockstar's official Grand Theft Auto VI Trailer 2 (YouTube).
//   Moment: 02:09.0 -> 02:35.0 of the trailer, the closing montage —
//     Phil's gun-store TV ad, Lucia's living-room dance, a helicopter over
//     the swamp, a jetski, Jason riding a seaplane wing with a rifle, a
//     night chase, and the golden Vice City sunset aerial. It is the
//     densest 26 seconds of the trailer: no slow beat, and it ends on the
//     most beautiful shot, which is where we cut to the pitch card.
//   Format: vertical 1080x1920. The trailer is letterboxed 2.39:1, so the
//     picture is laid full-width over a blurred, darkened copy of itself —
//     the standard Shorts reframe — so no action is cropped away.
//   Text: a hook in the first two seconds, one hype caption per beat, and
//     a closing pitch card that names make.fun and tells viewers they can
//     make clips like this with AI and earn money on make.fun.
//
// Usage: node make-clip.mjs [source.mp4] [out.mp4]
// Defaults: source/trailer2.mp4 -> clip-final.mp4

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const SRC = process.argv[2] ?? "source/trailer2.mp4";
const OUT = process.argv[3] ?? "clip-final.mp4";
const WORK = "build";
const START = 129.0; // seconds into Trailer 2
const DUR = 26.0; // the montage
const CARD_DUR = 3.5; // the make.fun pitch card

function run(bin, args) {
  console.log(`\n$ ${bin} ${args.slice(0, 6).join(" ")} ...`);
  execFileSync(bin, args, { stdio: "inherit" });
}

function dt(text, { size, color = "white", y, from = null, to = null, border = 3 }) {
  const enable =
    from === null ? "" : `:enable='between(t,${from},${to})'`;
  return (
    `drawtext=fontfile=${FONT}:text='${text}':fontsize=${size}` +
    `:fontcolor=${color}:borderw=${border}:bordercolor=black` +
    `:shadowcolor=black@0.55:shadowx=2:shadowy=2` +
    `:x=(w-text_w)/2:y=${y}${enable}`
  );
}

// Timed captions for the montage beats (times relative to the cut).
const CAPTIONS = [
  { text: "ONLY IN VICE CITY", from: 0.4, to: 5.0 },
  { text: "LUCIA IS ALREADY ICONIC", from: 5.0, to: 9.0 },
  { text: "THE MAP IS MASSIVE", from: 9.0, to: 13.0 },
  { text: "HE RODE THE PLANE?!", from: 12.3, to: 14.8 },
  { text: "GTA VI DROPS MAY 26 2026", from: 14.8, to: 25.8 },
];

function buildSegment() {
  const filters = [
    "[0:v]split=2[bg][fg]",
    "[bg]scale=1080:1920:force_original_aspect_ratio=increase," +
      "crop=1080:1920,gblur=sigma=55,eq=brightness=-0.20:saturation=0.85[bgb]",
    "[fg]scale=1080:-2[fgs]",
    "[bgb][fgs]overlay=(W-w)/2:(H-h)/2[comp]",
  ];
  let last = "[comp]";
  // Hook: big line plus a smaller promise, gone after 2.2 s.
  filters.push(
    `${last}${dt("GTA 6 IS PURE CHAOS", { size: 78, y: 150, from: 0, to: 2.2, border: 4 })}[h1]`
  );
  last = "[h1]";
  filters.push(
    `${last}${dt("watch till the plane part", { size: 42, y: 248, from: 0, to: 2.2 })}[h2]`
  );
  last = "[h2]";
  CAPTIONS.forEach((c, i) => {
    const tag = `[cap${i}]`;
    filters.push(
      `${last}${dt(c.text, { size: 54, y: 1300, from: c.from, to: c.to })}${tag}`
    );
    last = tag;
  });
  filters.push(`${last}fps=30,setsar=1,format=yuv420p[vout]`);
  filters.push(
    "[0:a]afade=t=in:st=0:d=0.15,afade=t=out:st=24.6:d=1.4," +
      "aresample=48000[aout]"
  );
  run("ffmpeg", [
    "-y", "-ss", String(START), "-i", SRC, "-t", String(DUR),
    "-filter_complex", filters.join(";"),
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-c:a", "aac", "-b:a", "160k",
    path.join(WORK, "segment.mp4"),
  ]);
}

function buildCard() {
  const lines = [
    dt("ENJOYED THAT CLIP?", { size: 54, y: 690 }),
    dt("make.fun", { size: 138, y: 790, color: "0xff5da2", border: 4 }),
    dt("Make clips like this with AI", { size: 57, y: 985 }),
    dt("and earn money on make.fun", { size: 57, y: 1060 }),
    dt("make.fun/bounty/gta6-clipper-01", { size: 40, y: 1200, color: "0xffd166" }),
  ];
  run("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", `color=c=0x14060f:s=1080x1920:r=30:d=${CARD_DUR}`,
    "-f", "lavfi", "-i", "anullsrc=cl=stereo:r=48000",
    "-t", String(CARD_DUR),
    "-vf", lines.join(",") + ",format=yuv420p",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-c:a", "aac", "-b:a", "160k", "-shortest",
    path.join(WORK, "card.mp4"),
  ]);
}

function join() {
  run("ffmpeg", [
    "-y",
    "-i", path.join(WORK, "segment.mp4"),
    "-i", path.join(WORK, "card.mp4"),
    "-filter_complex", "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]",
    "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart",
    OUT,
  ]);
}

if (!existsSync(SRC)) {
  console.error(`source not found: ${SRC}`);
  process.exit(1);
}
mkdirSync(WORK, { recursive: true });
buildSegment();
buildCard();
join();
console.log(`\nDone: ${OUT} (${DUR}s montage + ${CARD_DUR}s pitch card)`);
